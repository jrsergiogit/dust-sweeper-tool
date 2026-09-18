import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Web3 Wallet & Crypto Security Blog | Dust Sweeper",
  description: "Practical articles about crypto dust, wallet security, gas fees, airdrops, and multi-chain asset recovery.",
  alternates: { canonical: "https://app.dustsweepertool.com/blog" },
};

const posts = [
  ["/blog/is-my-wallet-hacked", "Is My Crypto Wallet Hacked? 5 Red Flags & Instant Fix", "Security warning signs, approvals, dusting attacks, and practical wallet checks."],
  ["/blog/hidden-airdrops-2026", "Hidden Airdrops 2026: Find Forgotten Tokens on Supported Networks", "How to review forgotten balances and distinguish useful assets from suspicious tokens."],
  ["/blog/stop-wasting-gas", "Stop Wasting Gas: Consolidate Crypto Dust Into One Chain", "Why small balances can become expensive to move and how to plan consolidation."],
  ["/blog/dust-sweeper-vs-revoke-cash", "Dust Sweeper vs Revoke.cash", "How asset discovery and wallet-permission review solve different security problems."],
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0B0C10] text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-14">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Blog</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Web3 Wallet & Crypto Security</h1>
          <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">Practical articles about forgotten balances, wallet security, cross-chain transfers, gas costs and safer Web3 workflows.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map(([href, title, description]) => (
            <Link key={href} href={href} className="group border border-white/5 bg-[#030303] p-7 rounded-3xl hover:border-white/15 transition-all">
              <h2 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">{title}</h2>
              <p className="text-gray-400 leading-relaxed">{description}</p>
              <span className="inline-block mt-5 text-xs font-black tracking-widest text-gray-500 group-hover:text-white">READ ARTICLE →</span>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/learn" className="text-pink-400 hover:text-pink-300 font-bold">Explore all Web3 guides →</Link>
        </div>
      </div>
    </main>
  );
}
