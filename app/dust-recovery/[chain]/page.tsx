import { Metadata } from 'next';

const recoveryTexts: Record<string, string> = {
  ethereum: "Review small Ethereum balances and compare recovery routes. The default recovery destination is the same network when a compatible route is available; cross-chain destinations can be selected when supported.",
  polygon: "Review forgotten Polygon balances and compare supported recovery routes. Same-chain recovery is the default when a compatible route is available; cross-chain destinations can be selected when supported.",
  bsc: "Small BEP-20 balances add up. Dust Sweeper can use LI.FI-powered same-chain or cross-chain routes to recover supported assets when a route is available.",
  arbitrum: "Review forgotten Arbitrum assets and compare supported recovery routes. Same-chain recovery is the default when a compatible route is available.",
  base: "Review supported Base assets and use LI.FI-powered same-chain or cross-chain routes when a route is available.",
  default: "Use Dust Sweeper for supported asset discovery and LI.FI-powered recovery routes. Same-chain recovery is the default; cross-chain execution is available when the selected asset and route support it."
};

export async function generateMetadata({ params }: { params: Promise<{ chain: string }> }): Promise<Metadata> {
  const { chain } = await params;
  const name = chain.charAt(0).toUpperCase() + chain.slice(1);
  return {
    alternates: { canonical: `https://dustsweepertool.com/dust-recovery/${chain}` },
    title: `Recover ${name} Dust & Compare Routes | Dust Sweeper`,
    description: `Explore ${name} asset recovery and LI.FI-powered same-chain or cross-chain routes. Discovery and route availability depend on the asset, source network, destination, liquidity, and current quote.`,
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
          DUST RECOVERY • ROUTE OPTIONS
        </div>
        
        <h1 className="mb-8 text-4xl font-extrabold tracking-tight lg:text-6xl leading-tight">
          Recover <span className="text-emerald-400">{displayTitle}</span> Assets
        </h1>
        
        <p className="mb-12 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          {text} Dust Finder currently discovers balances across 7 networks using Alchemy. LI.FI separately powers swap, bridge, and supported recovery routing across its broader multichain ecosystem. Same-chain recovery is the default for discovered assets when a compatible route exists; cross-chain routes remain available when supported.
        </p>
        
        <a href="/" 
           className="inline-block px-12 py-5 text-sm font-black text-white transition-all rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 uppercase tracking-widest"
           style={{ background: 'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)' }}>
          Open Dust Sweeper
        </a>

        <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest">
          Alchemy for discovery • LI.FI for swap, bridge & recovery routing
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