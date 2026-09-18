import type { Metadata } from "next";
import Link from "next/link";
import { bridgePairs, topics, getRouteIntelligence } from "../../learn/data";

export const dynamicParams = false;
export async function generateStaticParams() { return bridgePairs.map(({ slug }) => ({ pair: slug })); }

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const route = bridgePairs.find(p => p.slug === pair);
  if (!route) return {};
  const title = `Bridge ${route.fromName} to ${route.toName} | Dust Sweeper`;
  const description = `Route intelligence for moving supported assets from ${route.fromName} to ${route.toName}, including network differences, asset representation, fees and security checks.`;
  return { title, description, keywords: [`bridge ${route.fromName.toLowerCase()} to ${route.toName.toLowerCase()}`, `${route.fromName} ${route.toName} bridge`, "crypto bridge", "cross-chain"], alternates: { canonical: `https://dustsweepertool.com/bridge/${pair}` }, openGraph: { title, description, url: `https://dustsweepertool.com/bridge/${pair}`, type: "article" } };
}

export default async function BridgePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const route = bridgePairs.find(p => p.slug === pair);
  if (!route) return null;
  const intel = getRouteIntelligence(route.from, route.to);
  const related = bridgePairs.filter(p => p.slug !== pair && (p.from === route.from || p.to === route.to)).slice(0, 6);
  const learnRelated = topics.filter(([slug]) => /bridge|cross-chain|wallet|gas|token/i.test(slug)).slice(0, 4);
  return <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
    <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"TechArticle","headline":`Bridge ${route.fromName} to ${route.toName}`,"description":`Route intelligence and safety guide for ${route.fromName} to ${route.toName}.`,"author":{"@type":"Organization","name":"Dust Sweeper Team"},"mainEntityOfPage":{"@type":"WebPage","@id":`https://dustsweepertool.com/bridge/${pair}`},"image":"https://dustsweepertool.com/og-image.png"})}} />
      <header className="mb-12"><div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Bridge Guide • Route Intelligence</div><h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{route.fromName} → {route.toName}</h1><p className="text-xl text-gray-400 italic font-light">Network-specific checks before a cross-chain transaction.</p></header>
      <section className="space-y-8 text-gray-300 leading-relaxed text-lg">
        <p>{intel.architecture}</p>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Route Intelligence</h2>
        <div className="grid gap-4"><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Source network</div><p className="mt-2">{intel.source}</p></div><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Destination network</div><p className="mt-2">{intel.destination}</p></div><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Asset considerations</div><p className="mt-2">{intel.assets}</p></div><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Fee considerations</div><p className="mt-2">{intel.fees}</p></div></div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Before You Bridge</h2><ul className="list-disc pl-6 space-y-4 text-gray-400"><li><strong>Source:</strong> confirm the asset is actually held on {route.fromName}.</li><li><strong>Destination:</strong> confirm the wallet and destination network.</li><li><strong>Token:</strong> verify the exact asset representation rather than relying on ticker or logo.</li><li><strong>Costs:</strong> compare gas, bridge fees, liquidity, price impact and the final received amount.</li><li><strong>Security:</strong> {intel.security}</li></ul>
        <div className="bg-white/5 border-l-4 border-pink-500 p-6 italic">Never use a seed phrase or private key to complete a bridge. A legitimate bridge flow should not require either.</div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Use the Live Bridge Tool</h2><p>When a live route is available, open Dust Sweeper and review the current quote immediately before signing. Route availability, liquidity and network conditions can change.</p><Link href="/" className="inline-block px-10 py-4 text-sm font-black rounded-xl" style={{background:"linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)"}}>OPEN BRIDGE TOOL</Link>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Related Routes</h2><div className="grid sm:grid-cols-2 gap-3">{related.map(p => <Link key={p.slug} href={`/bridge/${p.slug}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">{p.fromName} → {p.toName} →</Link>)}</div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Learn More</h2><div className="space-y-3">{learnRelated.map(([slug,title]) => <Link key={slug} href={`/learn/${slug}`} className="block text-pink-400 hover:text-pink-300">{title} →</Link>)}</div>
      </section>
    </article>
  </div>;
}
