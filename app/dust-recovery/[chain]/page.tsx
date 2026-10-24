import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { chains, chainMap, getChainProfile, isIndexableBridge, SCAN_CHAIN_SLUGS, bridgePairs } from '../../learn/data';
import { SITE_URL, SCAN_NETWORKS, breadcrumbLd, faqLd, type Faq } from '../../lib/seo';

export const dynamicParams = false;
export async function generateStaticParams() { return chains.map(([c]) => ({ chain: c })); }

const scanned = (chain: string) => (SCAN_CHAIN_SLUGS as readonly string[]).includes(chain);

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chainMap[chain];
  if (!name) return {};
  const url = `${SITE_URL}/dust-recovery/${chain}`;
  const title = `Recover ${name} Dust: Find Small Balances & Compare Routes`;
  const description = scanned(chain)
    ? `Find small and forgotten ${name} token balances from your public address and compare swap or bridge routes before you sign.`
    : `How to evaluate small ${name} balances, what to check before moving them and which tools fit this network.`;
  return {
    title, description,
    alternates: { canonical: url },
    robots: scanned(chain) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  };
}

export default async function Page({ params }: { params: Promise<{ chain: string }> }) {
  const { chain } = await params;
  const name = chainMap[chain];
  if (!name) return null;
  const path = `/dust-recovery/${chain}`;
  const p = getChainProfile(chain);
  const isScanned = scanned(chain);
  const routes = bridgePairs.filter((r) => r.from === chain && isIndexableBridge(r.slug)).slice(0, 6);

  const faq: Faq[] = [
    [`How do I find forgotten tokens on ${name}?`, isScanned
      ? `Open Dust Sweeper, enter or connect your public address and run the Dust Finder. It reads ${name} balances without any permission to spend, then you verify each token before acting.`
      : `Dust Finder does not scan ${name} today. Use a block explorer or a wallet built for ${name} to list balances, and apply the checks on this page.`],
    [`Is it worth recovering small ${name} balances?`, `Only if the value left after network fees, route fees and price impact is clearly positive. ${p.feeFocus}`],
    [`Is it safe to scan my ${name} wallet?`, `A read-only scan uses only your public address. Never share a seed phrase or private key, and review each transaction before signing it in your own wallet.`],
  ];

  return (
    <main className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <JsonLd data={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Dust recovery', path: '/learn/network' }, { name, path }]), faqLd(faq)]} />
      <div className="max-w-4xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-14 rounded-3xl">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href={`/learn/network/${chain}`} className="hover:text-white">{name} guide</Link>
        </nav>
        <div className="inline-block px-4 py-1 mb-6 text-[10px] font-bold tracking-[0.3em] text-emerald-500 uppercase border border-emerald-500/20 bg-emerald-500/5 rounded-full">Dust recovery • {p.role}</div>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight">Recover {name} Dust</h1>
        <p className="mb-8 text-xl text-gray-400 leading-relaxed">
          {isScanned
            ? `Dust Finder reads your public address on ${name} and shows small and forgotten balances. LI.FI-powered swap and bridge routes let you compare options before you sign.`
            : `${name} is not one of the networks Dust Finder scans today. This guide explains what to check before moving small ${name} balances.`}
        </p>

        <div className="mb-8 rounded-2xl border border-pink-500/30 bg-pink-500/5 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Quick answer</div>
          <p className="text-gray-200">Small {name} balances are worth moving only when what remains after fees is clearly positive. Scan read-only, verify each token, then compare a live route.</p>
        </div>

        <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
          <h2 className="text-2xl font-bold text-white">{name} at a glance</h2>
          <p>{p.architecture}</p>
          <ul className="list-disc pl-6 space-y-3 text-gray-400">
            <li><strong className="text-gray-200">Fees:</strong> {p.feeFocus}</li>
            <li><strong className="text-gray-200">Assets:</strong> {p.assetFocus}</li>
            <li><strong className="text-gray-200">Security:</strong> {p.securityFocus}</li>
          </ul>

          <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
          <div className="space-y-6">{faq.map(([q, a]) => <div key={q}><h3 className="text-xl font-bold text-white mb-2">{q}</h3><p className="text-gray-400">{a}</p></div>)}</div>

          {isScanned && <p className="text-sm text-gray-500">Networks scanned by Dust Finder: {SCAN_NETWORKS.join(', ')}.</p>}

          <Link href="/?tool=finder" className="inline-block px-10 py-4 text-sm font-black rounded-xl text-white" style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>SCAN FOR {name.toUpperCase()} DUST</Link>

          <h2 className="text-2xl font-bold text-white">Keep exploring</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link href={`/learn/network/${chain}`} className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">{name} wallet guide →</Link>
            {isScanned && chain !== 'avalanche' && <Link href={`/risk-scanner/${chain}`} className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">{name} token risk scanner →</Link>}
            <Link href="/crypto-dust-calculator" className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">Dust cost calculator →</Link>
            {routes.map((r) => <Link key={r.slug} href={`/bridge/${r.slug}`} className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">{r.fromName} → {r.toName} →</Link>)}
          </div>
        </div>
      </div>
    </main>
  );
}
