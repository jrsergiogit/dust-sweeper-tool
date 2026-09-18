import type { Metadata } from "next";
import Link from "next/link";
import { chains, topics, chainMap, bridgePairs, getChainProfile } from "../../data";

export const dynamicParams = false;

export async function generateStaticParams() {
  return chains.map(([chain]) => ({ chain }));
}

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chainMap[chain];
  if (!name) return {};
  const profile = getChainProfile(chain);
  const description = `${name} wallet guide covering ${profile.feeFocus.toLowerCase()} Learn about assets, security and cross-chain decisions.`;
  return {
    title: `${name} Wallet & Cross-Chain Guide | Dust Sweeper`,
    description,
    keywords: [`${name} wallet`, `${name} dust`, `${name} bridge`, `${name} crypto`, "web3 wallet security"],
    alternates: { canonical: `https://app.dustsweepertool.com/learn/network/${chain}` },
    openGraph: { title: `${name} Wallet & Cross-Chain Guide | Dust Sweeper`, description, url: `https://app.dustsweepertool.com/learn/network/${chain}`, type: "article" },
  };
}

export default async function NetworkPage({ params }: { params: Promise<{ chain: string }> }) {
  const { chain } = await params;
  const name = chainMap[chain];
  if (!name) return null;
  const profile = getChainProfile(chain);
  const networkTopics = topics.filter(([slug]) => slug.includes(chain) || /dust|wallet|bridge|security|gas|token|recovery/i.test(slug)).slice(0, 8);
  const routes = bridgePairs.filter(p => p.from === chain || p.to === chain).slice(0, 8);
  return <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
    <article className="max-w-5xl mx-auto">
      <header className="border border-white/5 bg-[#030303] p-8 md:p-14 rounded-3xl mb-6">
        <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Network Guide</div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{name} Wallet & Cross-Chain Guide</h1>
        <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">{profile.role}. {profile.architecture}</p>
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        {[
          ["Network context", profile.architecture],
          ["Fee focus", profile.feeFocus],
          ["Asset focus", profile.assetFocus],
          ["Security focus", profile.securityFocus],
        ].map(([heading, text]) => <section key={heading} className="border border-white/5 bg-[#030303] p-7 rounded-3xl">
          <h2 className="text-xl font-bold mb-3">{heading}</h2>
          <p className="text-gray-400 leading-relaxed">{text}</p>
        </section>)}
      </div>
      <section className="border border-white/5 bg-[#030303] p-8 md:p-10 rounded-3xl mt-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-5">{name} Wallet Checklist</h2>
        <ul className="list-disc pl-6 space-y-3 text-gray-400 leading-relaxed">
          <li>Confirm the wallet is connected to {name} before interpreting balances.</li>
          <li>Verify asset representation and contract or token-account details before signing.</li>
          <li>Compare the balance value with the complete cost of moving it.</li>
          <li>Review approvals or signing permissions and reject requests you do not understand.</li>
          <li>Use the live Dust Sweeper route only after checking the destination and received amount.</li>
        </ul>
        <div className="mt-7"><Link href="/" className="inline-block px-8 py-4 text-sm font-black rounded-xl" style={{background:"linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)"}}>SCAN YOUR WALLET</Link></div>
      </section>
      <section className="mt-6 border border-white/5 bg-[#030303] p-8 md:p-10 rounded-3xl">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-5">{name} Learn Guides</h2>
        <div className="grid sm:grid-cols-2 gap-3">{networkTopics.map(([slug,title,description]) => <Link key={slug} href={`/learn/${chain}/${slug}`} className="border border-white/10 rounded-xl p-4 hover:border-white/25 transition-colors"><div className="font-bold">{title}</div><div className="text-sm text-gray-500 mt-2">{description}</div></Link>)}</div>
      </section>
      <section className="mt-6 border border-white/5 bg-[#030303] p-8 md:p-10 rounded-3xl">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-5">{name} Bridge Routes</h2>
        <div className="grid sm:grid-cols-2 gap-3">{routes.map(route => <Link key={route.slug} href={`/bridge/${route.slug}`} className="border border-white/10 rounded-xl px-4 py-4 text-sm text-gray-300 hover:text-white hover:border-white/25">{route.fromName} → {route.toName} <span className="text-gray-600">· route guide</span></Link>)}</div>
      </section>
    </article>
  </div>;
}
