export const chains = [
  ['ethereum', 'Ethereum'],
  ['polygon', 'Polygon'],
  ['bsc', 'BNB Smart Chain'],
  ['arbitrum', 'Arbitrum'],
  ['base', 'Base'],
  ['optimism', 'Optimism'],
  ['avalanche', 'Avalanche'],
  ['solana', 'Solana'],
  ['zksync', 'zkSync'],
  ['linea', 'Linea'],
  ['mantle', 'Mantle'],
  ['scroll', 'Scroll'],
  ['blast', 'Blast'],
  ['celestia', 'Celestia'],
  ['sei', 'Sei'],
  ['sui', 'Sui'],
  ['aptos', 'Aptos'],
  ['fantom', 'Fantom'],
  ['cronos', 'Cronos'],
  ['gnosis', 'Gnosis'],
  ['metis', 'Metis'],
  ['manta', 'Manta'],
  ['starknet', 'Starknet'],
  ['zora', 'Zora'],
] as const;

export const topics = [
  ['what-is-crypto-dust', 'What Is Crypto Dust? A Practical Guide', 'Learn what crypto dust is, why small balances accumulate, and how to identify useful versus risky tokens in a wallet.'],
  ['how-to-find-forgotten-tokens', 'How to Find Forgotten Tokens in a Wallet', 'A practical checklist for discovering forgotten balances across the networks you have used.'],
  ['wallet-cleanup-guide', 'Wallet Cleanup Guide for Web3 Users', 'How to organize a multi-chain wallet, review old assets, and reduce unnecessary clutter safely.'],
  ['dust-tokens-explained', 'Dust Tokens Explained: Small Balances and Hidden Value', 'Understand why tiny token balances appear and when they are worth consolidating.'],
  ['multi-chain-wallet-management', 'Multi-Chain Wallet Management: Best Practices', 'A simple framework for managing assets across Ethereum, L2s, and alternative networks.'],
  ['how-bridges-work', 'How Crypto Bridges Work', 'Understand the basic flow of moving assets between networks and the trade-offs to consider.'],
  ['bridge-vs-swap', 'Bridge vs Swap: What Is the Difference?', 'Learn when a bridge, a swap, or a combination of both makes sense for moving crypto.'],
  ['cross-chain-fees', 'Cross-Chain Fees Explained', 'Understand gas, bridge fees, liquidity costs, and why the final amount can differ from the quote.'],
  ['how-to-save-on-gas', 'How to Save on Gas When Moving Small Balances', 'Practical ways to avoid spending more on network fees than the value you are moving.'],
  ['wallet-security-basics', 'Wallet Security Basics for Everyday Web3', 'A straightforward security checklist covering approvals, contract addresses, signing, and backups.'],
  ['token-contract-risk', 'How to Check Token Contract Risk', 'What to inspect before interacting with an unfamiliar token contract or liquidity pool.'],
  ['honeypot-tokens', 'Honeypot Tokens: What They Are and How to Spot Them', 'Learn the warning signs of tokens that may allow buying but restrict selling.'],
  ['token-approvals', 'Token Approvals Explained', 'Why token approvals matter, what they authorize, and how to review them responsibly.'],
  ['revoke-wallet-permissions', 'How to Revoke Unused Wallet Permissions', 'A guide to reducing approval risk by reviewing and revoking permissions you no longer need.'],
  ['wallet-scams', 'Common Web3 Wallet Scams', 'Recognize common phishing, fake airdrop, malicious approval, and impersonation patterns.'],
  ['fake-airdrops', 'Fake Airdrops: How to Stay Safe', 'How fraudulent airdrops use urgency and unfamiliar contracts to trick wallet users.'],
  ['dust-recovery-strategy', 'A Strategy for Recovering Small Crypto Balances', 'How to decide which small balances are worth moving and which are better left alone.'],
  ['consolidate-crypto', 'How to Consolidate Crypto Across Networks', 'Plan a clean, low-friction consolidation workflow without losing track of chain-specific assets.'],
  ['bridge-ethereum-to-base', 'How to Move Assets from Ethereum to Base', 'A beginner-friendly overview of bridging assets from Ethereum to Base.'],
  ['bridge-ethereum-to-arbitrum', 'How to Move Assets from Ethereum to Arbitrum', 'Understand the steps and considerations when moving assets from Ethereum to Arbitrum.'],
  ['bridge-ethereum-to-polygon', 'How to Move Assets from Ethereum to Polygon', 'A practical guide to moving assets from Ethereum to Polygon while watching network fees.'],
  ['bridge-base-to-arbitrum', 'How to Move Assets from Base to Arbitrum', 'What to consider when moving assets between two popular Ethereum L2 networks.'],
  ['bridge-polygon-to-base', 'How to Move Assets from Polygon to Base', 'A simple guide to cross-chain transfers between Polygon and Base.'],
  ['bridge-bsc-to-base', 'How to Move Assets from BNB Smart Chain to Base', 'Understand the network, token, and fee considerations for a BSC-to-Base transfer.'],
  ['bridge-arbitrum-to-base', 'How to Move Assets from Arbitrum to Base', 'A practical overview of moving assets between Arbitrum and Base.'],
  ['bridge-optimism-to-base', 'How to Move Assets from Optimism to Base', 'Learn the basics of transferring supported assets from Optimism to Base.'],
  ['bridge-avalanche-to-arbitrum', 'How to Move Assets from Avalanche to Arbitrum', 'What to check before moving tokens from Avalanche to Arbitrum.'],
  ['bridge-fee-comparison', 'How to Compare Bridge Costs', 'A checklist for comparing quotes, gas, destination fees, and expected received amounts.'],
  ['bridge-slippage', 'Bridge Slippage and Minimum Received Explained', 'Understand price impact, slippage, and minimum received amounts in cross-chain transactions.'],
  ['safe-cross-chain-transfer', 'Safe Cross-Chain Transfer Checklist', 'A pre-transaction checklist designed to reduce avoidable mistakes when bridging.'],
  ['wallet-network-mismatch', 'Wallet Network Mismatch: Common Causes', 'Why a token can appear missing when the wallet is simply connected to another network.'],
  ['wrong-network-assets', 'What Happens When Assets Are on the Wrong Network?', 'How to troubleshoot assets that are present on-chain but not visible in your wallet interface.'],
  ['erc20-dust', 'ERC-20 Dust: What to Know', 'Why ERC-20 wallets accumulate tiny balances and how to evaluate them.'],
  ['bnb-dust', 'BNB Smart Chain Dust Explained', 'How small BEP-20 balances accumulate and what to consider before consolidating them.'],
  ['layer2-dust', 'L2 Dust: Ethereum Rollups and Small Balances', 'Why small balances build up across L2s and how to keep your portfolio organized.'],
  ['solana-small-balances', 'Small Balances on Solana: What to Check', 'Understand token accounts, small balances, and the differences between Solana and EVM wallets.'],
  ['portfolio-cleanup', 'Crypto Portfolio Cleanup Checklist', 'A repeatable monthly checklist for reviewing old tokens, approvals, and network balances.'],
  ['wallet-audit', 'How to Perform a Basic Wallet Audit', 'A practical process for reviewing holdings, permissions, and unfamiliar transactions.'],
  ['before-using-a-bridge', 'What to Check Before Using a Crypto Bridge', 'Questions to ask about the route, token, destination chain, fees, and transaction details.'],
  ['bridge-security', 'Crypto Bridge Security: What Users Should Verify', 'A user-focused guide to checking routes and contracts before signing a cross-chain transaction.'],
  ['cross-chain-token-support', 'Why Token Support Differs by Network', 'Why the same ticker can represent different contracts and why chain selection matters.'],
  ['wallet-address-safety', 'Wallet Address Safety: Avoiding Simple Mistakes', 'Best practices for copying, checking, and sharing wallet addresses before sending assets.'],
  ['crypto-recovery-mistakes', 'Common Crypto Recovery Mistakes', 'The errors that can turn a simple wallet cleanup into an expensive transaction.'],
  ['small-balance-economics', 'When Is a Small Crypto Balance Worth Moving?', 'A simple way to compare balance value against gas and route costs.'],
  ['dust-vs-spam-tokens', 'Dust Tokens vs Spam Tokens', 'How to distinguish small legitimate balances from unsolicited or suspicious tokens.'],
  ['unknown-token-safety', 'What to Do With an Unknown Token', 'A cautious workflow for researching an unfamiliar asset before interacting with it.'],
  ['web3-wallet-checkup', 'Web3 Wallet Checkup: A 10-Minute Routine', 'A compact recurring routine for keeping a wallet organized and safer.'],
  ['crypto-bridge-glossary', 'Crypto Bridge Glossary', 'A plain-English glossary of common terms used in cross-chain transfers.'],
  ['multi-chain-recovery', 'Multi-Chain Recovery: A Practical Workflow', 'How to inventory balances across networks before deciding what to consolidate.'],
  ['bridge-aggregators', 'Bridge Aggregators Explained', 'Learn how bridge aggregators compare routes and why quotes, liquidity, fees, and execution details matter.'],
] as const;

export const chainMap: Record<string, string> = Object.fromEntries(chains.map(([slug, name]) => [slug, name]));

export const topicMap = Object.fromEntries(topics.map(([slug, title, description]) => [slug, { title, description }])) as Record<string, { title: string; description: string }>;

export function slugifyPair(from: string, to: string) {
  return `${from}-to-${to}`;
}

export const bridgePairs = chains.flatMap(([from]) =>
  chains.filter(([to]) => to !== from).map(([to]) => ({
    from,
    to,
    slug: slugifyPair(from, to),
    fromName: chainMap[from],
    toName: chainMap[to],
  }))
);

export const topicAngles: Record<string, string> = {'what-is-crypto-dust': 'Crypto dust is usually the leftover balance created after swaps, transfers, rewards, or old positions. The important distinction is between a small legitimate balance and an unsolicited token that should never be touched.', 'how-to-find-forgotten-tokens': "Forgotten balances are often found by reviewing every network an address has used, not just the wallet's currently selected chain. Historical activity can reveal assets that a portfolio view does not emphasize.", 'wallet-cleanup-guide': 'A useful cleanup separates discovery, verification, and execution. Keeping those stages separate reduces the chance of moving an asset before confirming its contract or route.', 'dust-tokens-explained': 'A tiny balance is not automatically worthless. Its practical value depends on liquidity, transferability, network fees, and whether the token is actually legitimate.', 'multi-chain-wallet-management': 'The biggest multi-chain mistake is treating one wallet address as one portfolio. Each network has its own balances, contracts, fees, and transaction history.', 'how-bridges-work': 'A bridge route can involve contracts, liquidity providers, validators, or messaging systems depending on the design. Users should focus on the route and transaction details rather than assuming every bridge works the same way.', 'bridge-vs-swap': 'A swap changes one asset for another, while a bridge changes the network context of an asset. Some routes combine both operations, which is why the quote and final received amount matter.', 'cross-chain-fees': 'The cheapest-looking quote is not always the cheapest completed transaction. Compare source gas, bridge fees, destination costs, price impact, and the amount you actually expect to receive.', 'how-to-save-on-gas': 'For low-value balances, gas efficiency can matter more than execution speed. Consolidating only when the economics make sense is often better than moving every token immediately.', 'wallet-security-basics': 'Good wallet security is mostly about reducing avoidable signing mistakes. A read-only balance check should never require a seed phrase, and unfamiliar approvals deserve extra scrutiny.', 'token-contract-risk': "A token's name and ticker are easy to copy. The contract address, trading behavior, permissions, liquidity, and source of the token are much stronger signals when evaluating risk.", 'honeypot-tokens': 'Honeypots are dangerous because the interface can make a token look normal while selling is restricted. Treat unusually high returns, aggressive marketing, and unclear contracts as reasons to investigate.', 'token-approvals': 'An approval gives a contract permission to spend a specified token balance under the rules of that approval. Reviewing old approvals can reduce exposure to applications you no longer use.', 'revoke-wallet-permissions': 'Revoking is a risk-management action, not a way to recover a lost private key. Prioritize approvals you no longer recognize or no longer need, and verify the contract before interacting.', 'wallet-scams': 'Most wallet scams create urgency: a fake reward, a security warning, or a limited-time claim. Slowing down and verifying the destination domain and contract can prevent many losses.', 'fake-airdrops': 'An unsolicited token or airdrop is not a free invitation to interact. If claiming requires a suspicious approval or a transaction with unclear effects, do not sign it.', 'dust-recovery-strategy': 'The right recovery strategy starts with an economic threshold. A $2 balance that costs $8 to move is not the same problem as a $2 balance on a cheap network.', 'consolidate-crypto': 'Consolidation is easiest when you choose a destination network first, inventory source balances second, and only then compare routes. This creates a clear target instead of a series of disconnected transactions.', 'bridge-ethereum-to-base': 'Ethereum-to-Base transfers are often considered when users want access to lower-cost activity. Always confirm the asset representation and the current route before signing.', 'bridge-ethereum-to-arbitrum': 'Ethereum-to-Arbitrum transfers can be useful for moving activity to an L2. The key checks are the supported token, bridge route, fees, and destination balance.', 'bridge-ethereum-to-polygon': 'Ethereum-to-Polygon transfers require attention to token representation and source gas. A route can be technically valid while still being uneconomical for a very small balance.', 'bridge-base-to-arbitrum': 'Base and Arbitrum are both L2 environments, but that does not make their token contracts interchangeable. Treat the destination token as a network-specific asset.', 'bridge-polygon-to-base': 'Polygon-to-Base is a cross-chain move, even though both ecosystems support many familiar assets. Confirm the exact destination representation before using the received balance.', 'bridge-bsc-to-base': 'BSC and Base use different network environments and contract addresses. The safest workflow is to verify both chains independently before moving funds.', 'bridge-arbitrum-to-base': 'Moving between Arbitrum and Base can be straightforward when a supported route exists, but route availability and costs can change. Check the live quote immediately before execution.', 'bridge-optimism-to-base': 'Optimism-to-Base transfers are another example where similar L2 terminology does not remove the need to verify the destination chain and token contract.', 'bridge-avalanche-to-arbitrum': 'Avalanche and Arbitrum have different network conditions and asset representations. Compare the route, destination token, and total cost before moving small balances.', 'bridge-fee-comparison': 'A proper fee comparison uses the final received amount rather than the headline bridge fee. Gas and price impact can materially change the result.', 'bridge-slippage': 'Slippage is about execution price, while minimum received is the protection shown to the user. Understanding both helps avoid surprises in volatile or low-liquidity routes.', 'safe-cross-chain-transfer': 'A short pre-flight checklist can prevent irreversible mistakes. Network, token, recipient, route, fee and minimum received should all be confirmed before signing.', 'wallet-network-mismatch': 'When a balance appears missing, the asset may simply be on another network. Checking the chain and token contract before assuming a loss is one of the simplest troubleshooting steps.', 'wrong-network-assets': 'Assets do not disappear because a wallet interface is displaying another network. Switching to the correct network and verifying the contract can often explain an apparently empty balance.', 'erc20-dust': "ERC-20 dust accumulates naturally after partial swaps and transfers. Its recovery value depends on the token's liquidity and the gas required to interact with it.", 'bnb-dust': 'BEP-20 balances on BNB Smart Chain can be inexpensive to move, but unsolicited tokens can still carry contract risk. Separate legitimate leftovers from spam before consolidating.', 'layer2-dust': 'L2 dust is easy to accumulate because users frequently experiment with different rollups. Keeping a simple list of balances by chain makes later consolidation much easier.', 'solana-small-balances': 'Solana uses a different account model from EVM chains, so small balances can involve token accounts and rent considerations. Do not apply EVM assumptions directly to Solana.', 'portfolio-cleanup': 'A monthly portfolio review can focus on three things: unknown assets, old permissions, and balances that no longer justify their network costs.', 'wallet-audit': 'A basic wallet audit should be read-only first. Review balances and transaction history, then investigate unfamiliar contracts before taking any action.', 'before-using-a-bridge': "The most important bridge question is not 'does it work?' but 'what exactly will happen if I sign?' Read the route, source and destination assets, fees and recipient before approving.", 'bridge-security': 'Bridge security starts with route transparency and contract awareness. Avoid links from unsolicited messages and use a trusted interface to inspect the transaction you are about to sign.', 'cross-chain-token-support': 'The same ticker can exist as multiple contracts on multiple networks. Network-specific contract verification prevents one of the most common cross-chain mistakes.', 'wallet-address-safety': 'A correct address on the wrong network can still produce a bad outcome. Copy carefully, verify the first and last characters, and confirm the destination network.', 'crypto-recovery-mistakes': 'Recovery errors usually happen when users rush: wrong network, wrong token, wrong recipient, or a suspicious approval. A slower verification step is often cheaper than a correction.', 'small-balance-economics': 'The simplest decision rule is to compare the expected net value after fees with the value of keeping the asset where it is. There is no requirement to consolidate every dust balance.', 'dust-vs-spam-tokens': 'Dust describes size; spam describes intent or origin. A tiny token can be legitimate, while a large unsolicited token can still be suspicious.', 'unknown-token-safety': 'Research an unknown token without interacting with it first. Read-only data, contract verification and transaction history are safer starting points than clicking a claim link.', 'web3-wallet-checkup': 'A ten-minute check can catch forgotten approvals and unexpected assets before they become a bigger problem. Consistency matters more than doing a complicated audit once.', 'crypto-bridge-glossary': 'Bridge terminology can be confusing because providers use different names for similar steps. Learning the core vocabulary makes route comparisons easier.', 'multi-chain-recovery': 'Multi-chain recovery works best as an inventory exercise: list networks, identify balances, estimate costs, then choose which assets are actually worth moving.', 'bridge-aggregators': 'Bridge aggregators compare routes rather than making every route identical. A good comparison still requires checking the provider, route, fees, liquidity, execution details and final amount.'};

export type ChainProfile = {
  role: string;
  architecture: string;
  feeFocus: string;
  assetFocus: string;
  securityFocus: string;
};

const defaultChainProfile: ChainProfile = {
  role: 'Web3 network',
  architecture: 'This network has its own transaction environment, asset representations and wallet conventions. Always verify the active network before interpreting a balance or signing a transaction.',
  feeFocus: 'Compare the network transaction cost with the value being moved, plus any bridge, liquidity or destination costs.',
  assetFocus: 'Verify the exact token contract or token-account representation instead of relying only on ticker symbols or logos.',
  securityFocus: 'Use trusted interfaces, verify the destination and review every transaction request before signing.',
};

export const chainProfiles: Record<string, ChainProfile> = {
  ethereum: {
    role: 'Ethereum mainnet',
    architecture: 'Ethereum is an EVM network and the base layer for a large ecosystem of tokens, applications and Layer 2 networks.',
    feeFocus: 'Ethereum gas can make very small balance movements uneconomical, so compare total execution cost with the balance value.',
    assetFocus: 'Verify the ERC-20 contract address and distinguish Ethereum-native assets from representations on other networks.',
    securityFocus: 'Pay close attention to contract approvals, transaction details and the exact domain used to initiate a transaction.',
  },
  polygon: {
    role: 'Ethereum-compatible network',
    architecture: 'Polygon provides an EVM-compatible environment with its own network balances and token representations.',
    feeFocus: 'Compare Polygon transaction costs with bridge and liquidity costs when consolidating small balances.',
    assetFocus: 'Confirm that the token is held on Polygon and verify its contract before moving or swapping it.',
    securityFocus: 'Check network selection and contract addresses before signing, especially when an asset also exists on Ethereum.',
  },
  bsc: {
    role: 'BNB Smart Chain',
    architecture: 'BNB Smart Chain is an EVM-compatible network with its own BEP-20 token representations.',
    feeFocus: 'Network transaction costs are only one part of the route; compare the complete cost before moving small balances.',
    assetFocus: 'Verify BEP-20 contracts and distinguish legitimate assets from unsolicited tokens.',
    securityFocus: 'Treat unexpected tokens and unfamiliar approvals cautiously and verify contracts before interacting.',
  },
  arbitrum: {
    role: 'Ethereum Layer 2',
    architecture: 'Arbitrum is an Ethereum Layer 2 environment with its own balances and application ecosystem.',
    feeFocus: 'Compare L2 transaction costs with any bridge or liquidity costs required to reach the destination.',
    assetFocus: 'Confirm the Arbitrum token contract rather than assuming an identical ticker represents the same asset everywhere.',
    securityFocus: 'Verify the network, contract and destination before signing cross-chain transactions.',
  },
  base: {
    role: 'Ethereum Layer 2',
    architecture: 'Base is an Ethereum Layer 2 environment with its own network balances, applications and token representations.',
    feeFocus: 'Consider Base transaction costs together with bridge and route costs when moving small balances.',
    assetFocus: 'Verify the token contract on Base and do not rely on ticker or logo alone.',
    securityFocus: 'Use trusted interfaces and verify destination network and token before signing.',
  },
  optimism: {
    role: 'Ethereum Layer 2',
    architecture: 'Optimism is an Ethereum Layer 2 environment with its own transaction and asset context.',
    feeFocus: 'Compare network gas with bridge and route costs, especially for low-value balances.',
    assetFocus: 'Verify the Optimism contract address for the asset you intend to move.',
    securityFocus: 'Check network, recipient, contract and transaction details before signing.',
  },
  avalanche: {
    role: 'EVM-compatible network',
    architecture: 'Avalanche supports an EVM-compatible environment alongside its broader network ecosystem.',
    feeFocus: 'Compare Avalanche transaction costs with route and destination costs before consolidating small balances.',
    assetFocus: 'Verify the asset representation and contract on the selected Avalanche network.',
    securityFocus: 'Confirm the network and contract before interacting with unfamiliar assets.',
  },
  solana: {
    role: 'High-throughput non-EVM network',
    architecture: 'Solana uses a different account and token model from EVM networks, so EVM assumptions should not be applied directly.',
    feeFocus: 'Consider transaction costs and token-account mechanics when evaluating small balances.',
    assetFocus: 'Verify the mint address and relevant token-account details rather than relying on ticker symbols.',
    securityFocus: 'Use trusted wallet interfaces and review transaction effects before approving them.',
  },
  zksync: {
    role: 'Ethereum Layer 2',
    architecture: 'zkSync is an Ethereum scaling ecosystem with its own network context and token representations.',
    feeFocus: 'Compare network fees with bridge and liquidity costs for the complete route.',
    assetFocus: 'Verify the asset contract on zkSync before assuming it matches another network.',
    securityFocus: 'Check the active network, contract and destination before signing.',
  },
  linea: {
    role: 'Ethereum Layer 2',
    architecture: 'Linea is an Ethereum scaling network with its own balances, applications and token representations.',
    feeFocus: 'Evaluate network gas together with any bridge or liquidity costs.',
    assetFocus: 'Verify the token contract on Linea before moving it.',
    securityFocus: 'Use trusted interfaces and verify transaction details before signing.',
  },
  mantle: {
    role: 'Ethereum Layer 2',
    architecture: 'Mantle is an Ethereum-compatible scaling environment with its own network balances and applications.',
    feeFocus: 'Compare the complete route cost rather than looking only at the bridge fee.',
    assetFocus: 'Confirm the token representation on Mantle before interacting with it.',
    securityFocus: 'Verify contracts, network and destination before signing.',
  },
  scroll: {
    role: 'Ethereum Layer 2',
    architecture: 'Scroll is an Ethereum Layer 2 environment with its own transaction and asset context.',
    feeFocus: 'Compare Scroll gas with bridge, liquidity and destination costs.',
    assetFocus: 'Verify the exact token contract on Scroll.',
    securityFocus: 'Confirm network and transaction details before signing.',
  },
  blast: {
    role: 'Ethereum Layer 2',
    architecture: 'Blast is an Ethereum scaling environment with its own balances and application ecosystem.',
    feeFocus: 'Compare network and route costs before moving low-value assets.',
    assetFocus: 'Verify the token contract on Blast.',
    securityFocus: 'Use trusted interfaces and review contract interactions carefully.',
  },
  celestia: {
    role: 'Modular blockchain ecosystem',
    architecture: 'Celestia uses a modular blockchain design, so asset and application context can differ from EVM networks.',
    feeFocus: 'Check the exact network and route mechanics before estimating transfer costs.',
    assetFocus: 'Verify the supported asset representation for the route you are using.',
    securityFocus: 'Do not assume EVM wallet behavior or contract conventions apply directly.',
  },
  sei: {
    role: 'Multi-purpose blockchain',
    architecture: 'Sei has its own network environment and may expose different application and asset conventions depending on the wallet and ecosystem.',
    feeFocus: 'Compare the complete network and route costs before moving small balances.',
    assetFocus: 'Verify the network-specific asset representation.',
    securityFocus: 'Confirm network, destination and transaction details before signing.',
  },
  sui: {
    role: 'Object-based blockchain',
    architecture: 'Sui uses an object-centric model that differs from the account and token conventions of EVM networks.',
    feeFocus: 'Consider network transaction costs and route-specific costs when evaluating small balances.',
    assetFocus: 'Verify the network-specific asset and object details rather than applying EVM assumptions.',
    securityFocus: 'Review transaction effects carefully and use trusted wallet interfaces.',
  },
  aptos: {
    role: 'Move-based blockchain',
    architecture: 'Aptos uses the Move ecosystem and has asset conventions that differ from EVM networks.',
    feeFocus: 'Compare network costs with any route or destination costs before moving small balances.',
    assetFocus: 'Verify the network-specific asset representation and account details.',
    securityFocus: 'Confirm the destination and transaction effects before signing.',
  },
  fantom: {
    role: 'EVM-compatible network',
    architecture: 'Fantom provides an EVM-compatible environment with its own balances and token contracts.',
    feeFocus: 'Compare network costs with route and liquidity costs.',
    assetFocus: 'Verify the token contract on the selected Fantom network.',
    securityFocus: 'Check the network and contract before interacting with unfamiliar assets.',
  },
  cronos: {
    role: 'EVM-compatible network',
    architecture: 'Cronos provides an EVM-compatible environment with its own balances and token representations.',
    feeFocus: 'Compare the complete route cost before consolidating small balances.',
    assetFocus: 'Verify the Cronos token contract rather than relying on ticker alone.',
    securityFocus: 'Confirm network, contract and destination before signing.',
  },
  gnosis: {
    role: 'EVM-compatible network',
    architecture: 'Gnosis provides an EVM-compatible environment with its own network balances and application ecosystem.',
    feeFocus: 'Compare transaction costs with bridge and destination costs.',
    assetFocus: 'Verify the token contract on Gnosis.',
    securityFocus: 'Review approvals and transaction details before signing.',
  },
  metis: {
    role: 'Ethereum Layer 2',
    architecture: 'Metis is an Ethereum scaling environment with its own network and token representations.',
    feeFocus: 'Compare L2 gas with bridge and liquidity costs.',
    assetFocus: 'Verify the token contract on Metis.',
    securityFocus: 'Confirm network and transaction details before signing.',
  },
  manta: {
    role: 'Ethereum scaling ecosystem',
    architecture: 'Manta provides an Ethereum-compatible environment with its own network balances and application context.',
    feeFocus: 'Compare network gas with route and destination costs.',
    assetFocus: 'Verify the token contract and network-specific representation.',
    securityFocus: 'Use trusted interfaces and verify the destination before signing.',
  },
  starknet: {
    role: 'Ethereum scaling ecosystem',
    architecture: 'Starknet uses its own account and smart-contract environment, which differs from standard EVM networks.',
    feeFocus: 'Check the current network cost and route mechanics before moving small balances.',
    assetFocus: 'Verify Starknet-specific asset and account details.',
    securityFocus: 'Do not assume EVM contract and wallet conventions apply directly.',
  },
  zora: {
    role: 'Ethereum Layer 2 ecosystem',
    architecture: 'Zora is an Ethereum scaling ecosystem with its own network balances and application environment.',
    feeFocus: 'Compare network gas with any bridge or liquidity costs.',
    assetFocus: 'Verify the token contract on Zora.',
    securityFocus: 'Confirm the active network and transaction details before signing.',
  },
};

export function getChainProfile(chain: string): ChainProfile {
  return chainProfiles[chain] ?? defaultChainProfile;
}

export type RouteIntelligence = {
  architecture: string;
  source: string;
  destination: string;
  assets: string;
  fees: string;
  security: string;
};

export function getRouteIntelligence(from: string, to: string): RouteIntelligence {
  const fromProfile = getChainProfile(from);
  const toProfile = getChainProfile(to);
  const fromName = chainMap[from] ?? from;
  const toName = chainMap[to] ?? to;

  return {
    architecture: `${fromName} and ${toName} have separate network contexts. A cross-chain route must account for the source environment, destination environment and the mechanism used to transfer or represent the asset.`,
    source: `${fromName}: ${fromProfile.architecture}`,
    destination: `${toName}: ${toProfile.architecture}`,
    assets: `On the source side, ${fromProfile.assetFocus} On the destination side, ${toProfile.assetFocus}`,
    fees: `${fromProfile.feeFocus} On ${toName}, ${toProfile.feeFocus}`,
    security: `${fromProfile.securityFocus} At the destination, ${toProfile.securityFocus}`,
  };
}

