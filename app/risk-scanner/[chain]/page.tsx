import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '../../components/JsonLd';
import { chainMap, getChainProfile } from '../../learn/data';
import { SITE_URL, breadcrumbLd, faqLd, type Faq } from '../../lib/seo';

const CHAINS = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'base', 'optimism'] as const;

export const dynamicParams = false;
export async function generateStaticParams() { return CHAINS.map((c) => ({ chain: c })); }

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chainMap[chain];
  if (!name) return {};
  const url = `${SITE_URL}/risk-scanner/${chain}`;
  const title = `${name} Token Risk Scanner: Check a Contract Before You Trade`;
  const description = `Check ${name} token contract risk signals such as honeypot behaviour, sell restrictions and ownership permissions. Automated heuristics, not a guarantee.`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630 }] } };
}

export default async function Page({ params }: { params: Promise<{ chain: string }> }) {
  const { chain } = await params;
  const name = chainMap[chain];
  if (!name) return null;
  const path = `/risk-scanner/${chain}`;
  const p = getChainProfile(chain);
  const faq: Faq[] = [
    [`How do I check if a ${name} token is a scam?`, `Open the token contract on the ${name} block explorer, review holders, liquidity and verified source code, and run an automated risk scan for common patterns such as honeypot behaviour or high sell taxes. Treat the result as one input, not proof.`],
    [`What is a honeypot token on ${name}?`, `A token whose contract lets you buy but blocks or heavily taxes selling. Automated scanners flag common patterns, but novel scams can slip through.`],
    [`Does a clean result mean the token is safe?`, `No. Scanners rely on heuristics and can produce false positives or miss new patterns. Combine the scan with your own research.`],
  ];
  return (
    <main className="bg-[#0B0C10] text-white min-h-screen py-20 px-6">
      <JsonLd data={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Risk scanner', path: '/learn/token-contract-risk' }, { name, path }]), faqLd(faq)]} />
      <div className="max-w-4xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-14 rounded-3xl">
        <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mb-8 flex flex-wrap gap-x-2">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href={`/learn/network/${chain}`} className="hover:text-white">{name} guide</Link>
        </nav>
        <div className="inline-block px-4 py-1 mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase border border-white/10 bg-white/5 rounded-full">Token risk • {p.role}</div>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight">{name} Token Risk Scanner</h1>
        <p className="mb-8 text-xl text-gray-400 leading-relaxed">Review token-security signals for contracts on {name} before you buy, sell or approve anything. The scan is separate from Dust Finder balance discovery.</p>

        <div className="mb-8 rounded-2xl border border-pink-500/30 bg-pink-500/5 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Quick answer</div>
          <p className="text-gray-200">Paste a {name} token contract address into the scanner to see automated risk signals. Use it alongside a block explorer check, and never sign a transaction you do not understand.</p>
        </div>

        <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
          <h2 className="text-2xl font-bold text-white">What to check on {name}</h2>
          <p>{p.assetFocus}</p>
          <ul className="list-disc pl-6 space-y-3 text-gray-400">
            <li>Sell restrictions or very high transfer taxes (a honeypot pattern).</li>
            <li>Owner permissions such as minting, pausing or blacklisting.</li>
            <li>Liquidity depth and whether it is locked or controlled by one address.</li>
            <li>Holder concentration and how recently the contract was created.</li>
            <li>{p.securityFocus}</li>
          </ul>
          <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
          <div className="space-y-6">{faq.map(([q, a]) => <div key={q}><h3 className="text-xl font-bold text-white mb-2">{q}</h3><p className="text-gray-400">{a}</p></div>)}</div>
          <Link href="/?tool=safety#tools" className="inline-block px-10 py-4 text-sm font-black rounded-xl text-white" style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>CHECK A {name.toUpperCase()} CONTRACT</Link>
          <h2 className="text-2xl font-bold text-white">Keep exploring</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link href={`/dust-recovery/${chain}`} className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">{name} dust recovery →</Link>
            <Link href="/learn/honeypot-tokens" className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">Honeypot tokens explained →</Link>
            <Link href="/learn/token-contract-risk" className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">How to check token contract risk →</Link>
            <Link href="/spam-tokens" className="border border-white/10 rounded-xl px-4 py-3 text-gray-300 hover:text-white">Spam tokens guide →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
