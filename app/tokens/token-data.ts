// Token dust guide data. `scanned` = the token's home network is one of the
// 7 networks Dust Finder reads today (Ethereum, BNB Smart Chain, Polygon,
// Arbitrum, Base, Optimism, Avalanche).
export type TokenInfo = { name: string; chain: string; description: string }

export const TOKEN_DATA: Record<string, TokenInfo> = {
  'shib-dust': {name:'SHIB',chain:'Ethereum',description:'Small SHIB balances can remain after swaps, transfers, or old wallet activity. This guide explains what to verify before treating SHIB dust as useful, uneconomical, or suspicious.'},
  'pepe-dust': {name:'PEPE',chain:'Ethereum',description:'PEPE dust can accumulate after trading or transfers. Check the network, contract, current balance value, and transaction cost before deciding what to do with it.'},
  'arb-dust': {name:'ARB',chain:'Arbitrum',description:'Small ARB balances are often left behind after transactions or portfolio activity on Arbitrum. Learn how to evaluate the balance against gas and route costs.'},
  'matic-dust': {name:'MATIC',chain:'Polygon',description:'Legacy MATIC balances can appear in wallets after activity on Polygon. Verify the network and asset representation before moving a small balance.'},
  'pol-dust': {name:'POL',chain:'Polygon',description:'Small POL balances may remain after Polygon activity. This guide covers the checks that matter before consolidation.'},
  'uni-dust': {name:'UNI',chain:'Ethereum',description:'Tiny UNI balances can be difficult to justify moving when transaction costs are high. Compare the balance value with the complete cost of the route.'},
  'xrp-dust': {name:'XRP',chain:'XRP Ledger',description:'Small XRP balances need network-specific checks because XRP Ledger account rules differ from EVM wallets. Verify the account and asset before acting.'},
  'bonk-dust': {name:'BONK',chain:'Solana',description:'BONK dust can appear after Solana swaps or transfers. Check the token account, authenticity, and practical value before interacting with it.'},
  'doge-dust': {name:'DOGE',chain:'Dogecoin',description:'Small DOGE balances should be evaluated against network fees and the intended destination before attempting consolidation.'},
  'floki-dust': {name:'FLOKI',chain:'Ethereum / BNB Smart Chain',description:'FLOKI exists across networks, so a small balance should be verified by chain and contract before any transaction.'},
  'jup-dust': {name:'JUP',chain:'Solana',description:'Small JUP balances on Solana should be checked against the correct token account and current transaction economics.'},
  'wif-dust': {name:'WIF',chain:'Solana',description:'WIF dust can be leftover from trading activity. Verify the token account and contract before considering a cleanup transaction.'},
  'aave-dust': {name:'AAVE',chain:'Ethereum and supported networks',description:'AAVE can exist on multiple networks. The chain and exact token contract matter when evaluating a small leftover balance.'},
  'link-dust': {name:'LINK',chain:'Ethereum and supported networks',description:'Small LINK balances should be checked by network and contract before deciding whether consolidation makes economic sense.'},
  'avax-dust': {name:'AVAX',chain:'Avalanche',description:'Small AVAX balances can be useful for gas but may also be leftover portfolio dust. Check network, balance value, and intended use.'},
  'op-dust': {name:'OP',chain:'Optimism',description:'Small OP balances on Optimism should be evaluated with network fees and the purpose of the remaining balance in mind.'},
  'cake-dust': {name:'CAKE',chain:'BNB Smart Chain',description:'CAKE dust may remain after PancakeSwap activity. Verify the network and token contract before interacting with the balance.'},
  'crv-dust': {name:'CRV',chain:'Ethereum and supported networks',description:'Small CRV balances can be spread across networks. Confirm the chain and contract before consolidation.'},
  'comp-dust': {name:'COMP',chain:'Ethereum and supported networks',description:'COMP dust should be evaluated by network, contract, balance value, and transaction cost.'},
  'snx-dust': {name:'SNX',chain:'Ethereum and supported networks',description:'Small SNX balances may be leftover from older DeFi activity. Verify the asset before deciding whether to move it.'},
  'sushi-dust': {name:'SUSHI',chain:'Ethereum and supported networks',description:'SUSHI can exist on multiple networks. Small balances should be checked for the correct chain and contract.'},
  'ena-dust': {name:'ENA',chain:'Ethereum and supported networks',description:'Small ENA balances should be evaluated against the correct network, contract, and current transaction economics.'},
  'ondo-dust': {name:'ONDO',chain:'Ethereum and supported networks',description:'ONDO dust should be verified by chain and token contract before any attempt to consolidate it.'},
  'tia-dust': {name:'TIA',chain:'Celestia',description:'Small TIA balances require network-specific checks. Confirm the address, network, balance, and destination before sending.'},
  'sei-dust': {name:'SEI',chain:'Sei',description:'Small SEI balances can remain after transactions. Check the network and transaction economics before moving them.'},
  'sui-dust': {name:'SUI',chain:'Sui',description:'SUI dust is network-specific. Confirm the wallet, network, balance, and intended destination before acting.'},
  'apt-dust': {name:'APT',chain:'Aptos',description:'Small APT balances should be evaluated against network costs and the purpose of keeping the remaining balance.'},
  'inj-dust': {name:'INJ',chain:'Injective',description:'Small INJ balances require network-specific verification before consolidation or transfer.'},
  'near-dust': {name:'NEAR',chain:'NEAR',description:'Small NEAR balances should be checked against account and transaction requirements before being moved.'},
  'cro-dust': {name:'CRO',chain:'Cronos',description:'Small CRO balances can be leftover from Cronos activity. Verify the network and cost before deciding whether to consolidate them.'},
}

export const TOKEN_SLUGS = Object.keys(TOKEN_DATA)

const UNSCANNED = new Set(['XRP Ledger','Solana','Dogecoin','Celestia','Sei','Sui','Aptos','Injective','NEAR','Cronos'])

export function isScanned(token: string): boolean {
  const d = TOKEN_DATA[token]
  return !!d && !UNSCANNED.has(d.chain)
}

export const TOKEN_HOME_CHAIN: Record<string, string> = {
  Ethereum: 'ethereum', Arbitrum: 'arbitrum', Polygon: 'polygon', Optimism: 'optimism',
  Avalanche: 'avalanche', 'BNB Smart Chain': 'bsc',
}
