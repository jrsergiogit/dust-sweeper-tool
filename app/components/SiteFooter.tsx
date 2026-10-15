import Link from 'next/link'
import { INTENTS } from '../lib/seo-intents'
import { SCAN_CHAIN_SLUGS, chainMap } from '../learn/data'
import { POSTS } from '../blog/posts'

const FEATURED_INTENTS = ['crypto-dust', 'find-forgotten-crypto', 'crypto-wallet-scanner', 'wallet-cleanup', 'small-crypto-balance', 'crypto-dust-calculator', 'spam-tokens', 'how-to-consolidate-crypto']

const h = 'mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400'
const a = 'block py-1 text-sm text-gray-500 hover:text-white'

// Sitewide internal links: gives every guide at least one crawlable path from every page.
export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#030303] py-10 px-6">
      <div className="mx-auto grid max-w-[1380px] gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <nav aria-label="Guides">
          <p className={h}>Popular guides</p>
          {FEATURED_INTENTS.map((s) => <Link key={s} href={`/${s}`} className={a}>{INTENTS[s].title.split(':')[0]}</Link>)}
        </nav>
        <nav aria-label="Networks">
          <p className={h}>Dust recovery by network</p>
          {SCAN_CHAIN_SLUGS.map((c) => <Link key={c} href={`/dust-recovery/${c}`} className={a}>{chainMap[c]} dust</Link>)}
        </nav>
        <nav aria-label="Blog">
          <p className={h}>From the blog</p>
          {POSTS.slice(0, 6).map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className={a}>{p.h1}</Link>)}
        </nav>
        <nav aria-label="Resources">
          <p className={h}>Resources</p>
          <Link href="/learn" className={a}>Learn</Link>
          <Link href="/learn/network" className={a}>Network guides</Link>
          <Link href="/bridge" className={a}>Bridge routes</Link>
          <Link href="/tokens" className={a}>Token dust guides</Link>
          <Link href="/faq" className={a}>FAQ</Link>
        </nav>
        <nav aria-label="Legal">
          <p className={h}>Company</p>
          <Link href="/security" className={a}>Security</Link>
          <Link href="/privacy" className={a}>Privacy</Link>
          <Link href="/terms" className={a}>Terms</Link>
        </nav>
      </div>
      <p className="mt-10 text-center text-[9px] uppercase tracking-[0.4em] text-gray-700">
        © 2026 Dust Sweeper Protocol • Powered by LI.FI & Alchemy
      </p>
    </footer>
  )
}
