import JsonLd from './JsonLd'
import { SCAN_NETWORKS, faqLd, type Faq } from '../lib/seo'

const FAQS: readonly Faq[] = [
  ['What is Dust Sweeper Tool?', 'Dust Sweeper Tool is a free, non-custodial web tool that scans a public wallet address for small or forgotten token balances, shows contract risk signals, and compares swap and bridge routes provided by LI.FI.'],
  ['Which networks does the scan cover?', `The scan reads balances on ${SCAN_NETWORKS.join(', ')}.`],
  ['Do I need a seed phrase or private key?', 'No. The scan only needs a public wallet address. Swaps and bridges are signed in your own wallet, and the tool never holds your funds.'],
  ['What does it cost?', 'Scanning is free. Dust recovery routes include a 5% service fee, and the standard swap and bridge widgets include a 1% service fee, in addition to network gas and route costs shown before you confirm.'],
  ['Can I be sure a token is safe?', 'No. Risk indicators are automated signals from third-party data and can be wrong. Review the live quote and transaction details in your wallet before you confirm anything.'],
]

// Keep FAQ structured data for search engines, but remove the duplicate visible
// explanatory section from the homepage. The FAQ page remains the user-facing source.
export default function HomeAbout() {
  return <JsonLd data={faqLd(FAQS)} />
}
