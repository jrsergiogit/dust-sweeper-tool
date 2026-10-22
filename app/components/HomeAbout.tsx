import Link from 'next/link'
import JsonLd from './JsonLd'
import { SCAN_NETWORKS, SITE_URL, faqLd, type Faq } from '../lib/seo'

const FAQS: readonly Faq[] = [
  ['What is Dust Sweeper Tool?', 'Dust Sweeper Tool is a free, non-custodial web tool that scans a public wallet address for small or forgotten token balances, shows contract risk signals, and compares swap and bridge routes provided by LI.FI.'],
  ['Which networks does the scan cover?', `The scan reads balances on ${SCAN_NETWORKS.join(', ')}.`],
  ['Do I need a seed phrase or private key?', 'No. The scan only needs a public wallet address. Swaps and bridges are signed in your own wallet, and the tool never holds your funds.'],
  ['What does it cost?', 'Scanning is free. Dust recovery routes include a 5% service fee, and the standard swap and bridge widgets include a 1% service fee, in addition to network gas and route costs shown before you confirm.'],
  ['Can I be sure a token is safe?', 'No. Risk indicators are automated signals from third-party data and can be wrong. Review the live quote and transaction details in your wallet before you confirm anything.'],
]

export default function HomeAbout() {
  return (
    <section aria-labelledby="about-dust-sweeper" className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 text-gray-300 sm:px-6">
      <JsonLd data={faqLd(FAQS)} />
      <h2 id="about-dust-sweeper" className="text-xl font-bold text-white">What is Dust Sweeper Tool?</h2>
      <p className="mt-3 leading-7">Dust Sweeper Tool is a free, non-custodial web tool for finding small and forgotten crypto balances. Paste a public wallet address and it lists tokens found on {SCAN_NETWORKS.join(', ')}. You can then compare recovery, swap and bridge routes through LI.FI and confirm each step in your own wallet.</p>
      <h3 className="mt-8 text-lg font-semibold text-white">How it works</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 leading-7">
        <li>Enter a public wallet address. No seed phrase or private key is ever needed.</li>
        <li>Pick an asset from the scan results and review the available routes, costs and amount received.</li>
        <li>Connect your wallet and confirm the approval and transaction in the wallet app. Confirmed blockchain transactions cannot be reversed.</li>
      </ol>
      <h3 className="mt-8 text-lg font-semibold text-white">Frequently asked questions</h3>
      <dl className="mt-3 space-y-5">
        {FAQS.map(([q, a]) => (
          <div key={q}><dt className="font-semibold text-white">{q}</dt><dd className="mt-1 leading-7">{a}</dd></div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-gray-400">More detail: <Link href="/faq" className="text-purple-300 underline underline-offset-4">FAQ</Link>, <Link href="/security" className="text-purple-300 underline underline-offset-4">Security</Link>, <Link href="/learn" className="text-purple-300 underline underline-offset-4">Learn</Link>. Source: {SITE_URL}</p>
    </section>
  )
}
