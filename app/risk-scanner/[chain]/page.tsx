import { Metadata } from 'next';

const descriptions: Record<string, string> = {
  ethereum: "Scan your Ethereum wallet to discover forgotten tokens and malicious contracts. We analyze the mainnet to find every cent left behind.",
  polygon: "Small amounts on Polygon often go unnoticed. Scan your address to identify dust and consolidate your assets in one click.",
  bsc: "Don't let forgotten BEP-20 tokens sit idle. Our scanner finds hidden value across the BSC network and prepares it for migration.",
  arbitrum: "Arbitrum's L2 can hold fragmented balances. Identify your assets and secure your wallet from legacy contract risks.",
  base: "As the Base ecosystem grows, so do forgotten balances. Scan for hidden tokens and secure your wallet on the Coinbase L2.",
  default: "Review supported wallet data and token-security signals for supported networks. Dust Finder balance discovery is separate from this risk check."
};

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chain.charAt(0).toUpperCase() + chain.slice(1);
  return {
    alternates: { canonical: `https://app.dustsweepertool.com/risk-scanner/${chain}` },
    title: `Scan ${name} & Other Supported Networks | Dust Sweeper`,
    description: `Discover forgotten tokens on ${name} and the other supported networks. Consolidate your crypto dust into one single chain.`,
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
          6 NETWORKS CHECKED
        </div>
        
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight">
          Find Forgotten Tokens on <span className="text-blue-500">{displayTitle}</span>
        </h1>
        
        <p className="mb-12 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          {text} This page covers the networks currently checked by the Scam Contract Scanner. Swap and cross-chain recovery are handled separately through LI.FI.
        </p>
        
        <a href="/" 
           className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 uppercase tracking-widest"
           style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>
          Scan & Consolidate {displayTitle}
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