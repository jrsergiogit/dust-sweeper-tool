import Link from 'next/link'
import type { Metadata } from 'next'

const TOKEN_DATA: Record<string, {name:string; chain:string; description:string}> = {
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

export const dynamicParams = false
export function generateStaticParams() { return Object.keys(TOKEN_DATA).map(token => ({token})) }

export async function generateMetadata({params}:{params:Promise<{token:string}>}):Promise<Metadata>{
  const {token}=await params; const data=TOKEN_DATA[token]; if(!data)return {}
  const title=`${data.name} Dust: What to Do With Small ${data.name} Balances | Dust Sweeper`
  return {title,description:data.description,keywords:[`${data.name} dust`,`${data.name} small balance`,'crypto dust','small crypto balance','wallet cleanup'],alternates:{canonical:`https://app.dustsweepertool.com/tokens/${token}`},openGraph:{title,description:data.description,url:`https://app.dustsweepertool.com/tokens/${token}`,type:'article'}}
}

export default async function TokenPage({params}:{params:Promise<{token:string}>}){
  const {token}=await params; const data=TOKEN_DATA[token]; if(!data)return null
  return <main className="bg-[#0B0C10] text-white min-h-screen py-20 px-6"><article className="max-w-3xl mx-auto border border-white/5 bg-[#030303] p-8 md:p-16 rounded-3xl shadow-2xl">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'Article','headline':`${data.name} Dust: Small ${data.name} Balances`,'description':data.description,'author':{'@type':'Organization','name':'Dust Sweeper Team'},'mainEntityOfPage':{'@type':'WebPage','@id':`https://app.dustsweepertool.com/tokens/${token}`}})}} />
    <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">Token Guide • {data.chain}</div><h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{data.name} Dust</h1><p className="text-xl text-gray-400 italic font-light">{data.description}</p>
    <section className="space-y-8 text-gray-300 leading-relaxed text-lg mt-12"><h2 className="text-2xl font-bold text-white uppercase tracking-wider">What Is {data.name} Dust?</h2><p>A small {data.name} balance is not automatically worthless or dangerous. It may be the remainder of a swap, transfer, reward, or older position. The first question is where the asset lives and whether the token contract is the one you intended to hold.</p><h2 className="text-2xl font-bold text-white uppercase tracking-wider">Before Moving a Small Balance</h2><ul className="list-disc pl-6 space-y-4 text-gray-400"><li>Confirm the wallet address and <strong>{data.chain}</strong> network.</li><li>Verify the exact token contract instead of relying only on the ticker or logo.</li><li>Compare the balance value with gas, bridge, swap, and other route costs.</li><li>Check whether the asset is liquid and actually transferable.</li><li>Never enter a seed phrase or private key into a scanner or cleanup tool.</li></ul><div className="bg-white/5 border-l-4 border-pink-500 p-6 italic">The goal is not to move every tiny balance. It is to determine which balances are safe and economical to consolidate.</div><h2 className="text-2xl font-bold text-white uppercase tracking-wider">Scan Your Wallet</h2><p>Dust Sweeper can help you inventory wallet activity and identify small balances that deserve a closer look. Review the asset and route before signing any transaction.</p><Link href="/" className="inline-block px-10 py-4 text-sm font-black rounded-xl" style={{background:'linear-gradient(90deg, #E91E63 0%, #9C27B0 100%)'}}>SCAN YOUR WALLET</Link><p><Link href="/tokens" className="text-pink-400 hover:text-pink-300">← Explore more token dust guides</Link></p></section>
  </article></main>
}
