import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: "https://dustsweepertool.com/blog/hidden-airdrops-2026" },
  title: "Hidden Airdrops 2026: Find Forgotten Tokens on Supported Networks",
  description: "Discover unclaimed tokens and forgotten airdrops on supported networks. Use the scanner to review balances on the networks it currently queries.",
};

export default function Post2() {
  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6 font-sans">
      <article className="max-w-3xl mx-auto border border-emerald-900/20 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <header className="mb-10 text-center">
          <div className="text-emerald-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Profit Strategy</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Hidden <span className="text-emerald-400 font-light italic">Airdrops</span> 2026</h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed">"You might have thousands of dollars sitting in forgotten L2 wallets. It's time to claim them."</p>
        </header>

        <section className="space-y-8 text-gray-300 text-lg leading-relaxed">
          <p>The Web3 explosion of 2026 has left millions of users with <strong>fragmented wealth</strong>. New networks like <em>Scroll, Linea, and Base</em> often distribute rewards that go unnoticed by standard wallet interfaces.</p>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">How to Deep-Scan for Assets</h2>
          <p>Standard explorers only show primary tokens. Dust Finder currently uses Alchemy to review balances across 7 networks; other cross-chain actions are powered by LI.FI when a supported route exists.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
            <div className="p-4 bg-emerald-900/5 border border-emerald-900/20 rounded-xl">
              <h3 className="text-emerald-400 font-bold mb-2">L2 Rewards</h3>
              <p className="text-xs text-gray-500 font-light">Find unclaimed governance tokens on Arbitrum and Optimism.</p>
            </div>
            <div className="p-4 bg-emerald-900/5 border border-emerald-900/20 rounded-xl">
              <h3 className="text-emerald-400 font-bold mb-2">Meme Dust</h3>
              <p className="text-xs text-gray-500 font-light">Identify viral tokens on Solana and Base that gained value while you were away.</p>
            </div>
          </div>

          <div className="mt-16 text-center text-white">
             <p className="mb-6 text-gray-500 text-sm italic">Stop leaving money on the table.</p>
             <a href="/" className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl transform hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                style={{ background: 'linear-gradient(90deg, #10b981 0%, #064e3b 100%)' }}>
               FIND MY FORGOTTEN FUNDS
             </a>
          </div>
        </section>
      </article>
    </div>
  );
}