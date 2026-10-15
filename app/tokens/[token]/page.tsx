import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import DustCostCalculator from '../../components/DustCostCalculator'
import { TOKEN_DATA, isScanned, TOKEN_HOME_CHAIN } from '../token-data'
import { SITE_URL, articleLd, breadcrumbLd, faqLd, type Faq } from '../../lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return Object.keys(TOKEN_DATA).map((token) => ({ token })) }

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const d = TOKEN_DATA[token]
  if (!d) return {}
  const title = `${d.name} Dust: What to Do With Small ${d.name} Balances`
  const url = `${SITE_URL}/tokens/${token}`
  return {
    title,
    description: d.description,
    alternates: { canonical: url },
    openGraph: { title, description: d.description, url, type: 'article', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description: d.description, images: ['/og-image.png'] },
  }
}

export default async function TokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const d = TOKEN_DATA[token]
  if (!d) return null
  const path = `/tokens/${token}`
  const scanned = isScanned(token)
  const homeChain = TOKEN_HOME_CHAIN[d.chain]
  const sameChain = Object.entries(TOKEN_DATA).filter(([s, t]) => s !== token && t.chain === d.chain).slice(0, 4)
  const others = Object.entries(TOKEN_DATA).filter(([s]) => s !== token).slice(0, 4)
  const related = sameChain.length >= 2 ? sameChain : others

  const faq: Faq[] = [
    [`Is a small ${d.name} balance worth moving?`, `Only if the amount you would receive after network fees, route fees and price impact is clearly positive. Small ${d.name} balances often are not worth moving on a high-fee network, so compare a live quote with the balance value first.`],
    [`Can Dust Sweeper find my ${d.name} dust?`, scanned
      ? `${d.name} on ${d.chain} falls within the networks Dust Finder reads today, so a scan of your public address can show the balance if you hold it there. Verify the contract before acting.`
      : `Dust Finder reads seven EVM networks (Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism and Avalanche). ${d.name} on ${d.chain} is not scanned, so use this guide to evaluate the balance and check it in a tool built for ${d.chain}.`],
    [`How do I verify the ${d.name} token before touching it?`, `Find the official contract or asset identifier from the project’s own channels, open it on the network’s block explorer, and confirm it matches what your wallet holds. Never rely on the ticker or the logo alone.`],
  ]

  return (
    <main className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <JsonLd data={[
        articleLd({ title: `${d.name} Dust: Small ${d.name} Balances`, description: d.description, path }),
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Token guides', path: '/tokens' }, { name: `${d.name} dust`, path }]),
        faqLd(faq),
      ]} />
      <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href="/tokens" className="hover:text-white">Token guides</Link>
        </nav>
        <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Token Guide • {d.chain}</div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{d.name} Dust</h1>
        <p className="text-xl text-gray-400 italic font-light">{d.description}</p>

        <div className="mt-10 rounded-2xl border border-pink-500/30 bg-pink-500/5 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Quick answer</div>
          <p className="text-gray-200 leading-relaxed">Small {d.name} dust is worth moving only when its value minus fees and price impact is clearly positive and the token contract is the genuine one. Otherwise leave it where it is.</p>
        </div>

        <section className="space-y-8 text-gray-300 leading-relaxed text-lg mt-12">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">What Is {d.name} Dust?</h2>
          <p>A small {d.name} balance is not automatically worthless or dangerous. It may be the remainder of a swap, transfer, reward or older position. The first question is where the asset lives ({d.chain}) and whether the token is the one you intended to hold.</p>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Before Moving a Small Balance</h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-400">
            <li>Confirm the wallet address and the <strong className="text-gray-200">{d.chain}</strong> network.</li>
            <li>Verify the exact token contract or asset identifier instead of relying on the ticker or logo.</li>
            <li>Compare the balance value with gas, bridge, swap and other route costs.</li>
            <li>Check whether the asset is liquid and actually transferable.</li>
            <li>Never enter a seed phrase or private key into a scanner or cleanup tool.</li>
          </ul>

          <DustCostCalculator />

          <div className="bg-white/5 border-l-4 border-pink-500 p-6 italic">The goal is not to move every tiny balance. It is to determine which balances are safe and economical to consolidate.</div>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faq.map(([q, a]) => (
              <div key={q}><h3 className="text-xl font-bold text-white mb-2">{q}</h3><p className="text-gray-400">{a}</p></div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Scan Your Wallet</h2>
          <p>Dust Sweeper reads your public address, lists small balances on the networks it supports, and lets you compare routes before you sign. Review the asset and route carefully before approving any transaction.</p>
          <Link href="/?tool=finder" className="inline-block px-10 py-4 text-sm font-black rounded-xl" style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>SCAN YOUR WALLET</Link>

          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map(([s, t]) => (
              <Link key={s} href={`/tokens/${s}`} className="border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-white/25">{t.name} dust ({t.chain}) →</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {homeChain && <Link href={`/dust-recovery/${homeChain}`} className="text-pink-400 hover:text-white">{d.chain} dust recovery →</Link>}
            <Link href="/small-crypto-balance" className="text-pink-400 hover:text-white">Is a small balance worth moving? →</Link>
            <Link href="/tokens" className="text-pink-400 hover:text-white">All token guides →</Link>
          </div>
        </section>
      </article>
    </main>
  )
}
