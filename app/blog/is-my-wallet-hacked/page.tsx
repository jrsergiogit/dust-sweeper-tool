import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: "https://app.dustsweepertool.com/blog/is-my-wallet-hacked" },
  title: "Is My Crypto Wallet Hacked? 5 Red Flags & Instant Fix",
  description: "Detect unauthorized access and malicious contracts. Use Dust Sweeper to review supported wallet data and security signals, while LI.FI powers supported cross-chain swap and bridge routes.",
};

export default function Post1() {
  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6 font-sans">
      <article className="max-w-3xl mx-auto border border-red-900/20 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <header className="mb-10">
          <div className="text-red-500 font-bold text-xs uppercase tracking-[0.3em] mb-4 underline decoration-red-500/30">Emergency Guide</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Is My Crypto Wallet <span className="text-red-600">Hacked?</span></h1>
          <p className="text-xl text-gray-500 italic font-light leading-relaxed">"If you see tokens you didn't buy, you are at risk. Here is how to review supported networks in 60 seconds."</p>
        </header>

        <section className="space-y-8 text-gray-300 text-lg leading-relaxed">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">5 Red Flags to Watch</h2>
          <ul className="space-y-4 list-decimal pl-5 text-gray-400">
            <li><strong>Unknown Token Approvals:</strong> Contracts having permission to spend your USDC/ETH.</li>
            <li><strong>Dusting Attacks:</strong> Tiny amounts of scam tokens appearing on Base, Polygon, or BSC.</li>
            <li><strong>Gas Spikes:</strong> Transactions you didn't authorize failing due to lack of gas.</li>
            <li><strong>Website Pop-ups:</strong> Constant requests to "Sign" or "Verify" your address.</li>
            <li><strong>Vanishing Small Balances:</strong> Micro-assets being drained slowly by bot scripts.</li>
          </ul>

          <div className="bg-red-900/10 border-l-4 border-red-600 p-6 my-8">
            <p className="text-red-400 font-bold italic text-sm">CRITICAL STEP:</p>
            <p className="text-gray-300">Don't just revoke. Use a deep-scanner like <strong>Dust Sweeper</strong> to identify hidden malicious contracts across all L2 networks simultaneously.</p>
          </div>

          <div className="mt-16 text-center">
             <a href="/" className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl transform hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                style={{ background: 'linear-gradient(90deg, #dc2626 0%, #7f1d1d 100%)' }}>
               SCAN & SECURE MY WALLET
             </a>
          </div>
        </section>
      </article>
    </div>
  );
}