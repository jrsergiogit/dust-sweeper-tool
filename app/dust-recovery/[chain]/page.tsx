import { Metadata } from 'next';

const recoveryTexts: Record<string, string> = {
  ethereum: "Tired of high gas fees trapping your small balances? Recover your ETH dust and bridge it to your preferred network instantly.",
  polygon: "Convert your forgotten Polygon tokens into a single asset. Scan for leftovers and stop leaving money on the table.",
  bsc: "Small BEP-20 balances add up. Dust Sweeper can use LI.FI-powered cross-chain routes to help consolidate supported assets when a route is available.",
  arbitrum: "Unlock trapped liquidity on Arbitrum. Find forgotten assets and consolidate your entire Web3 portfolio in minutes.",
  base: "Clean up supported Base assets and use LI.FI-powered cross-chain routes to consolidate them when a route is available.",
  default: "Use Dust Sweeper for supported asset discovery and LI.FI-powered cross-chain consolidation. Route availability depends on the asset and network."
};

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chain.charAt(0).toUpperCase() + chain.slice(1);
  return {
    alternates: { canonical: `https://dustsweepertool.com/dust-recovery/${chain}` },
    title: `Recover ${name} Dust & Unify Balances | Dust Sweeper`,
    description: `Explore ${name} asset recovery and LI.FI-powered cross-chain consolidation. Route availability depends on the asset, source network, destination, liquidity, and current quote.`,
  };
}

export default async function Page({ params }: { params: Promise<{ chain: string }> }) {
  const { chain } = await params;
  const chainName = chain.toLowerCase();
  const displayTitle = chain.toUpperCase();
  const text = recoveryTexts[chainName] || recoveryTexts.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#0B0C10] text-white p-6">
      <div className="w-full max-w-4xl p-10 bg-[#030303] rounded-3xl border border-white/5 backdrop-blur-sm text-center shadow-2xl">
        
        <div className="inline-block px-4 py-1 mb-8 text-[10px] font-bold tracking-[0.3em] text-emerald-500 uppercase border border-emerald-500/20 bg-emerald-500/5 rounded-full">
          MULTI-CHAIN CONSOLIDATION
        </div>
        
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight">
          Unify your <span className="text-emerald-400">{displayTitle}</span> Assets
        </h1>
        
        <p className="mb-12 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          {text} Dust Finder currently discovers balances across 7 networks using Alchemy. When a supported asset and route are available, LI.FI can handle the cross-chain execution and consolidation.
        </p>
        
        <a href="/" 
           className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 uppercase tracking-widest"
           style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>
          Open Dust Sweeper
        </a>

        <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest">
          Powered by LI.FI & Alchemy for Cross-Chain Efficiency
        </p>
      </div>
    </div>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const chains = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'base', 'optimism', 'avalanche', 'solana', 'zksync', 'linea', 'mantle', 'scroll', 'blast', 'celestia', 'sei', 'sui', 'aptos', 'fantom', 'cronos', 'gnosis', 'metis', 'manta', 'starknet', 'zora'];
  return chains.map((c) => ({ chain: c }));
}