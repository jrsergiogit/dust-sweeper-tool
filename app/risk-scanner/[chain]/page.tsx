import { Metadata } from 'next';

const descriptions: Record<string, string> = {
  ethereum: "Review Ethereum token-security signals and contract data. The risk scanner is separate from Dust Finder balance discovery.",
  polygon: "Review token-security signals for assets on Polygon. Dust Finder balance discovery and LI.FI execution are separate tools.",
  bsc: "Review token-security signals for BEP-20 contracts on BNB Chain. Dust Finder balance discovery and LI.FI recovery are separate steps.",
  arbitrum: "Review token-security signals for contracts on Arbitrum. Dust Finder balance discovery is separate from this risk check.",
  base: "Review token-security signals for contracts on Base. Dust Finder balance discovery is separate from this risk check.",
  default: "Review supported wallet data and token-security signals for supported networks. Dust Finder balance discovery is separate from this risk check."
};

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chain.charAt(0).toUpperCase() + chain.slice(1);
  return {
    alternates: { canonical: `https://dustsweepertool.com/risk-scanner/${chain}` },
    title: `Token Risk Scanner: ${name} | Dust Sweeper`,
    description: `Review token-security signals for ${name}. Dust Finder balance discovery and LI.FI swap, bridge, and recovery execution are separate tools.`,
  };
}

export default async function Page({ params }: { params: Promise<{ chain: string }> }) {
  const { chain } = await params;
  const chainName = chain.toLowerCase();
  const displayTitle = chain.toUpperCase();
  const text = descriptions[chainName] || descriptions.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#0B0C10] text-white p-6">
      <div className="w-full max-w-4xl p-10 bg-[#030303] rounded-3xl border border-white/5 backdrop-blur-sm text-center">
        
        <div className="inline-block px-4 py-1 mb-8 text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase border border-white/10 bg-white/5 rounded-full">
          6 NETWORKS CURRENTLY CHECKED
        </div>
        
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight">
          Find Forgotten Tokens on <span className="text-blue-500">{displayTitle}</span>
        </h1>
        
        <p className="mb-12 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          {text} This page covers one of the networks currently checked by the Scam Contract Scanner. Dust Finder balance discovery is separate, while swap, bridge, and supported recovery routes are handled through LI.FI.
        </p>
        
        <a href="/" 
           className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 uppercase tracking-widest"
           style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>
          Check {displayTitle} Risk
        </a>
        
        <div className="mt-10 grid grid-cols-3 gap-4 opacity-30 grayscale italic text-[10px] uppercase tracking-tighter">
          <span>ETH Mainnet</span>
          <span>Polygon PoS</span>
          <span>Base L2</span>
        </div>
      </div>
    </div>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const chains = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'base', 'optimism'];
  return chains.map((c) => ({ chain: c }));
}