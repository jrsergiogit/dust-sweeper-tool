import Link from "next/link";
import type { Metadata } from "next";
import { bridgePairs } from "../learn/data";

export const metadata: Metadata = {
  title: "Crypto Bridge Routes | Dust Sweeper",
  description: "Explore cross-chain bridge route guides for supported Web3 networks.",
  alternates: { canonical: "https://app.dustsweepertool.com/bridge" },
};

export default function BridgeIndex() {
  return <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Bridge</div>
        <h1 className="text-4xl md:text-6xl font-black mb-5">Cross-Chain Bridge Routes</h1>
        <p className="text-xl text-gray-400 max-w-3xl">Browse route-specific guides for moving supported assets between Web3 networks.</p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bridgePairs.map(p => <Link key={p.slug} href={`/bridge/${p.slug}`} className="border border-white/5 bg-[#030303] rounded-2xl p-5 hover:border-white/20 transition-colors">
          <div className="text-lg font-bold">{p.fromName} → {p.toName}</div>
          <div className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Bridge route guide</div>
        </Link>)}
      </div>
    </div>
  </div>;
}
