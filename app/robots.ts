import type { MetadataRoute } from 'next'

const PRIVATE = ['/api/', '/admin/']
// Rastreadores de busca/assistentes de IA liberados de forma explicita (um grupo especifico ignora o '*', entao repetimos os bloqueios).
const AI_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: 'https://dustsweepertool.com/sitemap.xml',
    host: 'https://dustsweepertool.com',
  }
}
