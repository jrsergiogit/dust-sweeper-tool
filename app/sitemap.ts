import { MetadataRoute } from 'next'
import { topics, SCAN_CHAIN_SLUGS, INDEXED_NETWORK_HUBS, PRIORITY_TOPICS, PRIORITY_BRIDGE_SLUGS } from './learn/data'
import { INTENTS } from './lib/seo-intents'
import { POSTS } from './blog/posts'
import { TOKEN_SLUGS } from './tokens/token-data'
import { SITE_URL, LAST_UPDATED } from './lib/seo'

// Only pages with distinct, useful content are listed. The long tail
// (hundreds of chain x topic and bridge-pair pages) stays reachable for users
// but is noindex and kept out of the sitemap so Google focuses on what matters.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(LAST_UPDATED)
  const e = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => ({
    url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority,
  })

  return [
    e('', 1, 'daily'),
    e('/learn', 0.9, 'weekly'),
    e('/blog', 0.9, 'weekly'),
    e('/bridge', 0.8, 'weekly'),
    e('/tokens', 0.8, 'weekly'),
    e('/learn/network', 0.7, 'weekly'),
    e('/faq', 0.7),
    e('/security', 0.5, 'yearly'),
    e('/privacy', 0.3, 'yearly'),
    e('/terms', 0.3, 'yearly'),
    ...POSTS.map((p) => e(`/blog/${p.slug}`, 0.85)),
    ...Object.keys(INTENTS).map((s) => e(`/${s}`, 0.75)),
    ...TOKEN_SLUGS.map((s) => e(`/tokens/${s}`, 0.65)),
    ...SCAN_CHAIN_SLUGS.map((c) => e(`/dust-recovery/${c}`, 0.7, 'weekly')),
    ...SCAN_CHAIN_SLUGS.filter((c) => c !== 'avalanche').map((c) => e(`/risk-scanner/${c}`, 0.6, 'weekly')),
    ...topics.map(([s]) => e(`/learn/${s}`, 0.65)),
    ...INDEXED_NETWORK_HUBS.map((c) => e(`/learn/network/${c}`, 0.6)),
    ...SCAN_CHAIN_SLUGS.flatMap((c) => PRIORITY_TOPICS.map((t) => e(`/learn/${c}/${t}`, 0.5))),
    ...PRIORITY_BRIDGE_SLUGS.map((s) => e(`/bridge/${s}`, 0.6)),
  ]
}
