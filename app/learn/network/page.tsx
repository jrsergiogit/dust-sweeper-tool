import Link from "next/link";
import type { Metadata } from "next";
import { chains, chainProfiles } from "../data";

export const metadata: Metadata = {
  title: "Web3 Networks | Wallet & Cross-Chain Guides | Dust Sweeper",
  description: "Explore network-specific Web3 wallet, dust, security and cross-chain guides across supported networks.",
  alternates: { canonical: "https://dustsweepertool.com/learn/network" },
};

export default function NetworkIndex() {
  return <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <header className="mb-14">
        <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Learn • Networks</div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Web3 Network Guides</h1>
        <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">Network-specific guidance for wallet cleanup, token risk, fees and cross-chain decisions.</p>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chains.map(([slug, name]) => <Link key={slug} href={`/learn/network/${slug}`} className="group border border-white/5 bg-[#030303] p-7 rounded-3xl hover:border-white/15 transition-all">
          <div className="text-[10px] text-pink-500 uppercase tracking-[0.25em] mb-3">{chainProfiles[slug]?.role || "Network guide"}</div>
          <h2 className="text-2xl font-bold group-hover:text-pink-400 transition-colors">{name}</h2>
          <p className="text-gray-500 mt-3 leading-relaxed">Explore {name} wallet, asset and cross-chain considerations.</p>
          <span className="inline-block mt-5 text-xs font-black tracking-widest text-gray-500 group-hover:text-white">EXPLORE NETWORK →</span>
        </Link>)}
      </div>
    </div>
  </div>;
}
