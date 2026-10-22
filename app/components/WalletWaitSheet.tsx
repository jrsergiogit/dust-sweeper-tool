'use client';
import { useEffect, useState } from 'react';

type Props = {
  status: string;               // 'approval' | 'waiting' | 'started' | ...
  relayerOn: boolean;
  onToggleRelayer: () => void;
  onShown?: (status: string) => void;
};

/** Bottom sheet: aparece quando o site aguarda a carteira ha 8s+ (o botao de aprovar nao apareceu). */
export default function WalletWaitSheet({ status, relayerOn, onToggleRelayer, onShown }: Props) {
  const waiting = ['approval', 'waiting', 'started'].includes(status);
  const [stuckFor, setStuckFor] = useState('');
  const [dismissedFor, setDismissedFor] = useState('');
  useEffect(() => {
    if (!waiting) return;
    const t = window.setTimeout(() => { setStuckFor(status); onShown?.(status); }, 8000);
    return () => { window.clearTimeout(t); setStuckFor(''); setDismissedFor(''); };
  }, [waiting, status]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!waiting || stuckFor !== status || dismissedFor === status) return null;
  return (
    <div role="dialog" aria-label="Waiting for your wallet" className="fixed inset-x-0 bottom-0 z-[60] px-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="mx-auto max-w-lg rounded-2xl border border-purple-400/40 bg-[#12101c] p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-bold text-white">{status === 'approval' ? 'Waiting for the approval in your wallet' : 'Waiting for your confirmation'}</p>
          <button type="button" aria-label="Close" onClick={() => setDismissedFor(status)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 text-gray-300">✕</button>
        </div>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-gray-200">
          <li>Look for the request in your wallet: it opens as a panel at the bottom of the screen or in the <b>Activity</b> tab.</li>
          <li>Make sure the wallet is on the network shown here and has a little of that network&apos;s coin to pay the gas fee.</li>
          {status !== 'started' && <li>Still nothing? {relayerOn ? 'Switch to standard approval below. It asks for a regular approval transaction instead of a signature.' : 'Try signature mode below.'}</li>}
        </ol>
        {status !== 'started' && (
          <button type="button" onClick={() => { setDismissedFor(status); onToggleRelayer(); }} className="mt-3 min-h-12 w-full rounded-xl border border-purple-300/40 bg-purple-500/10 px-4 text-sm font-semibold text-purple-100">
            {relayerOn ? 'Switch to standard approval' : 'Try signature mode'}
          </button>
        )}
        <p className="mt-2 text-xs leading-5 text-gray-400">Switching reloads only the swap form. Nothing is sent until you confirm in your wallet.</p>
      </div>
    </div>
  );
}
