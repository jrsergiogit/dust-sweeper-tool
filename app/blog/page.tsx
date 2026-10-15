import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '../components/JsonLd'
import { POSTS } from './posts'
import { SITE_URL, breadcrumbLd } from '../lib/seo'

export const metadata: Metadata = {
  title: 'Crypto Wallet Security & Dust Blog | Dust Sweeper',
  description: 'Practical guides on crypto dust, wallet security, token approvals, gas fees and finding forgotten tokens across networks.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0B0C10] text-white py-20 px-6">
      <JsonLd data={[
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
        { '@context': 'https://schema.org', '@type': 'Blog', name: 'Dust Sweeper Blog', url: `${SITE_URL}/blog`,
          blogPost: POSTS.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.published })) },
      ]} />
      <div className="max-w-5xl mx-auto">
        <header className="mb-14">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Dust Sweeper • Blog</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Web3 Wallet & Crypto Security</h1>
          <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">Practical articles about forgotten balances, wallet security, token approvals, gas costs and safer Web3 workflows.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-5">
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group border border-white/5 bg-[#030303] p-7 rounded-3xl hover:border-white/15 transition-all">
              <div className="text-[10px] text-pink-500 uppercase tracking-[0.25em] mb-3">{p.category} • {p.readMins} min</div>
              <h2 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">{p.title}</h2>
              <p className="text-gray-400 leading-relaxed">{p.description}</p>
              <span className="inline-block mt-5 text-xs font-black tracking-widest text-gray-500 group-hover:text-white">READ ARTICLE →</span>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/learn" className="text-pink-400 hover:text-pink-300 font-bold">Explore all Web3 guides →</Link>
        </div>
      </div>
    </main>
  )
}
