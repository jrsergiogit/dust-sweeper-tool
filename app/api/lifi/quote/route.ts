import { NextResponse } from 'next/server';
import { COMMISSION_WALLET, DENIED_EXCHANGES, NATIVE_ADDRESS, RECOVERY_FEE, RECOVERY_INTEGRATOR, RECOVERY_MAX_PRICE_IMPACT, RECOVERY_SLIPPAGE } from '../../../lib/lifi-config';
import { hasAllowedOrigin, rateAllowed, readSmallJson } from '../../../lib/server/request-guard';

export const runtime = 'nodejs';
const CHAINS = new Set([1, 56, 137, 42161, 8453, 10, 43114]);
const address = /^0x[0-9a-fA-F]{40}$/;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403, headers });
  if (!await rateAllowed(request, 'quote', 30, 60)) {
    return NextResponse.json({ error: 'Please wait a minute before checking again.', category: 'rate_limited' }, { status: 429, headers: { ...headers, 'Retry-After': '60' } });
  }
  let input: Record<string, unknown>;
  try {
    const body = await readSmallJson(request, 2500);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_JSON');
    input = body as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid quote request', category: 'invalid_request' }, { status: 400, headers });
  }
  const chain = Number(input.chainId);
  const fromToken = String(input.fromToken || '');
  const fromAddress = String(input.fromAddress || '');
  const amount = String(input.fromAmount || '');
  if (!CHAINS.has(chain) || !address.test(fromToken) || !address.test(fromAddress)
      || !/^\d{1,78}$/.test(amount) || BigInt(amount) <= 0n || BigInt(amount) >= 2n ** 256n) {
    return NextResponse.json({ error: 'Invalid quote parameters', category: 'invalid_request' }, { status: 400, headers });
  }
  if (fromToken.toLowerCase() === NATIVE_ADDRESS) {
    return NextResponse.json({ error: 'Choose a different destination token or network in LI.FI.', category: 'destination_required' }, { status: 400, headers });
  }
  // The server owns fees, integrator, destination policy and denied tools.
  // No caller-supplied URL or upstream credentials are accepted.
  const params = new URLSearchParams({
    fromChain: String(chain), toChain: String(chain), fromToken, toToken: NATIVE_ADDRESS,
    fromAddress, toAddress: fromAddress, fromAmount: amount,
    slippage: String(RECOVERY_SLIPPAGE), integrator: RECOVERY_INTEGRATOR,
    fee: String(RECOVERY_FEE), referrer: COMMISSION_WALLET,
    maxPriceImpact: String(RECOVERY_MAX_PRICE_IMPACT), skipSimulation: 'false',
    denyExchanges: DENIED_EXCHANGES.join(','),
    // Omit CHEAPEST: let LI.FI choose its recommended/default quote.
  });
  const apiKey = process.env.LIFI_SWEEPER_API_KEY || process.env.LIFI_API_KEY || process.env.NEXT_PUBLIC_LIFI_SWEEPER_KEY;
  try {
    const response = await fetch(`https://li.quest/v1/quote?${params}`, {
      headers: apiKey ? { 'x-lifi-api-key': apiKey } : {}, cache: 'no-store',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]),
    });
    if (!response.ok) {
      const limited = response.status === 429;
      const noRoute = response.status === 404;
      return NextResponse.json({
        category: limited ? 'rate_limited' : noRoute ? 'no_route' : 'provider_error',
        error: limited ? 'The route service is busy. Please try again shortly.'
          : noRoute ? 'No initial quote was found for this asset and amount.' : 'The initial quote could not be checked. You can still review options in LI.FI.',
      }, { status: limited ? 429 : noRoute ? 404 : 502,
        headers: { ...headers, ...(limited ? { 'Retry-After': response.headers.get('retry-after') || '60' } : {}) } });
    }
    const quote = await response.json();
    if (!quote || typeof quote !== 'object' || !quote.estimate) throw new Error('Invalid provider response');
    return NextResponse.json({ quote }, { headers });
  } catch (error) {
    return NextResponse.json({
      error: 'The initial check timed out or could not finish. Review current options in LI.FI.',
      category: error instanceof Error && /timeout|abort/i.test(error.name) ? 'timeout' : 'provider_error',
    }, { status: 502, headers });
  }
}
