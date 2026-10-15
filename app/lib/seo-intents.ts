import type { Faq } from './seo'

export type Intent = {
  title: string
  description: string
  h2: string
  body: string[]
  answer: string
  faq: Faq[]
  calc?: boolean
}

export const CLUSTERS: Record<string, string[]> = {
  balances: ['crypto-dust', 'leftover-crypto', 'small-crypto-balance', 'tiny-crypto-balance', 'small-crypto-amounts', 'small-balance-crypto', 'convert-small-crypto-balances', 'crypto-dust-calculator', 'how-to-consolidate-crypto'],
  risk: ['worthless-tokens', 'tokens-i-cant-sell', 'unwanted-tokens', 'unknown-tokens', 'spam-tokens', 'stuck-crypto'],
  cleanup: ['crypto-wallet-scanner', 'crypto-wallet-analyzer', 'find-forgotten-crypto', 'wallet-cleanup', 'wallet-audit-tool', 'crypto-balance-cleanup', 'crypto-portfolio-cleanup', 'multi-chain-wallet-cleanup', 'crypto-wallet-checkup', 'dust-token-scanner'],
}

export const INTENTS: Record<string, Intent> = {
  'crypto-dust': {
    title: 'Crypto Dust: What It Is and What to Do With It',
    description: 'Learn what crypto dust is, why tiny balances accumulate, and how to decide whether a small balance is worth consolidating.',
    h2: 'Why Crypto Dust Accumulates',
    body: [
      'Crypto dust is the small leftover balance that remains after swaps, transfers, rewards, airdrops or old positions. It piles up because trades rarely use an exact amount, because protocols round down, and because many applications send small reward payouts that nobody ever claims or moves.',
      'A tiny balance is not automatically worthless. Its practical value depends on the token, the network, the liquidity available and what it costs to move. The same $3 can be easy to consolidate on a low-fee network and pointless to touch on a congested one.',
    ],
    answer: 'Crypto dust is a token balance so small that selling, swapping or bridging it costs about as much as it is worth. It usually comes from partial swaps, rounding and unclaimed rewards.',
    faq: [
      ['What counts as crypto dust?', 'There is no official threshold. In practice a balance is dust when the full cost of moving it (network fee, route fee and price impact) is close to or higher than its value.'],
      ['Is crypto dust worthless?', 'Not necessarily. Dust on a cheap network can be worth consolidating, while the same amount on an expensive network may be better left alone. Compare the balance with the total cost before deciding.'],
      ['Can crypto dust be dangerous?', 'Dust you created yourself is harmless. Unsolicited tokens that appear on their own can be spam or phishing bait, so verify the contract and never interact with a token just because it showed up.'],
    ],
  },
  'leftover-crypto': {
    title: 'Leftover Crypto: How to Find and Clean Up Small Balances',
    description: 'A practical guide to finding leftover crypto in wallets and deciding what is safe and economical to consolidate.',
    h2: 'Start With a Wallet Inventory',
    body: [
      'Leftover crypto is easy to miss when a wallet has been used across several networks. Most wallet apps only display the network you last selected, so assets on other chains stay out of sight for months or years.',
      'Review every network the address has used, verify unfamiliar assets, and compare each balance with the real cost of moving it. A read-only scan of your public address is enough to build the inventory; no seed phrase is needed.',
    ],
    answer: 'To find leftover crypto, check your public address on every network you have used, not just the one your wallet shows by default. A read-only scanner lists balances without any permission to spend.',
    faq: [
      ['Where does leftover crypto usually hide?', 'On networks you stopped selecting in your wallet: older Layer 2s, side chains, and networks used once for a bridge, a mint or an airdrop.'],
      ['Do I need my seed phrase to find leftover crypto?', 'No. Balances are public on-chain data and can be read from your address alone. Never enter a seed phrase or private key into a scanner.'],
      ['Should I move every leftover balance?', 'No. Move a balance only if the amount you would receive after fees is worth the effort and the token is legitimate.'],
    ],
  },
  'small-crypto-balance': {
    title: 'Small Crypto Balance: Is It Worth Moving?',
    description: 'How to evaluate a small crypto balance against network fees, liquidity, and transaction costs.',
    h2: 'Value Is More Than the Token Price',
    body: [
      'A small crypto balance may have a market price but still be uneconomical to move. The number shown in a portfolio tracker is a quote for a large trade; a tiny position meets minimum sizes, price impact and fixed network fees.',
      'Compare the current value with gas, swap or bridge costs and the amount you expect to receive after the transaction. If the result is close to zero or negative, leaving the balance where it is can be the rational choice.',
    ],
    answer: 'A small crypto balance is worth moving only when its value minus gas, route fees and price impact is clearly positive. Use the calculator below to check the numbers before you sign anything.',
    calc: true,
    faq: [
      ['How small is too small to move?', 'It depends on the network. On a low-fee Layer 2 a few dollars can still make sense, while on Ethereum mainnet gas can exceed the balance. Always compare against the live quote.'],
      ['Why is the amount I receive lower than the portfolio value?', 'Portfolio value uses a market price. The real result also subtracts network fees, route fees and price impact, which weigh more heavily on small amounts.'],
      ['Is it bad to just leave a small balance in the wallet?', 'No. A small idle balance carries no cost on most networks. The risk comes from signing unnecessary transactions, not from holding it.'],
    ],
  },
  'tiny-crypto-balance': {
    title: 'Tiny Crypto Balance: What Can You Do With It?',
    description: 'Understand tiny crypto balances, dust, fees, and practical wallet cleanup.',
    h2: 'Do Not Move It Blindly',
    body: [
      'Tiny balances deserve a cost and security check before any transaction. Confirm the network and the token contract first, then work out whether a route actually makes economic sense.',
      'Your realistic options are to leave it, swap it into something you hold anyway, bridge it together with other balances, or ignore it if the token is suspicious. Batching several balances onto one route is often cheaper than moving each one separately.',
    ],
    answer: 'With a tiny crypto balance you can leave it, swap it, bridge it, or ignore it. Pick based on the total cost of the move and whether the token contract is genuine.',
    faq: [
      ['What is the cheapest way to move a tiny balance?', 'Usually a same-network swap on a low-fee chain, or batching it with other balances. Compare live quotes because costs change with network conditions.'],
      ['Can a tiny balance get stuck?', 'Yes. Missing native gas, a restricted token or very low liquidity can all prevent a swap. Diagnose the reason before retrying a failed transaction.'],
      ['Is it safe to scan my wallet for tiny balances?', 'A scan that only reads your public address is safe. Avoid any tool that asks for a seed phrase, private key or an unlimited approval just to look.'],
    ],
  },
  'worthless-tokens': {
    title: 'Worthless Tokens: How to Check Before You Ignore or Remove Them',
    description: 'How to distinguish genuinely low-value tokens from suspicious or unsolicited wallet assets.',
    h2: 'Worthless Does Not Mean Dangerous',
    body: [
      'Some tokens simply have little or no liquidity, while others are unsolicited spam designed to attract a click. Both can show a large number in your wallet, but they call for very different responses.',
      'Do not interact with an unfamiliar token merely because it appears valuable in a wallet interface. Hiding it in your wallet app costs nothing and carries no risk; selling it or approving a contract might.',
    ],
    answer: 'A worthless token is one with no real liquidity or demand. It is not automatically dangerous, but an unsolicited token that asks you to visit a site or sign something should be treated as hostile.',
    faq: [
      ['Can I delete a worthless token from my wallet?', 'Tokens cannot be deleted from the blockchain. You can hide them in most wallet apps, which is the safest way to clean up the view.'],
      ['Why does a worthless token show a high value?', 'Prices for illiquid tokens can be manipulated or based on a tiny pool. A displayed value does not mean you can actually sell it.'],
      ['Should I try to sell a token I do not recognise?', 'Not before researching the contract. A failed sell can signal a honeypot, and signing approvals for it can expose other assets.'],
    ],
  },
  'stuck-crypto': {
    title: 'Stuck Crypto: Why a Small Balance May Not Move',
    description: 'Common reasons small crypto balances get stuck and what to check before trying another transaction.',
    h2: 'Check Network, Liquidity and Fees',
    body: [
      'A balance can look stuck for ordinary reasons: the wallet is on the wrong network, there is not enough native token to pay gas, the token has transfer restrictions, or liquidity is too thin for a swap to succeed.',
      'Diagnose the reason before signing another transaction. Repeating a failed action usually just burns more gas.',
    ],
    answer: 'Stuck crypto is usually caused by the wrong network, no native gas, a restricted token or low liquidity. Identify which one applies before you try again.',
    faq: [
      ['Why does my swap keep failing?', 'Common causes are slippage set too low, insufficient liquidity, a token with transfer restrictions, or not enough native token to pay the fee.'],
      ['I have a token but no gas. What now?', 'You need a small amount of the network native token to send any transaction. Bridge or transfer a little native token to that network first.'],
      ['Is my crypto lost if it does not appear?', 'Usually not. It is often on a different network than the one your wallet is displaying. Check the address on each network you have used.'],
    ],
  },
  'tokens-i-cant-sell': {
    title: 'Tokens I Can’t Sell: What Should I Check?',
    description: 'A safety-first guide to tokens that cannot be sold or swapped.',
    h2: 'A Failed Sell Is a Warning to Investigate',
    body: [
      'If a token cannot be sold, check its exact contract, its liquidity, any trading restrictions and the network it lives on. A token you can buy but not sell is the classic honeypot pattern.',
      'Avoid repeatedly signing transactions or paying fees without understanding why the swap fails. Each attempt costs gas and some scam tokens bait you into approvals that matter later.',
    ],
    answer: 'If you cannot sell a token, it may be a honeypot, have no liquidity, or carry a transfer restriction. Stop retrying and verify the contract first.',
    faq: [
      ['What is a honeypot token?', 'A token whose contract lets people buy but blocks or heavily taxes selling. Contract risk scanners can flag common honeypot patterns, though no automated check is a guarantee.'],
      ['Why does the swap say price impact is huge?', 'The pool has very little liquidity, so even a small sale moves the price drastically. The quoted value is not what you would get.'],
      ['Should I keep the approval I gave the token?', 'If you approved a contract for a token you cannot sell, review and revoke that approval with an approval-checking tool.'],
    ],
  },
  'unwanted-tokens': {
    title: 'How to Deal With Unwanted Tokens in a Crypto Wallet',
    description: 'Learn how to identify unwanted tokens and avoid interacting with suspicious wallet assets.',
    h2: 'Do Not Interact Just to Make Them Disappear',
    body: [
      'Unwanted tokens can be legitimate leftovers or unsolicited spam. The safest first step is observation and verification, not a transaction prompted by the token itself.',
      'Many wallets let you hide a token with one click. That clears the clutter with no on-chain action, no fee and no signature, which is exactly what you want for assets you do not trust.',
    ],
    answer: 'Hide unwanted tokens in your wallet app instead of interacting with them. Hiding is free and involves no signature, so it cannot be exploited.',
    faq: [
      ['Why did a random token appear in my wallet?', 'Spammers send tokens to many addresses at once, hoping you will visit a link in the token name or try to sell it.'],
      ['Can I send unwanted tokens to a burn address?', 'It costs gas and gains nothing. Hiding the token in your wallet is cheaper and safer.'],
      ['Is an unwanted token a sign I was hacked?', 'Usually not. Receiving unsolicited tokens is common and does not mean your keys are exposed, but never sign anything the token asks for.'],
    ],
  },
  'how-to-consolidate-crypto': {
    title: 'How to Consolidate Crypto Across Wallets and Networks',
    description: 'A practical workflow for consolidating small crypto balances while controlling fees and security risks.',
    h2: 'Inventory Before You Consolidate',
    body: [
      'Group balances by network, verify token contracts, estimate transaction costs and decide which assets are actually worth moving. Consolidation should reduce complexity, not create unnecessary transactions.',
      'Pick the destination network first. A clear target lets you compare routes, batch similar balances and avoid chains of small, disconnected transfers that each pay their own fees.',
    ],
    answer: 'To consolidate crypto, pick one destination network, list balances on each source network, compare live route quotes, and move only the balances that stay worthwhile after fees.',
    faq: [
      ['Should I consolidate into one token or one network?', 'Choose the network where you will actually use the funds, then the asset you want to hold there. The two decisions are separate.'],
      ['Is it cheaper to bridge or to swap first?', 'It depends on the route. Route aggregators compare both, but always check the final received amount rather than the headline fee.'],
      ['How often should I consolidate?', 'Rarely. A periodic review is enough. Moving small amounts often makes fees the biggest cost.'],
    ],
  },
  'crypto-dust-calculator': {
    title: 'Crypto Dust Calculator: Is a Small Balance Worth Moving?',
    description: 'Estimate whether a small crypto balance is economically worth consolidating after network and route costs.',
    h2: 'Compare Balance Value With Total Cost',
    body: [
      'The useful calculation is not just token price multiplied by quantity. Include network gas, swap or bridge fees, price impact and the amount you expect to receive before deciding to move a small balance.',
      'Use the calculator below with the numbers from a live quote. It shows your net result and whether the move is worth doing.',
    ],
    answer: 'Net result = balance value − network fee − route fee − price impact. If it is not clearly positive, leave the balance alone. The calculator below does the math for you.',
    calc: true,
    faq: [
      ['Where do I get the fee numbers?', 'From the live quote in your wallet or swap interface. Fees change with network congestion, so check immediately before signing.'],
      ['What is price impact?', 'The change in price caused by your own trade. It matters for illiquid tokens and is usually negligible for large, liquid assets.'],
      ['Does the calculator move any funds?', 'No. It runs entirely in your browser and never connects to your wallet.'],
    ],
  },
  'crypto-wallet-scanner': {
    title: 'Crypto Wallet Scanner for Small Balances and Dust',
    description: 'Scan a crypto wallet to identify small balances, unfamiliar assets and cleanup opportunities.',
    h2: 'Visibility Comes First',
    body: [
      'A wallet scanner should let you inventory addresses and balances without asking for a seed phrase or private key. Reading public data is enough to show you what you hold and where.',
      'Use the results to decide what deserves verification before taking any action. Discovery and execution are separate steps, and you should be able to stop after the first.',
    ],
    answer: 'A safe wallet scanner reads your public address only. It never asks for a seed phrase, private key or permission to spend your tokens.',
    faq: [
      ['Which networks does Dust Sweeper scan?', 'Dust Finder currently reads balances on seven networks: Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism and Avalanche.'],
      ['Is scanning my wallet safe?', 'Yes, when the scan is read-only. You only paste or connect a public address, and every later transaction is one you review and sign yourself.'],
      ['Does the scanner move my funds?', 'No. Scanning only shows balances. Any swap or bridge is a separate transaction you approve in your own wallet.'],
    ],
  },
  'crypto-wallet-analyzer': {
    title: 'Crypto Wallet Analyzer: Review Balances and Wallet Activity',
    description: 'Analyze wallet holdings and identify forgotten, small, or unfamiliar crypto balances.',
    h2: 'Analyze Before You Transact',
    body: [
      'A useful wallet analysis separates discovery from execution. First understand the networks, balances and contracts involved; only then consider swaps, bridges or consolidation.',
      'Look for three things: assets you did not know you had, tokens you do not recognise, and balances that no longer justify their network costs.',
    ],
    answer: 'A wallet analyzer should tell you which networks hold balances, which tokens are unfamiliar, and which amounts are too small to be worth moving.',
    faq: [
      ['What should a wallet analysis include?', 'Balances per network, token contracts, recent activity and any approvals. Start read-only and act later.'],
      ['Can I analyze a wallet that is not mine?', 'On-chain data is public, so yes. Remember that doing so reveals nothing private, and nobody can move funds from a public address.'],
      ['How is this different from a block explorer?', 'Explorers show one network at a time. A multi-chain analyzer aggregates balances across the networks it supports.'],
    ],
  },
  'find-forgotten-crypto': {
    title: 'How to Find Forgotten Crypto in an Old Wallet',
    description: 'A checklist for finding forgotten crypto balances across networks and old wallet activity.',
    h2: 'Search Every Network You Used',
    body: [
      'Forgotten balances often sit on networks that are no longer selected in your wallet interface. Review historical activity and check each relevant network before assuming an asset is gone.',
      'Start with the addresses you remember using, then widen to old browser wallets, exchange withdrawal addresses and wallets created for a single mint or airdrop.',
    ],
    answer: 'To find forgotten crypto, list every wallet address you have used, then check each address on every network. Old Layer 2s and one-off airdrop wallets are the usual hiding places.',
    faq: [
      ['What if I lost the seed phrase for an old wallet?', 'Balances can still be viewed from the public address, but moving them requires the keys. A scanner cannot recover access.'],
      ['Where can I find old addresses?', 'Exchange withdrawal history, old browser extensions, email receipts from NFT mints and previous wallet backups.'],
      ['Could forgotten tokens be worth a lot?', 'Sometimes, but many are tiny or illiquid. Verify liquidity before assuming a displayed price is realistic.'],
    ],
  },
  'wallet-cleanup': {
    title: 'Crypto Wallet Cleanup: A Practical Checklist',
    description: 'Clean up a Web3 wallet by reviewing small balances, approvals, unfamiliar tokens and old activity.',
    h2: 'Separate Discovery From Action',
    body: [
      'A good wallet cleanup starts with a read-only inventory. Verify assets, review permissions and estimate costs before making any transaction.',
      'Then work in a fixed order: hide spam, review approvals, consolidate only the balances that pay for themselves, and record what you did so the next review is faster.',
    ],
    answer: 'Wallet cleanup in four steps: inventory every network, hide spam tokens, revoke approvals you no longer use, and consolidate only balances that stay worthwhile after fees.',
    faq: [
      ['How often should I clean up my wallet?', 'A quick review every month or two is enough for most users. After using a new app or airdrop, check approvals sooner.'],
      ['What is the single most important cleanup step?', 'Revoking old unlimited token approvals, because they are what a compromised app can use to move your funds.'],
      ['Does cleanup cost money?', 'Hiding tokens is free. Revoking approvals and consolidating balances cost network fees.'],
    ],
  },
  'wallet-audit-tool': {
    title: 'Crypto Wallet Audit Tool: What to Check',
    description: 'A practical framework for auditing a Web3 wallet for balances, permissions and unfamiliar assets.',
    h2: 'The Four-Part Wallet Audit',
    body: [
      'Review balances, networks, token contracts and approvals. The goal is to understand the wallet before changing anything, especially when old or unfamiliar assets are involved.',
      'Keep the audit read-only until you have a list of actions. Then decide each action on its merits instead of reacting to a scary-looking number.',
    ],
    answer: 'A basic wallet audit checks four things: what you hold on each network, which token contracts are genuine, which approvals are still active, and which transactions you do not recognise.',
    faq: [
      ['Is a wallet audit the same as a smart-contract audit?', 'No. A wallet audit reviews your own holdings and permissions. A smart-contract audit reviews a protocol’s code.'],
      ['What tools do I need?', 'A multi-chain balance scanner, a block explorer for transaction history, and an approval checker for permissions.'],
      ['Can an audit tell me if I was hacked?', 'It can reveal unauthorised approvals and unfamiliar transactions, which are the usual evidence. It cannot recover stolen funds.'],
    ],
  },
  'small-crypto-amounts': {
    title: 'How to Handle Small Crypto Amounts',
    description: 'Learn how to evaluate and consolidate small crypto amounts without wasting money on fees.',
    h2: 'Small Amounts Need Fee Awareness',
    body: [
      'When the balance is small, fees become a larger percentage of the transaction. A fixed network fee that is negligible on $1,000 can consume most of $10.',
      'Compare the complete cost with the amount you would actually receive, and prefer low-fee networks or batched routes for anything small.',
    ],
    answer: 'With small crypto amounts, fixed fees dominate. Prefer low-fee networks, batch several balances together, and skip any move where fees eat most of the value.',
    faq: [
      ['Why do fees hurt small amounts more?', 'Network fees are mostly fixed per transaction, so they take a bigger percentage of a small balance.'],
      ['Which networks are cheapest for small moves?', 'Layer 2 networks and several side chains are usually cheaper than Ethereum mainnet, but costs vary daily. Check a live quote.'],
      ['Can I combine small amounts into one transaction?', 'Some routes and tools batch several tokens in a flow, which spreads fixed costs. Availability depends on the network and tokens.'],
    ],
  },
  'convert-small-crypto-balances': {
    title: 'How to Convert Small Crypto Balances',
    description: 'Learn what to check when converting tiny crypto balances into a more useful asset.',
    h2: 'Check Liquidity and Minimums',
    body: [
      'Small balances may run into minimum trade sizes, liquidity constraints, price impact or network fees. Confirm each of these before attempting a conversion.',
      'Decide the target asset first, such as a stablecoin or the native token of the network, then compare routes by the amount you would actually receive.',
    ],
    answer: 'To convert a small balance, choose a target asset, request a live quote, and compare the final received amount, not the headline fee. Skip the swap if the quote is close to zero.',
    faq: [
      ['What should I convert dust into?', 'Most people choose a stablecoin or the network native token, which also covers future gas.'],
      ['Why does the exchange refuse my small amount?', 'Centralised exchanges set minimum order and withdrawal sizes. On-chain swaps do not, but fees still apply.'],
      ['Is a stablecoin always the safest target?', 'It reduces price volatility but carries issuer and contract risk. Pick one you already trust.'],
    ],
  },
  'crypto-balance-cleanup': {
    title: 'Crypto Balance Cleanup: Remove Wallet Clutter Safely',
    description: 'A guide to cleaning up small and forgotten crypto balances without taking unnecessary risks.',
    h2: 'Not Everything Needs a Transaction',
    body: [
      'A clean wallet does not mean every token must be moved. Some assets are better left untouched when the route is uneconomical or the token is suspicious.',
      'Use your wallet’s hide feature for clutter, reserve transactions for balances that clearly pay off, and keep a short note of what you decided.',
    ],
    answer: 'Clean up balances by hiding clutter, verifying anything unfamiliar, and moving only balances whose net value after fees is clearly positive.',
    faq: [
      ['What is the safest way to declutter?', 'Hide tokens in the wallet interface. It needs no signature and no fee.'],
      ['Should I burn tokens I do not want?', 'Rarely worthwhile. It costs gas and has no benefit over hiding them.'],
      ['How do I avoid losing track of balances?', 'Keep a simple list by network, and re-scan occasionally instead of relying on memory.'],
    ],
  },
  'unknown-tokens': {
    title: 'Unknown Tokens in Your Wallet: What Should You Do?',
    description: 'A cautious workflow for researching unfamiliar tokens before interacting with them.',
    h2: 'Treat Unfamiliar Tokens as Unverified',
    body: [
      'Do not trust a ticker, a logo, a website link or an unsolicited message. Verify the contract and on-chain context using independent sources before signing anything.',
      'Research without interacting: read the contract page on a block explorer, check holder distribution and liquidity, and see whether the token is listed by established data providers.',
    ],
    answer: 'Treat any unknown token as unverified. Research the contract on a block explorer and never sign a transaction that the token or its website prompts you to make.',
    faq: [
      ['How do I check a token contract?', 'Open the contract address on the network’s block explorer and review holders, transfers, verified source code and liquidity pools.'],
      ['Can an unknown token drain my wallet?', 'Receiving a token cannot drain a wallet. Danger comes from signing an approval or visiting a malicious site the token points to.'],
      ['Does Dust Sweeper check token risk?', 'Yes. The scam contract scanner shows automated risk signals for supported networks. They are heuristics, not a guarantee.'],
    ],
  },
  'spam-tokens': {
    title: 'Spam Tokens: How to Spot and Avoid Them',
    description: 'Learn how unsolicited crypto tokens can be used to lure wallet users into risky interactions.',
    h2: 'Ignore the Call to Action',
    body: [
      'Spam tokens often create urgency with a token name, a website or a transaction prompt: claim a reward, visit a link, swap now. The safest response is to avoid interacting with the asset until it has been independently verified.',
      'Typical signs are a name that contains a URL, a token you never bought, a sudden airdrop of an unfamiliar asset, and a claim page that asks for a broad approval.',
    ],
    answer: 'Spam tokens are unsolicited assets that try to bait you into a malicious site or approval. Spot them by URLs in the name, no purchase history and urgent claim messages.',
    faq: [
      ['Why am I receiving spam tokens?', 'Attackers send them in bulk to public addresses. Your wallet is not necessarily compromised.'],
      ['What is address poisoning?', 'An attacker sends a tiny transaction from an address that looks like one you use, hoping you copy it later by mistake. Always verify the full address before sending.'],
      ['Should I report spam tokens?', 'You can hide them in your wallet and flag them on the block explorer. Do not interact with them.'],
    ],
  },
  'crypto-portfolio-cleanup': {
    title: 'Crypto Portfolio Cleanup Checklist',
    description: 'A repeatable process for reviewing old assets, small balances and unused wallet activity.',
    h2: 'Make Cleanup a Routine',
    body: [
      'Review your wallet periodically, group assets by network, verify unfamiliar tokens and compare small balances with current transaction costs.',
      'Treat it as a routine rather than a project. A short, repeatable checklist catches forgotten approvals and unexpected assets before they become a bigger problem.',
    ],
    answer: 'A portfolio cleanup routine: list assets by network, check unknown tokens, review approvals, then decide which small balances justify a transaction.',
    faq: [
      ['What belongs on a cleanup checklist?', 'Balances per network, unknown tokens, active approvals, recent transactions and pending decisions about small balances.'],
      ['Is a monthly review too frequent?', 'For active wallets it is reasonable. For quiet wallets, every few months is fine.'],
      ['Should I track this in a spreadsheet?', 'A simple list by network is enough and helps you notice changes at the next review.'],
    ],
  },
  'multi-chain-wallet-cleanup': {
    title: 'Multi-Chain Wallet Cleanup Guide',
    description: 'How to organize and review small balances across Ethereum, L2s and other networks.',
    h2: 'Think Network by Network',
    body: [
      'Multi-chain wallets accumulate clutter because the same address can hold assets across many networks. Inventory each network separately before deciding what to consolidate.',
      'The same ticker can be a different contract on each network, so verify the asset on the chain where you hold it instead of assuming equivalence.',
    ],
    answer: 'For multi-chain cleanup, treat each network as its own wallet view: inventory it, verify tokens, check approvals, then decide what to consolidate.',
    faq: [
      ['Why do I have different balances on each chain?', 'One address works on many networks, but each network keeps its own ledger of balances and approvals.'],
      ['Do approvals carry over between networks?', 'No. Approvals are per network and per token, so review each network separately.'],
      ['Which networks does Dust Sweeper scan?', 'Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism and Avalanche.'],
    ],
  },
  'crypto-wallet-checkup': {
    title: 'Crypto Wallet Checkup: A 10-Minute Routine',
    description: 'A simple recurring routine for checking balances, permissions and unfamiliar wallet activity.',
    h2: 'A Quick Monthly Review',
    body: [
      'Check balances, recent activity, token approvals and unfamiliar assets. Use read-only tools where possible and never disclose private keys or seed phrases.',
      'Ten minutes is enough if you work in a fixed order: balances, then unfamiliar tokens, then approvals, then a glance at recent transactions.',
    ],
    answer: 'A 10-minute wallet checkup: scan balances on every network, flag unknown tokens, review approvals, and scan recent transactions for anything you do not recognise.',
    faq: [
      ['What is the fastest way to start?', 'Run a read-only multi-chain scan of your public address and note anything unexpected.'],
      ['What should worry me during a checkup?', 'Approvals you do not recognise, transactions you did not make and tokens that prompt you to sign.'],
      ['Do I need to connect my wallet?', 'Not for a scan. Connect only when you decide to execute a transaction.'],
    ],
  },
  'dust-token-scanner': {
    title: 'Dust Token Scanner: Find Small Token Balances',
    description: 'Find small token balances and identify which ones deserve further investigation.',
    h2: 'Scan First, Sign Later',
    body: [
      'A dust scanner is useful for discovering balances that are easy to overlook. Discovery should not require permission to spend funds and should be followed by contract and cost verification.',
      'Sort results by value and by network, ignore anything you cannot verify, and treat the list as a to-do for research, not a button to press.',
    ],
    answer: 'A dust token scanner lists small balances across networks using only your public address. Use it to find candidates, then verify contracts and costs before acting.',
    faq: [
      ['What does the scanner show me?', 'Token balances and metadata per supported network, so you can see what is small, what is unfamiliar and what is worth a closer look.'],
      ['Can it find tokens on every chain?', 'No scanner covers every chain. Dust Finder reads seven networks today and the list is shown in the tool.'],
      ['What should I do after the scan?', 'Verify unfamiliar tokens, compare each balance with route costs, and only then consider a swap or bridge.'],
    ],
  },
  'small-balance-crypto': {
    title: 'Small-Balance Crypto: When Should You Consolidate It?',
    description: 'Understand the economics and security checks behind consolidating small crypto balances.',
    h2: 'The Right Question Is Economic',
    body: [
      'The best cleanup decision depends on balance value, fees, liquidity and risk. Sometimes consolidating is useful; sometimes doing nothing is the rational choice.',
      'A simple rule: move a balance only if the net amount after every cost is clearly worth the effort and the token passes basic verification.',
    ],
    answer: 'Consolidate small-balance crypto only when the net amount after fees and price impact is clearly positive and the token is verified. Otherwise doing nothing is fine.',
    calc: true,
    faq: [
      ['Is there a minimum worth consolidating?', 'No universal number. It depends on network fees at the moment and the route available.'],
      ['Do dust balances expire?', 'No. They stay in the wallet indefinitely, so there is no deadline to move them.'],
      ['What if fees fall later?', 'You can revisit the balance when fees drop. Waiting costs nothing.'],
    ],
  },
}
