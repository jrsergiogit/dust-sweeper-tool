import type { Metadata } from "next";
import Link from "next/link";
import { topics, chains, topicAngles } from "../data";

export const dynamicParams = false;

export async function generateStaticParams() {
  return topics.map(([slug]) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = topics.find(([s]) => s === slug);
  if (!topic) return {};
  const [, title, description] = topic;
  return {
    title: `${title} | Dust Sweeper Learn`,
    description,
    keywords: [title.toLowerCase(), "web3 wallet", "crypto dust", "wallet security", "cross-chain"],
    alternates: { canonical: `https://app.dustsweepertool.com/learn/${slug}` },
    openGraph: {
      title: `${title} | Dust Sweeper`,
      description,
      url: `https://app.dustsweepertool.com/learn/${slug}`,
      type: "article",
    },
  };
}

function relatedLinks(slug: string) {
  const idx = topics.findIndex(([s]) => s === slug);
  return [1, 2, 3].map((offset) => topics[(idx + offset) % topics.length]).filter(Boolean);
}

export default async function LearnArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topics.find(([s]) => s === slug);
  if (!topic) return null;
  const [, title, description] = topic;
  const angle = topicAngles[slug] || description;
  const related = relatedLinks(slug);
  const featuredChains = chains.slice(0, 6);

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org","@type":"Article","headline":title,"description":description,
        "author":{"@type":"Organization","name":"Dust Sweeper Team"},
        "publisher":{"@type":"Organization","name":"Dust Sweeper"},
        "mainEntityOfPage":{"@type":"WebPage","@id":`https://app.dustsweepertool.com/learn/${slug}`},
        "image":"https://app.dustsweepertool.com/og-image.png"
      }) }} />
      <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <header className="mb-12">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Learn • Web3 Guide • 2026</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{title}</h1>
          <p className="text-xl text-gray-400 italic font-light">{description}</p>
        </header>
        <section className="space-y-8 text-gray-300 leading-relaxed text-lg">
          <p>
            Managing a Web3 wallet becomes harder as balances, approvals and transactions spread across multiple networks. The safest approach is to separate discovery from action: first identify what you own and where it lives, then verify the asset and route before signing anything.
          </p>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">The Key Point</h2>
          <p>{angle}</p>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Start With Visibility</h2>
          <p>
            Small balances are easy to overlook, especially after using bridges, swaps, airdrops, testnets or applications on different chains. A wallet review should therefore begin with an inventory of addresses, networks and token contracts rather than with a transaction. Use a read-only scanner when possible and never share a seed phrase or private key with a website.
          </p>
          <div className="bg-white/5 border-l-4 border-pink-500 p-6 my-8 italic">
            Verify the network, token contract and destination before you sign. A familiar ticker is not proof that an asset is authentic.
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">What to Check Before Moving Funds</h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-400">
            <li><strong>Network:</strong> confirm the source and destination chains match the route you intend to use.</li>
            <li><strong>Contract:</strong> compare the token contract with a trusted source instead of relying only on its symbol or logo.</li>
            <li><strong>Economics:</strong> compare the amount being moved with gas, bridge fees, price impact and the expected received amount.</li>
            <li><strong>Permissions:</strong> review approvals and avoid signing requests you do not understand.</li>
            <li><strong>Destination:</strong> double-check the wallet address and make a small test transaction when the situation warrants it.</li>
          </ul>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Use a Multi-Chain Workflow</h2>
          <p>
            Once the inventory is complete, group balances by network. This makes it easier to decide which assets are worth consolidating and which are better left untouched because transaction costs are too high. For cross-chain moves, a route aggregator can compare available paths, but the final transaction still deserves the same contract, network and recipient checks as any other on-chain action.
          </p>
          <p>
            Dust Sweeper can be used as a starting point for discovering forgotten balances and reviewing wallet data. When you are ready to move an asset, use the bridge tools carefully and confirm the route shown by the interface before signing.
          </p>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Explore by Network</h2>
          <p>Go deeper with network-specific pages that combine wallet context, asset considerations, security checks and related bridge routes.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {chains.slice(0, 6).map(([chain, name]) => <Link key={chain} href={`/learn/network/${chain}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-white/25 transition-colors">{name} network guide →</Link>)}
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Explore Bridge Routes</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {featuredChains.slice(0, 4).map(([from, fromName], i) => {
              const [to, toName] = featuredChains[(i + 1) % featuredChains.length];
              return <Link key={from+to} href={`/bridge/${from}-to-${to}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-white/25 transition-colors">{fromName} → {toName}</Link>;
            })}
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Related Guides</h2>
          <div className="space-y-3">
            {related.map(([s,t]) => <Link key={s} href={`/learn/${s}`} className="block text-pink-400 hover:text-pink-300">{t} →</Link>)}
          </div>
          <div className="mt-16 text-center">
            <Link href="/" className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl transform hover:scale-105" style={{background:"linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)"}}>
              OPEN DUST SWEEPER
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
