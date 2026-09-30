import type { Metadata } from "next";
import Link from "next/link";
import { chains, topics, chainMap, getChainProfile } from "../../data";
import {
  pageTitle, pageDescription, steps, ecosystemFrame, routeFrame, orderedFocus,
  familyNote, angleOf, relatedTopics, otherChains, categoryOf, quoteFor, bridgeNote,
} from "../../topic-content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return chains.flatMap(([chain]) => topics.map(([topic]) => ({ slug: chain, topic })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; topic: string }> }): Promise<Metadata> {
  const { slug: chain, topic } = await params;
  const chainName = chainMap[chain];
  const item = topics.find(([s]) => s === topic);
  if (!chainName || !item) return {};
  const bare = pageTitle(chain, topic);
  const title = bare.length + 15 <= 60 ? `${bare} | Dust Sweeper` : bare;
  const description = pageDescription(chain, topic);
  const url = `https://dustsweepertool.com/learn/${chain}/${topic}`;
  return {
    title,
    description,
    keywords: [chainName, item[1].toLowerCase(), "crypto dust", "wallet security", "bridge", "web3"],
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "article",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export default async function ChainTopicPage({ params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug: chain, topic } = await params;
  const chainName = chainMap[chain];
  const item = topics.find(([s]) => s === topic);
  if (!chainName || !item) return null;
  const [, topicTitle, topicDescription] = item;

  const title = pageTitle(chain, topic);
  const description = pageDescription(chain, topic);
  const url = `https://dustsweepertool.com/learn/${chain}/${topic}`;
  const profile = getChainProfile(chain);
  const cat = categoryOf(topic);
  const chainIndex = chains.findIndex(([s]) => s === chain);
  const next = chains[(chainIndex + 1) % chains.length];
  const bridgeSlug = `${chain}-to-${next[0]}`;
  const route = routeFrame(chain, topic);
  const focus = orderedFocus(chain, topic);
  const checklist = steps(chain, topic);
  const related = relatedTopics(chain, topic);
  const others = otherChains(chain, topic);

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context":"https://schema.org","@type":"TechArticle","headline":title,
        "description":description,
        "author":{"@type":"Organization","name":"Dust Sweeper Team"},
        "mainEntityOfPage":{"@type":"WebPage","@id":url},
        "image":"https://dustsweepertool.com/og-image.png"
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context":"https://schema.org","@type":"BreadcrumbList",
        "itemListElement":[
          {"@type":"ListItem","position":1,"name":"Home","item":"https://dustsweepertool.com"},
          {"@type":"ListItem","position":2,"name":"Learn","item":"https://dustsweepertool.com/learn"},
          {"@type":"ListItem","position":3,"name":chainName,"item":`https://dustsweepertool.com/learn/network/${chain}`},
          {"@type":"ListItem","position":4,"name":topicTitle,"item":url},
        ]
      })}} />
      <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href="/learn" className="hover:text-white">Learn</Link><span>/</span>
          <Link href={`/learn/network/${chain}`} className="hover:text-white">{chainName}</Link>
        </nav>
        <header className="mb-12">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Learn • {chainName} • {profile.role}</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{title}</h1>
          <p className="text-xl text-gray-400 italic font-light">{route ? `How ${chainName} balances relate to the ${route.from} to ${route.to} route.` : topicDescription}</p>
        </header>
        <section className="space-y-8 text-gray-300 leading-relaxed text-lg">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Why this matters on {chainName}</h2>
          <p>{angleOf(topic)}</p>
          <p>{cat === "ecosystem" ? ecosystemFrame(chain, topic) : profile.architecture}</p>
          <p>{familyNote(chain)}</p>

          {route && (
            <>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{chainName} and this route</h2>
              <p>{route.intro}</p>
              <h3 className="text-xl font-bold text-white">{route.sourceTitle}</h3>
              <p>{route.source}</p>
              <h3 className="text-xl font-bold text-white">{route.destTitle}</h3>
              <p>{route.dest}</p>
            </>
          )}

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{chainName}: what to pay attention to</h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-400">
            {focus.map((f) => (
              <li key={f.label}><strong className="text-gray-200">{f.label}:</strong> {f.text}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">A {chainName} checklist for this topic</h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-400">
            {checklist.map((s) => (<li key={s}>{s}</li>))}
          </ul>
          <div className="bg-white/5 border-l-4 border-pink-500 p-6 my-8 italic">
            {quoteFor(topic)}
          </div>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Bridge from {chainName}</h2>
          <p>
            {bridgeNote(chain, next[0])}
          </p>
          <p>
            The bridge guide below is informational; any transaction depends on current network conditions and the route shown in the bridge interface.
          </p>
          <Link href={`/bridge/${bridgeSlug}`} className="inline-block border border-white/10 rounded-xl px-5 py-4 text-sm font-black text-white hover:border-white/30 transition-colors">
            {chainName} → {next[1]} BRIDGE GUIDE
          </Link>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Related guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((t) => (
              <Link key={t} href={`/learn/${chain}/${t}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">
                {chainMap[chain]}: {topics.find(([s]) => s === t)![1]}
              </Link>
            ))}
            {others.map((c) => (
              <Link key={c} href={`/learn/${c}/${topic}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white">
                {topicTitle} on {chainMap[c]}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href={`/learn/network/${chain}`} className="text-pink-400 hover:text-white">{chainName} wallet guide →</Link>
            <Link href={`/dust-recovery/${chain}`} className="text-pink-400 hover:text-white">{chainName} dust recovery →</Link>
            <Link href={`/learn/${topic}`} className="text-pink-400 hover:text-white">{topicTitle} (general) →</Link>
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
