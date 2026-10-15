import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "../../components/JsonLd";
import { bridgePairs, topics, getRouteIntelligence, isIndexableBridge } from "../../learn/data";
import { SITE_URL, articleLd, breadcrumbLd, faqLd, type Faq } from "../../lib/seo";

export const dynamicParams = false;
export async function generateStaticParams() { return bridgePairs.map(({ slug }) => ({ pair: slug })); }

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const route = bridgePairs.find(p => p.slug === pair);
  if (!route) return {};
  const title = `Bridge ${route.fromName} to ${route.toName}: Fees, Risks & Checklist`;
  const description = `Moving assets from ${route.fromName} to ${route.toName}? See the network differences, fee considerations and a safety checklist before you bridge.`;
  const url = `${SITE_URL}/bridge/${pair}`;
  return {
    title, description,
    alternates: { canonical: url },
    // Only the highest-value routes are indexed; the rest stay usable but out of search.
    robots: isIndexableBridge(pair) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "article", images: [{ url: "/og-image.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export default async function BridgePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const route = bridgePairs.find(p => p.slug === pair);
  if (!route) return null;
  const path = `/bridge/${pair}`;
  const intel = getRouteIntelligence(route.from, route.to);
  const reverse = bridgePairs.find(p => p.from === route.to && p.to === route.from);
  const related = bridgePairs.filter(p => p.slug !== pair && (p.from === route.from || p.to === route.to)).slice(0, 6);
  const learnRelated = topics.filter(([slug]) => /bridge|cross-chain|wallet|gas|token/i.test(slug)).slice(0, 4);

  const faq: Faq[] = [
    [`How do I bridge from ${route.fromName} to ${route.toName}?`, `Choose ${route.fromName} as the source and ${route.toName} as the destination in a bridge or route aggregator, pick the token and amount, review the quote and the minimum received amount, then confirm in your wallet. Keep some ${route.fromName} native token to pay the fee.`],
    [`How much does it cost to bridge ${route.fromName} to ${route.toName}?`, `The cost combines the ${route.fromName} network fee, the route or bridge fee and any price impact. It changes with network conditions, so use the live quote and compare the final received amount, not just the headline fee.`],
    [`Is bridging ${route.fromName} to ${route.toName} safe?`, `Bridges add risk beyond a normal transfer. Use a trusted interface, verify the destination network and recipient address, start with a small test amount for new routes and never share a seed phrase.`],
  ];

  return <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
    <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
      <JsonLd data={[
        articleLd({ title: `Bridge ${route.fromName} to ${route.toName}`, description: `Route guide and safety checklist for ${route.fromName} to ${route.toName}.`, path, type: "TechArticle" }),
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "Bridge routes", path: "/bridge" }, { name: `${route.fromName} to ${route.toName}`, path }]),
        faqLd(faq),
      ]} />
      <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
        <Link href="/" className="hover:text-white">Home</Link><span>/</span>
        <Link href="/bridge" className="hover:text-white">Bridge routes</Link>
      </nav>
      <header className="mb-12"><div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Bridge Guide • Route Intelligence</div><h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Bridge {route.fromName} to {route.toName}</h1><p className="text-xl text-gray-400 italic font-light">Network differences, fees and safety checks before a {route.fromName} to {route.toName} transfer.</p></header>
      <section className="space-y-8 text-gray-300 leading-relaxed text-lg">
        <div className="rounded-2xl border border-pink-500/30 bg-pink-500/5 p-6"><div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Quick answer</div><p className="text-gray-200">To bridge from {route.fromName} to {route.toName}, select both networks in a route aggregator, compare the final received amount across routes, keep native {route.fromName} gas available and confirm the destination address before signing.</p></div>
        <p>{intel.architecture}</p>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Route Intelligence</h2>
        <div className="grid gap-4"><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Source network</div><p className="mt-2">{intel.source}</p></div><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Destination network</div><p className="mt-2">{intel.destination}</p></div><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Asset considerations</div><p className="mt-2">{intel.assets}</p></div><div className="border border-white/10 rounded-2xl p-5"><div className="text-xs text-pink-500 uppercase tracking-widest">Fee considerations</div><p className="mt-2">{intel.fees}</p></div></div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Before You Bridge</h2><ul className="list-disc pl-6 space-y-4 text-gray-400"><li><strong>Source:</strong> confirm the asset is actually held on {route.fromName}.</li><li><strong>Destination:</strong> confirm the wallet and destination network.</li><li><strong>Token:</strong> verify the exact asset representation rather than relying on ticker or logo.</li><li><strong>Costs:</strong> compare gas, bridge fees, liquidity, price impact and the final received amount.</li><li><strong>Security:</strong> {intel.security}</li></ul>
        <div className="bg-white/5 border-l-4 border-pink-500 p-6 italic">Never use a seed phrase or private key to complete a bridge. A legitimate bridge flow should not require either.</div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h2>
        <div className="space-y-6">{faq.map(([q, a]) => <div key={q}><h3 className="text-xl font-bold text-white mb-2">{q}</h3><p className="text-gray-400">{a}</p></div>)}</div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Use the Live Bridge Tool</h2><p>When a live route is available, open Dust Sweeper and review the current quote immediately before signing. Route availability, liquidity and network conditions can change.</p><Link href="/?tool=bridge#tools" className="inline-block px-10 py-4 text-sm font-black rounded-xl" style={{background:"linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)"}}>OPEN BRIDGE TOOL</Link>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Related Routes</h2><div className="grid sm:grid-cols-2 gap-3">{reverse && <Link href={`/bridge/${reverse.slug}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">{reverse.fromName} → {reverse.toName} (reverse) →</Link>}{related.map(p => <Link key={p.slug} href={`/bridge/${p.slug}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">{p.fromName} → {p.toName} →</Link>)}</div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Learn More</h2><div className="space-y-3">{learnRelated.map(([slug,title]) => <Link key={slug} href={`/learn/${slug}`} className="block text-pink-400 hover:text-pink-300">{title} →</Link>)}<Link href={`/dust-recovery/${route.from}`} className="block text-pink-400 hover:text-pink-300">{route.fromName} dust recovery →</Link></div>
      </section>
    </article>
  </div>;
}
