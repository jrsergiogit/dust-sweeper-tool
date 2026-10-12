'use client';
import { useState } from 'react';

type Props = {
  address: string; busy: boolean; error: string;
  onAddressChange: (value: string) => void; onScan: () => void;
};

/** Public-address scan only. No wallet connection or transaction on this screen. */
export default function FinderIntro({ address, busy, error, onAddressChange, onScan }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <section aria-labelledby="finder-title" className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0e18] shadow-2xl">
      <img src="/Dust%20Sweeper%20Rescue%20Funds.jpg" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0c0e18] via-[#0c0e18]/90 to-[#0c0e18]/60" />
      <div className="relative grid gap-5 p-5 sm:gap-7 sm:p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10 lg:p-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-300">Dust Finder</p>
          <h1 id="finder-title" className="mt-3 max-w-lg text-[28px] font-black leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
  Find forgotten crypto.<br />
  <span className="text-[18px] leading-tight text-purple-300 sm:text-[30px] lg:text-[28px]">
    Discover what you can recover.
  </span>
</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-gray-200 lg:text-[17px]">Scan a public wallet address across networks. Review your assets and recovery options.</p>
          <div className="mt-5 hidden gap-2 text-[15px] leading-6 text-gray-200 lg:grid">
            <p><span className="mr-2 text-emerald-300" aria-hidden="true">&#10003;</span>No wallet connection to scan</p>
            <p><span className="mr-2 text-emerald-300" aria-hidden="true">&#10003;</span>No private key or seed phrase</p>
            <p><span className="mr-2 text-emerald-300" aria-hidden="true">&#10003;</span>You approve transactions in your wallet</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#10121d]/95 p-4 shadow-xl sm:p-6" aria-busy={busy}>
          <h2 className="text-xl font-bold text-white">Start with a free scan</h2>
          <form className="mt-4" onSubmit={event => { event.preventDefault(); if (!busy) onScan(); }}>
            <label htmlFor="finder-address" className="mb-2 block text-[15px] font-medium text-gray-200">Public wallet address</label>
            <input id="finder-address" name="wallet-address" type="text" value={address}
              onChange={event => onAddressChange(event.target.value)} disabled={busy}
              aria-invalid={Boolean(error)} aria-describedby="finder-help finder-error"
              autoComplete="off" autoCapitalize="none" spellCheck={false}
              placeholder="Paste address starting with 0x..."
              className="h-14 w-full min-w-0 rounded-xl border border-white/20 bg-black/40 px-3 text-base text-white placeholder:text-gray-400 disabled:opacity-60" />
            {error && <p id="finder-error" role="alert" className="mt-2 text-sm leading-5 text-red-300">{error}</p>}
            <button type="submit" disabled={busy} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-base font-bold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-wait disabled:opacity-70">
              {busy && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {busy ? 'Scanning your wallet...' : 'Scan my wallet'}
            </button>
            <p id="finder-help" className="mt-3 text-center text-sm leading-6 text-gray-300">Read-only scan. No wallet connection required.</p>
            {busy && <p role="status" aria-live="polite" className="mt-3 text-sm leading-5 text-purple-200">Checking balances on 7 supported networks. This may take a moment.</p>}
          </form>
          <button type="button" aria-expanded={showHelp} aria-controls="address-help" onClick={() => setShowHelp(!showHelp)} className="mt-2 min-h-11 text-left text-[15px] font-medium leading-6 text-purple-200 underline decoration-purple-300/60 underline-offset-4 transition-colors hover:text-white">Where do I find my wallet address?</button>
          {showHelp && <p id="address-help" className="mt-1 rounded-xl border border-white/10 p-3 text-[15px] leading-6 text-gray-200">Open your wallet, choose your account and use its Copy address button. Paste the public address beginning with 0x here. Never enter a recovery phrase or private key.</p>}
        </div>
      </div>
      <div className="relative border-t border-white/10 bg-[#090c16]/80 px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
        <div aria-label="Dust Sweeper directory listings" className="mx-auto grid max-w-[680px] grid-cols-2 gap-3 sm:gap-4">
          <a href="https://www.alchemy.com/dapps/dust-sweeper-tool" target="_blank" rel="noopener noreferrer"
            aria-label="View Dust Sweeper on Alchemy (opens in a new tab)"
            className="group flex min-h-[92px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-3 transition-colors hover:border-purple-400/40 hover:bg-white/[0.08] sm:min-h-[104px] sm:px-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-300">Listed on <span aria-hidden="true">&#8599;</span></span>
            <img src="/alchemy-logo.png" alt="Alchemy" width={288} height={62} className="h-auto w-full max-w-[176px] object-contain sm:max-w-[200px]" />
          </a>
          <a href="https://dappradar.com/dapp/dust-sweeper-tool" target="_blank" rel="noopener noreferrer"
            aria-label="View Dust Sweeper on DappRadar (opens in a new tab)"
            className="group flex min-h-[92px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-3 transition-colors hover:border-blue-400/40 hover:bg-white/[0.08] sm:min-h-[104px] sm:px-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-300">Listed on <span aria-hidden="true">&#8599;</span></span>
            <img src="/dappradar-logo.png" alt="DappRadar" width={1200} height={227} className="h-auto w-full max-w-[192px] object-contain sm:max-w-[224px]" />
          </a>
        </div>
        <p className="mt-3 text-center text-xs leading-5 text-gray-400"><span className="font-semibold text-gray-300">Scan coverage:</span> Ethereum, BNB Chain, Polygon, Arbitrum, Base, Optimism and Avalanche.</p>
      </div>
    </section>
  );
}
