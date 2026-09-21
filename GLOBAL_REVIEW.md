# Dust Sweeper Global Review — 7-network discovery vs 60+ LI.FI execution

## Product architecture

- **Dust Finder / wallet discovery:** Alchemy currently queries 7 networks: Ethereum, BNB Chain, Polygon, Arbitrum, Base, Optimism, and Avalanche.
- **Swap / Bridge / supported Recovery:** LI.FI is the execution and routing layer and is not limited to those 7 discovery networks. The site describes LI.FI as supporting 60+ blockchains; actual route availability depends on asset, source chain, destination, liquidity, and the live quote.
- **Recovery default:** when a discovered asset has a compatible same-chain route, the default destination is the asset's source network. Users can select another destination in the LI.FI flow when supported.
- **Security scanner:** GoPlus coverage is a separate concern from Alchemy discovery and LI.FI execution. The current client code checks 6 GoPlus chain IDs.

## Global changes made

1. Preserved the full multi-chain SEO/guide system in `learn/data.ts`, including non-Alchemy chains such as Solana, zkSync, Linea, Mantle, Scroll, Blast, Celestia, Sei, Sui, Aptos, Fantom, Cronos, Gnosis, Metis, Manta, Starknet, and Zora.
2. Preserved the 24 `/dust-recovery/[chain]` static pages. These pages now clearly distinguish Alchemy discovery from LI.FI execution instead of implying that every page's chain is scanned by Alchemy.
3. Updated Dust Recovery copy to describe same-chain recovery as the default and cross-chain routing as an available option when supported.
4. Removed the inaccurate blog claim that assets can be moved from 20 networks to 1 in one click.
5. Replaced the inaccurate “Smart Risk Scoring” wording with factual GoPlus security-signal language.
6. Updated Risk Scanner pages so they do not imply that the risk scanner performs Dust Finder discovery or one-click consolidation.
7. Updated FAQ, Terms, README, and Security documentation to preserve the 7-vs-60+ distinction.
8. Kept the existing LI.FI Swap/Bridge coverage and SEO bridge-pair system intact.
9. Kept the existing same-chain recovery implementation in `app/page.tsx`.

## Important validation point

The phrase “7 networks” should only describe the current Alchemy/Dust Finder discovery layer. It must not be used to describe the overall Swap/Bridge/LI.FI capability.

## Files intentionally preserved

- `app/learn/data.ts` multi-chain list and bridge pair generation
- `app/dust-recovery/[chain]/page.tsx` 24 chain pages
- `app/bridge/[pair]/page.tsx` bridge route system
- `app/page.tsx` LI.FI Swap/Bridge/Recovery UI and same-chain recovery default

## Build

After copying this project, run:

```bash
npm install
npm run build
```

No claim in this review should be interpreted as a guarantee that LI.FI will return a route for every asset or every pair of chains.
