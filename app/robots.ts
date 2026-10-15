import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
    ],
    sitemap: 'https://dustsweepertool.com/sitemap.xml',
    host: 'https://dustsweepertool.com',
  }
}
