import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '../../components/JsonLd'
import { POSTS, POST_MAP } from '../posts'
import { SITE_URL, articleLd, breadcrumbLd, faqLd } from '../../lib/seo'

export const dynamicParams = false
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = POST_MAP[slug]
  if (!p) return {}
  const url = `${SITE_URL}/blog/${slug}`
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url, type: 'article', publishedTime: p.published, images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: ['/og-image.png'] },
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = POST_MAP[slug]
  if (!p) return null
  const path = `/blog/${slug}`
  const related = p.related.map((s) => POST_MAP[s]).filter(Boolean)

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <JsonLd data={[
        articleLd({ title: p.title, description: p.description, path, published: p.published, type: 'BlogPosting' }),
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: p.h1, path }]),
        faqLd(p.faq),
      ]} />
      <article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href="/blog" className="hover:text-white">Blog</Link>
        </nav>
        <header className="mb-10">
          <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">{p.category} • {p.readMins} min read</div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{p.h1}</h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed">{p.intro}</p>
          <p className="mt-4 text-xs text-gray-600">Updated {new Date(p.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} • Dust Sweeper Team</p>
        </header>

        <div className="space-y-8 text-gray-300 text-lg leading-relaxed">
          {p.sections.map((s) => (
            <section key={s.h2} className="space-y-4">
              <h2 className="text-2xl font-bold text-white">{s.h2}</h2>
              {s.paras?.map((t, i) => <p key={i}>{t}</p>)}
              {s.bullets && <ul className="list-disc pl-6 space-y-3 text-gray-400">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            </section>
          ))}

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
            {p.faq.map(([q, a]) => (
              <div key={q}><h3 className="text-xl font-bold text-white mb-2">{q}</h3><p className="text-gray-400">{a}</p></div>
            ))}
          </section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-base">
            <p className="text-gray-300">Dust Sweeper is a non-custodial tool: it reads your public address and every swap or bridge is a transaction you review and sign yourself. It never needs your seed phrase.</p>
            <Link href="/?tool=finder" className="mt-5 inline-block px-8 py-4 text-sm font-black rounded-xl" style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>SCAN YOUR WALLET</Link>
          </div>

          <section className="space-y-3 text-base">
            <h2 className="text-xl font-bold text-white">Keep reading</h2>
            {related.map((r) => <Link key={r.slug} href={`/blog/${r.slug}`} className="block text-pink-400 hover:text-white">{r.title} →</Link>)}
            {p.links.map(([href, label]) => <Link key={href} href={href} className="block text-pink-400 hover:text-white">{label} →</Link>)}
          </section>
        </div>
      </article>
    </div>
  )
}
