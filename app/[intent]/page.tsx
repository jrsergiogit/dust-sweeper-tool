import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '../components/JsonLd'
import DustCostCalculator from '../components/DustCostCalculator'
import { INTENTS, CLUSTERS } from '../lib/seo-intents'
import { SITE_URL, articleLd, breadcrumbLd, faqLd } from '../lib/seo'
import { SCAN_CHAIN_SLUGS, chainMap } from '../learn/data'

export const dynamicParams = false
export function generateStaticParams() {
  return Object.keys(INTENTS).map((intent) => ({ intent }))
}

export async function generateMetadata({ params }: { params: Promise<{ intent: string }> }): Promise<Metadata> {
  const { intent } = await params
  const d = INTENTS[intent]
  if (!d) return {}
  const url = `${SITE_URL}/${intent}`
  const title = d.title.length <= 48 ? `${d.title} | Dust Sweeper` : d.title
  return {
    title,
    description: d.description,
    alternates: { canonical: url },
    openGraph: { title: d.title, description: d.description, url, type: 'article', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: d.title, description: d.description, images: ['/og-image.png'] },
  }
}

function relatedFor(intent: string): string[] {
  const own = Object.values(CLUSTERS).find((c) => c.includes(intent)) ?? []
  const same = own.filter((s) => s !== intent)
  const idx = own.indexOf(intent)
  const nearby = [1, 2, 3, 4].map((o) => own[(idx + o) % own.length]).filter((s) => s && s !== intent)
  const others = Object.values(CLUSTERS).filter((c) => c !== own).map((c) => c[idx % c.length]).filter(Boolean)
  return Array.from(new Set([...nearby, ...same.slice(0, 2), ...others])).slice(0, 6)
}

const STEPS: [string, string][] = [
  ['Check your public address on every network', 'Use a read-only scan. You only need the public address, never a seed phrase or private key.'],
  ['Verify before you trust', 'Compare each unfamiliar token contract with an independent source. A ticker or logo proves nothing.'],
  ['Work out the real cost', 'Add network gas, route fees and price impact, then compare the total with the balance value.'],
  ['Act only where it pays off', 'Move balances that stay clearly positive after costs. Hide or ignore the rest.'],
]

export default async function IntentPage({ params }: { params: Promise<{ intent: string }> }) {
  const { intent } = await params
  const d = INTENTS[intent]
  if (!d) return null
  const path = `/${intent}`
  const related = relatedFor(intent)

  return (
    <main className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <JsonLd data={[
        articleLd({ title: d.title, description: d.description, path }),
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/learn' }, { name: d.title, path }]),
        faqLd(d.faq),
      ]} />
      <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href="/learn" className="hover:text-white">Guides</Link>
        </nav>
        <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Guide</div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{d.title}</h1>
        <p className="text-xl text-gray-400 italic font-light">{d.description}</p>

        <div className="mt-10 rounded-2xl border border-pink-500/30 bg-pink-500/5 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Quick answer</div>
          <p className="text-gray-200 leading-relaxed">{d.answer}</p>
        </div>

        <section className="space-y-8 text-gray-300 leading-relaxed text-lg mt-12">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{d.h2}</h2>
          {d.body.map((p, i) => <p key={i}>{p}</p>)}

          {d.calc && <DustCostCalculator />}

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">A Simple 4-Step Process</h2>
          <ol className="list-decimal pl-6 space-y-4 text-gray-400">
            {STEPS.map(([t, s]) => <li key={t}><strong className="text-gray-200">{t}.</strong> {s}</li>)}
          </ol>

          <div className="bg-white/5 border-l-4 border-pink-500 p-6 italic">
            The goal of wallet cleanup is informed decision-making, not moving every tiny balance. Never share a seed phrase or private key with any scanner or cleanup tool.
          </div>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {d.faq.map(([q, a]) => (
              <div key={q}>
                <h3 className="text-xl font-bold text-white mb-2">{q}</h3>
                <p className="text-gray-400">{a}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Use Dust Sweeper</h2>
          <p>Dust Finder reads your public address on seven networks, shows small and forgotten balances, and lets you compare swap and bridge routes before you sign anything. It is non-custodial: every transaction is one you review and approve in your own wallet.</p>
          <Link href="/?tool=finder" className="inline-block px-10 py-4 text-sm font-black rounded-xl" style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>SCAN YOUR WALLET</Link>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((s) => (
              <Link key={s} href={`/${s}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-white/25">{INTENTS[s].title} →</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/tokens" className="text-pink-400 hover:text-white">Token dust guides →</Link>
            <Link href="/blog" className="text-pink-400 hover:text-white">Blog →</Link>
            <Link href="/learn" className="text-pink-400 hover:text-white">All Web3 guides →</Link>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {SCAN_CHAIN_SLUGS.map((c) => <Link key={c} href={`/dust-recovery/${c}`} className="rounded-full border border-white/10 px-3 py-1 hover:text-white">{chainMap[c]} dust</Link>)}
          </div>
        </section>
      </article>
    </main>
  )
}
