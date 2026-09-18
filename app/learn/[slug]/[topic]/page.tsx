import type { Metadata } from "next";
import Link from "next/link";
import { chains, topics, chainMap } from "../../data";

export const dynamicParams = false;

export async function generateStaticParams() {
  return chains.flatMap(([chain]) => topics.map(([topic]) => ({ slug: chain, topic })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; topic: string }> }): Promise<Metadata> {
  const { slug: chain, topic } = await params;
  const chainName = chainMap[chain] || chain;
  const item = topics.find(([s]) => s === topic);
  if (!item) return {};
  const [, title, description] = item;
  const pageTitle = `${title} on ${chainName} | Dust Sweeper`;
  return {
    title: pageTitle,
    description: `${description} Learn how this applies to ${chainName} wallets and cross-chain asset management.`,
    keywords: [chainName, title.toLowerCase(), "crypto dust", "wallet security", "bridge", "web3"],
    alternates: { canonical: `https://app.dustsweepertool.com/learn/${chain}/${topic}` },
    openGraph: { title: pageTitle, description, url: `https://app.dustsweepertool.com/learn/${chain}/${topic}`, type: "article" },
  };
}

export default async function ChainTopicPage({ params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug: chain, topic } = await params;
  const chainName = chainMap[chain] || chain;
  const item = topics.find(([s]) => s === topic);
  if (!item) return null;
  const [, title, description] = item;
  const chainIndex = chains.findIndex(([s]) => s === chain);
  const next = chains[(chainIndex + 1) % chains.length];
  const previous = chains[(chainIndex - 1 + chains.length) % chains.length];
  const bridgeSlug = `${chain}-to-${next[0]}`;

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context":"https://schema.org","@type":"TechArticle","headline":`${title} on ${chainName}`,
        "description":`${description} Learn how this applies to ${chainName}.`,
        "author":{"@type":"Organization","name":"Dust Sweeper Team"},
        "mainEntityOfPage":{"@type":"WebPage","@id":`https://app.dustsweepertool.com/learn/${chain}/${topic}`},
        "image":"https://app.dustsweepertool.com/og-image.png"
      })}} />
      <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <header className="mb-12">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Learn • {chainName} • 2026</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{title} on {chainName}</h1>
          <p className="text-xl text-gray-400 italic font-light">{description}</p>
        </header>
        <section className="space-y-8 text-gray-300 leading-relaxed text-lg">
          <p>
            {chainName} is one of the networks where a wallet can accumulate small balances, legacy assets and application-related activity over time. The same core principle applies here as elsewhere in Web3: inspect first, verify second, transact third.
          </p>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">A {chainName} Wallet Checklist</h2>
          <p>
            Start by confirming the wallet address and network. Review the assets visible on {chainName}, then compare unfamiliar tokens against reliable contract information. If a balance is very small, estimate the complete transaction cost before deciding that it should be moved. A token that looks valuable in a portfolio view may still be uneconomical to transfer.
          </p>
          <ul className="list-disc pl-6 space-y-4 text-gray-400">
            <li>Confirm you are connected to <strong>{chainName}</strong> before interpreting balances.</li>
            <li>Verify token contracts rather than relying on ticker symbols alone.</li>
            <li>Check gas and route costs before moving low-value balances.</li>
            <li>Never enter a seed phrase or private key into a recovery or scanning site.</li>
            <li>Review the final recipient, route and minimum received amount before signing.</li>
          </ul>
          <div className="bg-white/5 border-l-4 border-pink-500 p-6 my-8 italic">
            The goal of a wallet cleanup is not to move everything. It is to make informed decisions about what is safe and economical to move.
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Bridge From {chainName}</h2>
          <p>
            If the next step is consolidation, compare a supported route from {chainName} to another network and review the quote before signing. The dedicated bridge page below is an informational entry point; the actual transaction remains subject to current network conditions and the route shown in the bridge interface.
          </p>
          <Link href={`/bridge/${bridgeSlug}`} className="inline-block border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-white hover:border-white/30 transition-colors">
            {chainName} → {next[1]} BRIDGE GUIDE
          </Link>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">More {chainName} Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href={`/learn/${previous[0]}/${topic}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">← {previous[1]} version</Link>
            <Link href={`/learn/${chain}/${topics[(topics.findIndex(([s])=>s===topic)+1)%topics.length][0]}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">More {chainName} guides →</Link>
          </div>
          <div className="mt-16 text-center">
            <Link href="/" className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl transform hover:scale-105" style={{background:"linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)"}}>
              SCAN YOUR WALLET
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
