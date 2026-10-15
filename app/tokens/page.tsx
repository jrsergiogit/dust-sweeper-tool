import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '../components/JsonLd'
import { breadcrumbLd } from '../lib/seo'
import { TOKEN_DATA } from './token-data'

export const metadata: Metadata = {
  title: 'Crypto Dust Token Guides: SHIB, PEPE, ARB, LINK & More',
  description: 'Explore guides for small and leftover balances of popular crypto tokens and learn how to evaluate, consolidate, or ignore token dust safely.',
  alternates: { canonical: 'https://dustsweepertool.com/tokens' },
}

const tokens = Object.entries(TOKEN_DATA).map(([slug, t]) => [slug, t.name, t.chain] as const)

export default function TokensPage() {
  return <main className="bg-[#0B0C10] text-white min-h-screen py-20 px-6"><JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Token guides', path: '/tokens' }])} /><div className="max-w-6xl mx-auto">
    <div className="max-w-3xl mb-12"><div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Token Guides</div><h1 className="text-4xl md:text-6xl font-black mb-5">Crypto Dust Token Guides</h1><p className="text-xl text-gray-400">Understand small or leftover token balances, what they may represent, and what to check before trying to move or consolidate them.</p></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{tokens.map(([slug,name,chain]) => <Link key={slug} href={`/tokens/${slug}`} className="border border-white/10 bg-[#030303] rounded-2xl p-5 hover:border-white/25 transition-colors"><div className="text-lg font-bold">{name} dust</div><div className="text-xs text-gray-500 mt-2 uppercase tracking-widest">{chain}</div></Link>)}</div>
  </div></main>
}
