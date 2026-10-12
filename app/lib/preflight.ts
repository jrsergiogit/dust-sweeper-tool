import { NATIVE_ADDRESS } from './lifi-config';

export type PreflightState = {
  status: 'idle' | 'checking' | 'quote' | 'incomplete' | 'wrong-network' | 'needs-approval' | 'unchecked' | 'simulation-failed' | 'insufficient-gas' | 'no-route' | 'error';
  message?: string; tool?: string; category?: string;
};
export type ReadOnlyProvider = { request(args: { method: string; params?: unknown[] }): Promise<any> };
export type PreflightInput = { chainId: string; fromToken: string; fromAddress: string; fromAmount: string };

/** Advisory only: this quote never becomes a widget route or a transaction. */
export async function checkInitialQuote(
  input: PreflightInput, signal: AbortSignal,
  provider?: ReadOnlyProvider, fetcher: typeof fetch = fetch,
): Promise<PreflightState> {
  if (input.fromToken.toLowerCase() === NATIVE_ADDRESS) return { status: 'idle' };
  const checkAbort = () => { if (signal.aborted) throw new DOMException('Aborted', 'AbortError'); };
  try {
    checkAbort();
    const response = await fetcher('/api/lifi/quote', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
      cache: 'no-store', signal,
    });
    const body = await response.json(); checkAbort();
    if (!response.ok) return {
      status: body?.category === 'no_route' ? 'no-route' : 'error',
      category: body?.category || 'provider_error',
      message: typeof body?.error === 'string' ? body.error : 'The initial check could not be completed. Review options in LI.FI.',
    };
    const quote = body?.quote;
    const tool = String(quote?.toolDetails?.key || quote?.tool || '').slice(0, 80);
    if (!quote?.estimate?.toAmount || !quote?.estimate?.fromAmount || !tool) {
      return { status: 'incomplete', category: 'incomplete_quote', message: 'The initial quote is incomplete. Only the options shown inside LI.FI can be reviewed for execution.' };
    }
    const base = { tool, message: 'An initial quote was found. LI.FI will fetch the current route, approvals and costs separately.' };
    if (!quote?.transactionRequest?.to || !quote?.transactionRequest?.data) {
      return { ...base, status: 'incomplete', category: 'missing_transaction', message: 'An initial estimate was found, but transaction details have not been verified. Review the actual route in LI.FI.' };
    }
    if (!provider) return { ...base, status: 'unchecked' };
    let chain: unknown;
    let accounts: unknown;
    try {
      chain = await provider.request({ method: 'eth_chainId' }); checkAbort();
      if (BigInt(String(chain)) !== BigInt(input.chainId)) {
        return { ...base, status: 'wrong-network', category: 'wrong_network', message: 'Your browser extension is on a different network. The initial wallet check was skipped; use the correct wallet and network when LI.FI asks.' };
      }
      accounts = await provider.request({ method: 'eth_accounts' }); checkAbort();
    } catch (error) {
      checkAbort(); return { ...base, status: 'unchecked' };
    }
    if (!Array.isArray(accounts) || !accounts.some(a => String(a).toLowerCase() === input.fromAddress.toLowerCase())) {
      return { ...base, status: 'unchecked' };
    }
    const spender = String(quote.estimate.approvalAddress || '');
    if (!/^0x[a-fA-F0-9]{40}$/.test(spender)) return { ...base, status: 'unchecked' };
    try {
      // Read-only calls. Never request connection, approval or network switching here.
      const data = `0xdd62ed3e${input.fromAddress.slice(2).padStart(64, '0')}${spender.slice(2).padStart(64, '0')}`;
      const allowance = await provider.request({ method: 'eth_call', params: [{ to: input.fromToken, data }, 'latest'] }); checkAbort();
      if (BigInt(allowance || '0') < BigInt(input.fromAmount)) return { ...base, status: 'needs-approval', message: 'This initial quote would need token approval. Review the actual approval and costs in LI.FI before confirming.' };
      // Re-check the chain immediately before simulation; the user can switch networks mid-request.
      const currentChain = await provider.request({ method: 'eth_chainId' }); checkAbort();
      if (BigInt(currentChain) !== BigInt(input.chainId)) return { ...base, status: 'unchecked' };
      const tx = quote.transactionRequest;
      if (tx.chainId != null && BigInt(tx.chainId) !== BigInt(input.chainId)) return { ...base, status: 'incomplete', category: 'quote_network_mismatch' };
      await provider.request({ method: 'eth_estimateGas', params: [{ from: input.fromAddress, to: tx.to, data: tx.data, value: tx.value || '0x0' }] });
      checkAbort();
      return { ...base, status: 'quote' }; // Not a promise that the widget's route will execute.
    } catch (error) {
      checkAbort();
      const text = error instanceof Error ? error.message.toLowerCase() : String((error as any)?.message || '').toLowerCase();
      return {
        tool, status: /insufficient funds|gas balance|funds for gas/.test(text) ? 'insufficient-gas' : 'simulation-failed',
        category: /insufficient funds|gas balance|funds for gas/.test(text) ? 'insufficient_gas' : 'simulation_failed',
        message: /insufficient funds|gas balance|funds for gas/.test(text)
          ? 'The browser extension reported insufficient funds for gas during the initial check. Review the required network currency in LI.FI.'
          : 'The browser extension could not complete the initial simulation. This does not establish that the asset or route is unsafe; review LI.FI details.',
      };
    }
  } catch (error) {
    checkAbort();
    return { status: 'error', category: 'provider_error', message: 'The initial check could not finish. You can still review current options inside LI.FI.' };
  }
}
