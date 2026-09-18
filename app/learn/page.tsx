import Link from "next/link";
import type { Metadata } from "next";
import { topics, chains } from "./data";

export const metadata: Metadata = {
  title: "Learn | Web3 Wallet Security, Dust & Cross-Chain Guides | Dust Sweeper",
  description: "Practical guides about crypto dust, wallet security, token risk, swaps, bridges, gas fees and multi-chain asset recovery.",
  alternates: { canonical: "https://dustsweepertool.com/learn" },
};

export default function LearnPage() {
  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-14">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Learn</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Learn Web3 Wallet Security</h1>
          <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">Practical guides for finding forgotten balances, understanding wallet risk, comparing cross-chain routes, and keeping multi-chain assets organized.</p>
        </header>
        <section className="mb-14">
          <div className="flex items-end justify-between gap-4 mb-5"><div><div className="text-pink-500 font-bold text-xs uppercase tracking-[0.25em] mb-2">Explore by network</div><h2 className="text-2xl md:text-3xl font-black">Network intelligence</h2></div><Link href="/learn/network" className="text-xs font-black tracking-widest text-gray-500 hover:text-white">VIEW ALL →</Link></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{chains.slice(0, 8).map(([slug,name]) => <Link key={slug} href={`/learn/network/${slug}`} className="border border-white/5 bg-[#030303] rounded-2xl p-5 hover:border-white/20 transition-colors"><div className="font-bold">{name}</div><div className="text-xs text-gray-500 mt-2">Wallet, dust & bridge guide</div></Link>)}</div>
        </section>
        <section className="mb-10 border border-white/5 bg-[#030303] p-6 rounded-3xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.25em] mb-2">From the blog</div>
              <h2 className="text-xl md:text-2xl font-black">Wallet security & recovery articles</h2>
            </div>
            <Link href="/blog" className="text-xs font-black tracking-widest text-gray-500 hover:text-white">VIEW ARTICLES →</Link>
          </div>
        </section>
        <div className="grid md:grid-cols-2 gap-5">
          {topics.map(([slug, title, description]) => <Link key={slug} href={`/learn/${slug}`} className="group border border-white/5 bg-[#030303] p-7 rounded-3xl hover:border-white/15 transition-all"><div className="text-[10px] text-gray-600 uppercase tracking-[0.25em] mb-3">Web3 Guide</div><h2 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">{title}</h2><p className="text-gray-400 leading-relaxed">{description}</p><span className="inline-block mt-5 text-xs font-black tracking-widest text-gray-500 group-hover:text-white">READ GUIDE →</span></Link>)}
        </div>
      </div>
    </div>
  );
}
