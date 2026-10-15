// Central SEO helpers shared by every public page.
export const SITE_URL = 'https://dustsweepertool.com'
export const SITE_NAME = 'Dust Sweeper Tool'
export const LAST_UPDATED = '2026-10-14'

// Networks that Dust Finder (Alchemy) actually scans today.
export const SCAN_NETWORKS = [
  'Ethereum', 'BNB Smart Chain', 'Polygon', 'Arbitrum', 'Base', 'Optimism', 'Avalanche',
] as const

export type Faq = readonly [string, string]

export function abs(path: string) {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  }
}

export function faqLd(faqs: readonly Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export function articleLd(o: {
  title: string
  description: string
  path: string
  published?: string
  modified?: string
  type?: 'Article' | 'TechArticle' | 'BlogPosting'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': o.type ?? 'Article',
    headline: o.title,
    description: o.description,
    inLanguage: 'en',
    ...(o.published ? { datePublished: o.published } : {}),
    dateModified: o.modified ?? LAST_UPDATED,
    author: { '@type': 'Organization', name: 'Dust Sweeper Team', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(o.path) },
    image: `${SITE_URL}/og-image.png`,
  }
}
