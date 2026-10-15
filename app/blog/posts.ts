import type { Faq } from '../lib/seo'

export type Section = { h2: string; paras?: string[]; bullets?: string[] }
export type Post = {
  slug: string
  title: string
  h1: string
  description: string
  category: string
  published: string
  readMins: number
  intro: string
  sections: Section[]
  faq: Faq[]
  related: string[] // other post slugs
  links: [string, string][] // [href, label] to guides/tools
}

export const POSTS: Post[] = [
  {
    slug: 'what-is-crypto-dust',
    title: 'What Is Crypto Dust? Meaning, Causes and What to Do With It',
    h1: 'What Is Crypto Dust?',
    description: 'Crypto dust is a balance too small to trade or move profitably. Learn where it comes from, whether it is dangerous and how to deal with it.',
    category: 'Basics',
    published: '2026-10-14',
    readMins: 5,
    intro: 'Crypto dust is a token balance so small that the cost of selling, swapping or bridging it is close to, or higher than, its value. Almost every active wallet has some.',
    sections: [
      { h2: 'Where crypto dust comes from', paras: ['Dust is a by-product of normal use, not a sign that something went wrong. It builds up in a few predictable ways.'], bullets: [
        'Partial swaps and rounding: a trade rarely consumes an exact amount, so a fraction of the input or output token stays behind.',
        'Reward payouts: staking, liquidity and quest programs often pay tiny amounts that are never claimed or moved.',
        'Airdrops: projects distribute small allocations to many addresses, including wallets that interacted only once.',
        'Gas leftovers: a little native token stays on a network after you bridge away the rest.',
        'Unsolicited tokens: spammers send worthless assets to public addresses in bulk.',
      ] },
      { h2: 'Is crypto dust worth anything?', paras: ['It can be. Whether dust is worth moving depends on the token, its liquidity and the network where it sits. Fixed network fees weigh far more on a $5 balance than on a $5,000 one, so the same dust can be worth collecting on a low-fee network and pointless to touch on an expensive one.', 'A useful test is the net amount: balance value minus gas, route fees and price impact. If that number is not clearly positive, doing nothing is a perfectly rational choice.'] },
      { h2: 'Is crypto dust dangerous?', paras: ['Dust you created yourself is harmless. Dust that arrived on its own deserves caution. Spam tokens sometimes carry a link in their name or a fake claim page, and a few are used in address-poisoning attempts. Receiving a token cannot drain your wallet; signing an approval or connecting to a malicious site can.', 'Hide unfamiliar tokens in your wallet app instead of interacting with them.'] },
      { h2: 'What to do with crypto dust', bullets: [
        'Inventory your balances on every network you have used, using a read-only scan of your public address.',
        'Verify the contract of anything you do not recognise before deciding what to do.',
        'Estimate the total cost of moving each balance using a live quote.',
        'Consolidate only balances that stay clearly positive after costs, ideally batched onto one destination network.',
        'Hide or ignore everything else.',
      ] },
    ],
    faq: [
      ['What does dust mean in crypto?', 'Dust is a very small amount of a token that is not economical to trade or move once fees are included.'],
      ['Can I get rid of crypto dust?', 'You can swap or bridge it if the economics work, or simply hide it in your wallet. Tokens cannot be deleted from the blockchain.'],
      ['Does Dust Sweeper take my funds?', 'No. It is non-custodial: it reads public balances, and every swap or bridge is a transaction you review and sign yourself.'],
    ],
    related: ['is-it-worth-moving-small-crypto-balances', 'how-to-spot-spam-airdrop-tokens'],
    links: [['/crypto-dust', 'Crypto dust guide'], ['/crypto-dust-calculator', 'Dust cost calculator'], ['/learn/what-is-crypto-dust', 'Learn: what is crypto dust']],
  },
  {
    slug: 'is-it-worth-moving-small-crypto-balances',
    title: 'Is It Worth Moving Small Crypto Balances? The Fee Math Explained',
    h1: 'Is It Worth Moving Small Crypto Balances?',
    description: 'A simple formula and a worked example to decide whether a small crypto balance is worth swapping or bridging after gas, route fees and price impact.',
    category: 'Economics',
    published: '2026-10-14',
    readMins: 5,
    intro: 'Before you swap or bridge a small balance, work out what you would actually receive. Network fees are mostly fixed, so small amounts are hit hardest.',
    sections: [
      { h2: 'The formula', paras: ['Net amount = balance value − network fee − route or service fee − price impact. If the net amount is not clearly positive, the move loses money or breaks even at best.'] },
      { h2: 'A worked example (illustrative numbers)', paras: ['Suppose you hold a token worth $12. A live quote shows $0.40 in network gas, a 1% route fee ($0.12) and 0.5% price impact ($0.06). Net: 12 − 0.40 − 0.12 − 0.06 = $11.42, so about 95% of the value survives.', 'Now take the same token worth $3 on a congested network where gas is $4. Net: 3 − 4 − 0.03 − 0.015 is negative. You would pay more than the balance is worth, so you leave it.'] },
      { h2: 'Why small balances behave differently', bullets: [
        'Gas is mostly fixed per transaction, so it takes a larger share of small amounts.',
        'Illiquid tokens have wide price impact even for tiny trades.',
        'The price in a portfolio tracker is a market quote for large trades, not what a tiny position can realise.',
        'Cross-chain routes add a destination step and sometimes a minimum amount.',
      ] },
      { h2: 'How to improve the economics', bullets: [
        'Prefer low-fee networks for small moves, and re-check the quote because gas changes during the day.',
        'Batch several balances into one route so fixed costs are spread out.',
        'Choose the destination network first, then compare routes by the final received amount.',
        'Wait when fees are high. A dust balance does not expire.',
      ] },
      { h2: 'When to simply leave it', paras: ['Holding a small balance costs nothing on most networks. Unnecessary transactions are what add risk, so treat “do nothing” as a valid result, especially for tokens you cannot verify.'] },
    ],
    faq: [
      ['How small is too small to move?', 'There is no fixed number. It depends on the network fee and route at that moment. Always compare a live quote with the balance value.'],
      ['Are there tools that do this math for me?', 'Yes. The dust cost calculator on Dust Sweeper takes your balance, gas and fee percentages and shows the net result in your browser.'],
      ['Should I move dust before fees rise or after they fall?', 'Waiting for lower fees is usually cheaper, since dust has no deadline.'],
    ],
    related: ['what-is-crypto-dust', 'stop-wasting-gas'],
    links: [['/crypto-dust-calculator', 'Dust cost calculator'], ['/small-crypto-balance', 'Small crypto balance guide'], ['/learn/small-balance-economics', 'Learn: small balance economics']],
  },
  {
    slug: 'stop-wasting-gas',
    title: 'How to Stop Wasting Gas on Small Crypto Balances',
    h1: 'Stop Wasting Gas on Small Balances',
    description: 'Practical ways to avoid spending more on network fees than the value you are moving, including batching, timing and choosing the right network.',
    category: 'Gas & Fees',
    published: '2026-10-14',
    readMins: 4,
    intro: 'Moving a small balance can cost more in gas than the balance is worth. A few habits keep fees from eating your leftovers.',
    sections: [
      { h2: 'Why gas hurts small balances most', paras: ['A network fee is charged per transaction, not per dollar. Paying $2 in gas to move $200 is a 1% cost; paying it to move $5 wipes out 40% of the value, and a bridge adds more steps on top.'] },
      { h2: 'Five habits that save money', bullets: [
        'Decide the destination first. Know which network you want to consolidate on before you start moving anything.',
        'Batch balances. One planned route for several tokens spreads fixed costs better than many separate transfers.',
        'Prefer cheaper networks. Layer 2 networks and several side chains usually cost less than Ethereum mainnet, but check a live quote.',
        'Time it. Network fees move with demand, so compare quotes at different times instead of paying during a spike.',
        'Skip hopeless moves. If the quote shows you receiving close to nothing, leave the balance.',
      ] },
      { h2: 'Keep a little native token for gas', paras: ['You need the network’s native token to send any transaction there. If you bridge everything away, you may be unable to move the last token you hold on that network. Keep a small native-token balance on networks you still use.'] },
      { h2: 'Check the final amount, not the headline fee', paras: ['A route that advertises a low fee can still deliver less because of price impact or destination costs. Compare routes by the amount you will receive on the destination network.'] },
    ],
    faq: [
      ['What is the cheapest time to move crypto?', 'Fees vary with network demand, so there is no fixed answer. Compare live quotes and be willing to wait.'],
      ['Why did my bridge cost more than the quote?', 'Quotes change quickly and may exclude a destination step. Review the minimum received amount before signing.'],
      ['Can I avoid gas entirely?', 'Not on-chain. Every transaction needs a fee, so the aim is to avoid transactions that do not pay for themselves.'],
    ],
    related: ['is-it-worth-moving-small-crypto-balances', 'what-is-crypto-dust'],
    links: [['/learn/how-to-save-on-gas', 'Learn: how to save on gas'], ['/how-to-consolidate-crypto', 'How to consolidate crypto'], ['/bridge', 'Bridge route guides']],
  },
  {
    slug: 'hidden-airdrops-2026',
    title: 'How to Find Forgotten Tokens and Airdrops in Your Wallet',
    h1: 'Find Forgotten Tokens and Airdrops',
    description: 'A realistic checklist for finding forgotten token balances and unclaimed airdrop allocations across the networks you have used, without risking your wallet.',
    category: 'Discovery',
    published: '2026-10-14',
    readMins: 5,
    intro: 'Most wallets only show the network you last selected, so tokens from old airdrops, bridges and experiments can sit unnoticed for years. Here is how to look properly, and safely.',
    sections: [
      { h2: 'Why forgotten tokens happen', paras: ['One address works on many networks, but each network keeps its own balances. If your wallet is set to Ethereum, assets on Base, Arbitrum, Optimism, Polygon, BNB Smart Chain or Avalanche are not in view unless you switch. Airdrops, quest rewards and one-off bridges all leave small balances behind.'] },
      { h2: 'Step 1: list your addresses', bullets: [
        'Current wallets and old browser-extension wallets.',
        'Addresses you used for a single mint, quest or airdrop.',
        'Withdrawal addresses saved in exchange accounts.',
      ] },
      { h2: 'Step 2: scan every network, read-only', paras: ['Use a multi-chain scanner that only needs your public address. Dust Finder currently reads seven networks: Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism and Avalanche. No scanner covers every chain, so also check others you remember using in a block explorer.'] },
      { h2: 'Step 3: verify before you touch anything', bullets: [
        'Compare each token contract with the project’s official channels.',
        'Check liquidity before trusting a displayed price. An illiquid token may not be sellable at that price.',
        'Treat unsolicited tokens that push you toward a link as untrusted.',
      ] },
      { h2: 'A note on “claim” pages', paras: ['Real airdrops are announced through a project’s official channels. A token in your wallet that tells you to visit a site is far more likely to be bait than a reward. Never sign an approval you do not understand to “claim” something.'] },
    ],
    faq: [
      ['How do I find old airdrops I forgot?', 'Scan each of your addresses on every network you have used, then verify each unfamiliar token before deciding what to do.'],
      ['Are forgotten tokens usually valuable?', 'Often they are small or illiquid. A few can be worth more than expected, which is why checking is worthwhile, but do not assume a displayed price is realisable.'],
      ['Is it safe to paste my address into a scanner?', 'Yes, if the tool is read-only. Never share a seed phrase or private key.'],
    ],
    related: ['how-to-spot-spam-airdrop-tokens', 'what-is-crypto-dust'],
    links: [['/find-forgotten-crypto', 'Find forgotten crypto'], ['/crypto-wallet-scanner', 'Crypto wallet scanner'], ['/learn/how-to-find-forgotten-tokens', 'Learn: find forgotten tokens']],
  },
  {
    slug: 'how-to-spot-spam-airdrop-tokens',
    title: 'Spam Airdrop Tokens and Dusting Attacks: How to Spot Them',
    h1: 'How to Spot Spam Tokens and Dusting Attacks',
    description: 'Unsolicited tokens in your wallet are usually spam, not a hack. Learn the warning signs, how address poisoning works and the safest way to respond.',
    category: 'Security',
    published: '2026-10-14',
    readMins: 5,
    intro: 'A token you never bought has appeared in your wallet. In most cases your wallet is fine. What matters is what you do next.',
    sections: [
      { h2: 'What spam tokens are', paras: ['Attackers send worthless tokens to many public addresses at once. The token name or metadata usually contains a link or a message such as a claim prompt, hoping you will visit a site or try to sell the token.'] },
      { h2: 'Warning signs', bullets: [
        'A token you never traded, appearing on several networks.',
        'A name that includes a website address or urgent wording.',
        'A “claim” or “verify” page that asks you to connect a wallet and sign.',
        'A token that can be bought but not sold, a common honeypot pattern.',
        'A displayed value that looks too good to be real.',
      ] },
      { h2: 'Dusting and address poisoning', paras: ['Some attackers send tiny amounts to many wallets to try to link addresses together. Another pattern is address poisoning: a tiny transaction from an address that looks similar to one you use, hoping you copy it from your history later and send funds to the wrong place. Always compare the full address, not just the first and last characters.'] },
      { h2: 'What to do', bullets: [
        'Do not click links or visit sites tied to the token.',
        'Hide the token in your wallet app. It is free and needs no signature.',
        'Do not try to sell or swap it until you have verified the contract.',
        'Review your token approvals and revoke any you do not recognise.',
        'Never share a seed phrase or private key with any site.',
      ] },
      { h2: 'Does a spam token mean I was hacked?', paras: ['No. Receiving a token needs nothing from you. Danger starts when you sign an approval, connect to a malicious site or send funds to a poisoned address.'] },
    ],
    faq: [
      ['Can a token drain my wallet just by arriving?', 'No. A token arriving does not give anyone permission to move your funds. Signing an approval does.'],
      ['Should I try to sell a token I did not buy?', 'Not before researching it. Failed sells waste gas, and some tokens bait you into harmful approvals.'],
      ['How can I check if a contract is risky?', 'Review it on a block explorer and use a contract risk scanner as one signal. No automated check is a guarantee.'],
    ],
    related: ['is-my-wallet-hacked', 'hidden-airdrops-2026'],
    links: [['/spam-tokens', 'Spam tokens guide'], ['/learn/honeypot-tokens', 'Learn: honeypot tokens'], ['/risk-scanner/ethereum', 'Token risk scanner']],
  },
  {
    slug: 'is-my-wallet-hacked',
    title: 'Is My Crypto Wallet Hacked? 7 Warning Signs and What to Do',
    h1: 'Is My Crypto Wallet Hacked?',
    description: 'Seven concrete signs that a wallet may be compromised, what is normal, and the steps to take right away to limit the damage.',
    category: 'Security',
    published: '2026-10-14',
    readMins: 6,
    intro: 'Unfamiliar tokens alone do not mean you were hacked, but some signs deserve immediate action. Here is how to tell the difference.',
    sections: [
      { h2: 'Seven warning signs', bullets: [
        'Transactions you did not make appear in your history.',
        'Token approvals you do not recognise, especially unlimited ones.',
        'Funds leave soon after you connected to a new site or signed something.',
        'Your seed phrase or private key was typed into a website, shared in a chat or stored in a cloud note.',
        'A “support” person contacted you first and asked for a phrase or screen share.',
        'You installed a wallet extension or app from an unofficial source.',
        'Repeated prompts to sign or verify from a site you did not intend to use.',
      ] },
      { h2: 'What is normal', paras: ['Spam tokens and tiny unsolicited transfers are common and do not mean your keys are exposed. The real indicators are outgoing transactions you did not authorise and approvals you cannot explain.'] },
      { h2: 'What to do right now', bullets: [
        'Stop signing anything and disconnect your wallet from all sites.',
        'If the seed phrase may be exposed, create a new wallet on a clean device and move assets there. The old keys are compromised permanently.',
        'Review approvals on each network and revoke unknown ones with an approval-checking tool.',
        'Move the most valuable assets first, keeping network fees in mind.',
        'Remove suspicious browser extensions and scan the device for malware.',
      ] },
      { h2: 'Check what is exposed across networks', paras: ['Approvals and balances are per network. Review each network you use. A read-only scan shows the balances on seven networks (Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism, Avalanche), and the token risk scanner shows contract risk signals as a heuristic.'] },
      { h2: 'Prevention', bullets: [
        'Keep your seed phrase offline and never type it into a site.',
        'Use a separate wallet for experiments and airdrops.',
        'Review approvals monthly.',
        'Bookmark the sites you use instead of following links in messages.',
      ] },
    ],
    faq: [
      ['Can someone steal crypto with only my public address?', 'No. A public address can only be used to view balances. Theft requires your keys or a signature from you.'],
      ['Should I revoke approvals even if nothing is missing?', 'Yes, revoking old unlimited approvals reduces future risk. It costs a small network fee per approval.'],
      ['Can stolen crypto be recovered?', 'Rarely. Blockchain transactions are final, so prevention and fast action matter most.'],
    ],
    related: ['how-to-check-token-approvals', 'how-to-spot-spam-airdrop-tokens'],
    links: [['/wallet-cleanup', 'Wallet cleanup checklist'], ['/crypto-wallet-checkup', 'Wallet checkup routine'], ['/security', 'Security page']],
  },
  {
    slug: 'how-to-check-token-approvals',
    title: 'How to Check and Revoke Token Approvals (Step by Step)',
    h1: 'How to Check and Revoke Token Approvals',
    description: 'Learn what token approvals are, why unlimited approvals are risky, and how to review and revoke them on each network you use.',
    category: 'Security',
    published: '2026-10-14',
    readMins: 5,
    intro: 'When you use a decentralised app, you often approve a contract to spend your tokens. Those permissions stay active until you revoke them.',
    sections: [
      { h2: 'What a token approval is', paras: ['An approval lets a smart contract spend a specified amount of one of your tokens. Many apps request an unlimited amount for convenience. If that contract is later exploited, or you approved a malicious one, the permission can be abused without another signature from you.'] },
      { h2: 'How to check approvals', bullets: [
        'Pick a network. Approvals are separate on each network.',
        'Open an approval checker, either your block explorer’s token approvals page or a dedicated tool such as Revoke.cash, and enter your public address.',
        'Sort by value at risk or by unlimited allowances.',
        'Identify apps you still use and contracts you do not recognise.',
      ] },
      { h2: 'How to revoke', bullets: [
        'Connect your wallet to the approval tool on the right network.',
        'Choose the approval to revoke and confirm the transaction. Revoking costs a small network fee.',
        'Repeat for each unrecognised or unused approval, prioritising unlimited ones on valuable tokens.',
      ] },
      { h2: 'What revoking does not do', paras: ['Revoking removes a contract’s permission. It does not recover funds already stolen or fix a compromised seed phrase. If your keys are exposed, move assets to a new wallet instead.'] },
      { h2: 'Approvals and dust cleanup', paras: ['Review approvals before consolidating dust. Tokens that you cannot sell, or that arrived unsolicited, are a common source of approval requests you should decline.'] },
    ],
    faq: [
      ['Do approvals expire?', 'Most do not. They stay active until you revoke them or the amount is used up.'],
      ['Is approving a token the same as sending it?', 'No. An approval grants permission to spend. Funds only move when the contract uses it.'],
      ['How often should I review approvals?', 'Monthly or after using a new app is a sensible routine.'],
    ],
    related: ['is-my-wallet-hacked', 'dust-sweeper-vs-revoke-cash'],
    links: [['/learn/token-approvals', 'Learn: token approvals'], ['/learn/revoke-wallet-permissions', 'Learn: revoke permissions'], ['/wallet-audit-tool', 'Wallet audit checklist']],
  },
  {
    slug: 'dust-sweeper-vs-revoke-cash',
    title: 'Dust Sweeper vs Revoke.cash: What Each Tool Is For',
    h1: 'Dust Sweeper vs Revoke.cash',
    description: 'Dust Sweeper finds small and forgotten balances; Revoke.cash manages token approvals. A clear comparison and how to use both safely.',
    category: 'Comparison',
    published: '2026-10-14',
    readMins: 4,
    intro: 'These tools solve different problems. One helps you see what you hold; the other helps you control what contracts may spend.',
    sections: [
      { h2: 'The short version', paras: ['Revoke.cash is a widely used tool for reviewing and revoking token approvals. Dust Sweeper focuses on discovering small and forgotten balances, showing token risk signals, and comparing swap and bridge routes. They are complementary, not competitors.'] },
      { h2: 'Side by side', bullets: [
        'Main job: Dust Sweeper finds small and forgotten balances and routes for moving them; Revoke.cash reviews and revokes approvals.',
        'Read-only start: both can begin from a public address with no seed phrase.',
        'Transactions: revoking and swapping or bridging are on-chain transactions you sign in your own wallet.',
        'Networks: Dust Finder reads seven networks (Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism, Avalanche); check each tool for its current network list.',
      ] },
      { h2: 'When to use which', bullets: [
        'You suspect a bad approval or used a risky app: start with an approval checker.',
        'You want to know what small or forgotten assets you hold: use a balance scanner.',
        'You are about to consolidate balances: check approvals first, then compare routes.',
      ] },
      { h2: 'A simple routine', paras: ['Once a month, scan balances, hide spam, review approvals and decide whether any small balance is worth moving. The whole review takes about ten minutes.'] },
    ],
    faq: [
      ['Does Dust Sweeper revoke approvals?', 'Its focus is balance discovery, token risk signals and routes. Use an approval checker such as Revoke.cash to review and revoke permissions.'],
      ['Which should I use first?', 'If you suspect a compromise, review approvals first. For general cleanup, scan balances first and then check approvals before consolidating.'],
      ['Are both safe to use?', 'Use official domains, never share a seed phrase and review every transaction before signing.'],
    ],
    related: ['how-to-check-token-approvals', 'is-my-wallet-hacked'],
    links: [['/wallet-audit-tool', 'Wallet audit tool guide'], ['/crypto-wallet-checkup', 'Wallet checkup'], ['/', 'Open Dust Sweeper']],
  },
]

export const POST_MAP: Record<string, Post> = Object.fromEntries(POSTS.map((p) => [p.slug, p]))
