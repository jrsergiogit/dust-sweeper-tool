import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: "https://dustsweepertool.com/blog/stop-wasting-gas" },
  title: "Stop Wasting Gas: Consolidate Crypto Dust Into One Chain",
  description: "Tired of high fees trapping small balances? Learn how to sweep supported wallet balances and bridge assets into your favorite wallet.",
};

export default function Post3() {
  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6 font-sans">
      <article className="max-w-4xl mx-auto border border-blue-900/20 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <header className="mb-10">
              <div className="text-blue-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Gas Optimization</div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">Stop Wasting <span className="text-blue-400">Gas Fees</span></h1>
              <p className="text-lg text-gray-400 font-light">"Consolidate your entire multi-chain portfolio into one single asset."</p>
            </header>

            <section className="space-y-6 text-gray-400 text-md leading-relaxed">
              <p>Every time you swap on a different chain, you leave a "dust" trail. In 2026, these micro-balances across 20 chains can add up to <strong>hundreds of dollars</strong>.</p>
              <h2 className="text-white font-bold uppercase text-sm tracking-widest">The Multi-Chain Mess</h2>
              <p>The problem? Moving $5 of dust on Ethereum costs $15 in gas. It's a mathematical trap.</p>
              <p><strong>Dust Sweeper Protocol</strong> solves this by aggregating these small amounts and bridging them efficiently using LI.FI and Alchemy infrastructure.</p>
            </section>
          </div>

          <div className="md:w-1/3 flex flex-col justify-center">
            <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl text-center shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-4">The Verdict</h3>
              <p className="text-sm text-blue-100 mb-8 opacity-80 italic text-left">"A must-have tool for DeFi power users and airdrop farmers."</p>
              <a href="/" className="block w-full py-4 bg-white text-blue-900 font-bold rounded-xl text-xs uppercase tracking-tighter hover:bg-gray-100 transition-all">
                Clean My Wallet
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}