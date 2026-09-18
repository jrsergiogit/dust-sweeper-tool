import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
const NETWORKS = ['eth-mainnet','bnb-mainnet','polygon-mainnet','arb-mainnet','base-mainnet','opt-mainnet','avax-mainnet'] as const;

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const rateLimitStore = new Map<string, number[]>();

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recentRequests = (rateLimitStore.get(ip) || []).filter(timestamp => now - timestamp < RATE_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT) {
    rateLimitStore.set(ip, recentRequests);
    return true;
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return false;
}

function isValidAddress(address: string) { return /^0x[a-fA-F0-9]{40}$/.test(address.trim()); }

function rawToNumber(raw: string, decimals: number) {
  try {
    const value = raw?.startsWith('0x') ? BigInt(raw) : BigInt(raw || '0');
    const d = Math.max(0, Math.min(36, Number(decimals) || 0));
    const base = 10n ** BigInt(d);
    const whole = value / base;
    const fraction = value % base;

    if (fraction === 0n) return Number(whole);

    const text = fraction.toString().padStart(d,'0').replace(/0+$/,'');
    const n = Number(`${whole.toString()}.${text}`);

    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "You've reached the hourly scan limit. Please try again later." },
      { status: 429, headers: { 'Retry-After': '3600' } }
    );
  }

  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({error:'Missing ALCHEMY_API_KEY'},{status:500});
  }

  let body: {address?: string};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error:'Invalid JSON body'},{status:400});
  }

  const address = typeof body.address === 'string' ? body.address.trim() : '';

  if (!isValidAddress(address)) {
    return NextResponse.json({error:'Invalid wallet address'},{status:400});
  }

  const response = await fetch(`https://api.g.alchemy.com/data/v1/${apiKey}/assets/tokens/by-address`, {
    method:'POST',
    headers:{'content-type':'application/json'},
    cache:'no-store',
    body: JSON.stringify({
      addresses:[{address,networks:[...NETWORKS]}],
      withMetadata:true,
      withPrices:true,
      includeNativeTokens:true,
      includeErc20Tokens:true
    })
  });

  const data = await response.json().catch(()=>null);

  if (!response.ok) {
    return NextResponse.json(
      {error:data?.error?.message||data?.message||'Alchemy request failed'},
      {status:response.status}
    );
  }

  const source = Array.isArray(data?.data?.tokens) ? data.data.tokens : [];

  const tokens = source.map((token:any)=>{
    const meta=token?.tokenMetadata||{};
    const decimals=Number(meta.decimals??18);
    const balance=rawToNumber(token?.tokenBalance||'0x0',decimals);
    const priceUsd=Number(token?.tokenPrices?.find((p:any)=>String(p?.currency).toLowerCase()==='usd')?.value??0);
    const valueUsd=balance*priceUsd;

    return {
      network:token?.network||'unknown',
      tokenAddress:token?.tokenAddress||null,
      symbol:meta.symbol||(token?.tokenAddress?'TOKEN':'NATIVE'),
      name:meta.name||meta.symbol||'Unknown token',
      logo:meta.logo||null,
      decimals,
      balance,
      priceUsd:Number.isFinite(priceUsd)?priceUsd:0,
      valueUsd:Number.isFinite(valueUsd)?valueUsd:0
    };
  }).filter((t:any)=>t.balance>0).sort((a:any,b:any)=>b.valueUsd-a.valueUsd);

  const dust=tokens.filter((t:any)=>t.valueUsd>0&&t.valueUsd<=5);
  const dustValue=dust.reduce((s:number,t:any)=>s+t.valueUsd,0);
  const totalValue=tokens.reduce((s:number,t:any)=>s+t.valueUsd,0);

  return NextResponse.json({
    address,
    tokens,
    dust,
    dustValue,
    totalValue,
    networks:NETWORKS
  });
}