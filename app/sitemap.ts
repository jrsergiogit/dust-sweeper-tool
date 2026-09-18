import { MetadataRoute } from 'next'
import { chains, topics, bridgePairs } from './learn/data'

const SEO_INTENTS = [
  'crypto-dust',
  'leftover-crypto',
  'small-crypto-balance',
  'tiny-crypto-balance',
  'worthless-tokens',
  'stuck-crypto',
  'tokens-i-cant-sell',
  'unwanted-tokens',
  'how-to-consolidate-crypto',
  'crypto-dust-calculator',
  'crypto-wallet-scanner',
  'crypto-wallet-analyzer',
  'find-forgotten-crypto',
  'wallet-cleanup',
  'wallet-audit-tool',
  'small-crypto-amounts',
  'convert-small-crypto-balances',
  'crypto-balance-cleanup',
  'unknown-tokens',
  'spam-tokens',
  'crypto-portfolio-cleanup',
  'multi-chain-wallet-cleanup',
  'crypto-wallet-checkup',
  'dust-token-scanner',
  'small-balance-crypto',
] as const

const RISK_CHAINS = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'base', 'optimism'] as const

const TOKEN_SLUGS = [
  'shib-dust','pepe-dust','arb-dust','matic-dust','pol-dust','uni-dust','xrp-dust',
  'bonk-dust','doge-dust','floki-dust','jup-dust','wif-dust','aave-dust','link-dust',
  'avax-dust','op-dust','cake-dust','crv-dust','comp-dust','snx-dust','sushi-dust',
  'ena-dust','ondo-dust','tia-dust','sei-dust','sui-dust','apt-dust','inj-dust',
  'near-dust','cro-dust',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://app.dustsweepertool.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/risk-scanner`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/dust-recovery`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/bridge`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tokens`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/security`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/blog/dust-sweeper-vs-revoke-cash`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/is-my-wallet-hacked`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/stop-wasting-gas`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/blog/hidden-airdrops-2026`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  const chainPages: MetadataRoute.Sitemap = [
    ...RISK_CHAINS.map((chain) => ({ url: `${baseUrl}/risk-scanner/${chain}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...chains.map(([chain]) => ({ url: `${baseUrl}/dust-recovery/${chain}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ]

  const learnPages: MetadataRoute.Sitemap = topics.map(([slug]) => ({
    url: `${baseUrl}/learn/${slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7,
  }))

  const networkHubPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/learn/network`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    ...chains.map(([chain]) => ({ url: `${baseUrl}/learn/network/${chain}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 })),
  ]

  const intentPages: MetadataRoute.Sitemap = SEO_INTENTS.map((slug) => ({
    url: `${baseUrl}/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.65,
  }))

  const tokenPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/tokens`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...TOKEN_SLUGS.map((slug) => ({ url: `${baseUrl}/tokens/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.65 })),
  ]

  // Keep the existing bridge system intact. Only the highest-value routes are exposed in the sitemap.
  const priorityBridgeSlugs = new Set([
    'ethereum-to-base', 'ethereum-to-arbitrum', 'ethereum-to-polygon',
    'base-to-arbitrum', 'base-to-polygon', 'arbitrum-to-base',
    'polygon-to-base', 'bsc-to-base', 'optimism-to-base',
    'avalanche-to-arbitrum', 'ethereum-to-optimism', 'ethereum-to-avalanche',
    'arbitrum-to-polygon', 'polygon-to-arbitrum', 'base-to-optimism',
  ])

  const bridgePages: MetadataRoute.Sitemap = bridgePairs
    .filter(({ slug }) => priorityBridgeSlugs.has(slug))
    .map(({ slug }) => ({
      url: `${baseUrl}/bridge/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6,
    }))

  return [...staticPages, ...chainPages, ...learnPages, ...networkHubPages, ...intentPages, ...tokenPages, ...bridgePages]
}
