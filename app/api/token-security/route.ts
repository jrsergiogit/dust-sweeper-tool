import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_CHAIN_IDS = new Set(['1', '56', '137', '42161', '10', '8453', '43114']);

export async function GET(request: NextRequest) {
  const chainId = request.nextUrl.searchParams.get('chainId') || '';
  const address = (request.nextUrl.searchParams.get('address') || '').trim().toLowerCase();

  if (!SUPPORTED_CHAIN_IDS.has(chainId) || !/^0x[a-f0-9]{40}$/.test(address)) {
    return NextResponse.json({ status: 'empty' }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`,
      { cache: 'no-store', signal: AbortSignal.timeout(10000) }
    );
    if (!upstream.ok) return NextResponse.json({ status: 'error' }, { status: 502 });
    const data = await upstream.json();
    const raw = data?.result?.[address];
    if (!raw || typeof raw !== 'object') return NextResponse.json({ status: 'empty' });

    const numeric = (value: unknown) => {
      if (value === null || value === undefined || value === '') return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };
    return NextResponse.json({
      status: 'success',
      result: {
        isHoneypot: raw.is_honeypot,
        isBlacklisted: raw.is_blacklisted,
        canTakeBackOwnership: raw.can_take_back_ownership,
        hiddenOwner: raw.hidden_owner,
        transferPausable: raw.transfer_pausable,
        isMintable: raw.is_mintable,
        buyTax: numeric(raw.buy_tax) === null ? null : numeric(raw.buy_tax)! * 100,
        sellTax: numeric(raw.sell_tax) === null ? null : numeric(raw.sell_tax)! * 100,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 502 });
  }
}
