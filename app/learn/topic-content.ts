import { chains, topics, chainMap, topicAngles, getChainProfile } from "./data";

/**
 * Content builder for /learn/[chain]/[topic].
 * Uses only data that already exists in ./data (chain profiles, topic angles)
 * plus general, non-numeric guidance. No chain-specific facts are invented.
 */

export type Family = "evm-l1" | "l2" | "non-evm" | "other";

const FAMILY: Record<string, Family> = {
  ethereum: "evm-l1", polygon: "evm-l1", bsc: "evm-l1", avalanche: "evm-l1",
  fantom: "evm-l1", cronos: "evm-l1", gnosis: "evm-l1",
  arbitrum: "l2", base: "l2", optimism: "l2", zksync: "l2", linea: "l2",
  mantle: "l2", scroll: "l2", blast: "l2", metis: "l2", manta: "l2", zora: "l2",
  solana: "non-evm", sui: "non-evm", aptos: "non-evm", celestia: "non-evm", starknet: "non-evm",
  sei: "other",
};

export type Category = "route" | "ecosystem" | "security" | "bridge" | "economics" | "cleanup";

const SECURITY = new Set([
  "wallet-security-basics", "token-contract-risk", "honeypot-tokens", "token-approvals",
  "revoke-wallet-permissions", "wallet-scams", "fake-airdrops", "wallet-address-safety",
  "unknown-token-safety", "bridge-security", "dust-vs-spam-tokens",
]);
const BRIDGE = new Set([
  "how-bridges-work", "bridge-vs-swap", "cross-chain-fees", "bridge-fee-comparison", "bridge-slippage",
  "safe-cross-chain-transfer", "before-using-a-bridge", "bridge-aggregators", "crypto-bridge-glossary",
  "cross-chain-token-support",
]);
const ECONOMICS = new Set([
  "how-to-save-on-gas", "small-balance-economics", "dust-recovery-strategy", "crypto-recovery-mistakes",
]);
const ECOSYSTEM = new Set(["erc20-dust", "bnb-dust", "layer2-dust", "solana-small-balances"]);

const ROUTE_RE = /^bridge-([a-z]+)-to-([a-z]+)$/;

export function categoryOf(topic: string): Category {
  if (ROUTE_RE.test(topic)) return "route";
  if (ECOSYSTEM.has(topic)) return "ecosystem";
  if (SECURITY.has(topic)) return "security";
  if (BRIDGE.has(topic)) return "bridge";
  if (ECONOMICS.has(topic)) return "economics";
  return "cleanup";
}

export function routeOf(topic: string): { from: string; to: string } | null {
  const m = topic.match(ROUTE_RE);
  if (!m || !chainMap[m[1]] || !chainMap[m[2]]) return null;
  return { from: m[1], to: m[2] };
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
function firstSentence(s: string) {
  const i = s.indexOf(". ");
  return i === -1 ? s : s.slice(0, i + 1);
}
function clip(s: string, max: number) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\-–]$/, "") + "…";
}

export function pageTitle(chain: string, topic: string): string {
  const chainName = chainMap[chain];
  const item = topics.find(([s]) => s === topic)!;
  const title = item[1];
  const route = routeOf(topic);
  if (route) {
    const a = chainMap[route.from];
    const b = chainMap[route.to];
    if (chain === route.from || chain === route.to) return `${a} to ${b} Route: ${chainName} Wallet Guide`;
    return `${chainName} Wallets and the ${a} to ${b} Route`;
  }
  if (categoryOf(topic) === "ecosystem") return `${title}: ${chainName} Perspective`;
  return `${title} on ${chainName}`;
}

export function pageDescription(chain: string, topic: string): string {
  const chainName = chainMap[chain];
  const item = topics.find(([s]) => s === topic)!;
  const profile = getChainProfile(chain);
  const r = routeOf(topic);
  const base = r
    ? `How ${chainName} balances relate to the ${chainMap[r.from]} to ${chainMap[r.to]} route.`
    : item[2];
  const full = `${base} Applied to ${chainName} (${profile.role}).`;
  if (full.length <= 158) return full;
  return clip(`${base} Applied to ${chainName}.`, 158);
}

const FAMILY_NOTE: Record<Family, (n: string) => string> = {
  "evm-l1": (n) =>
    `${n} uses EVM-style addresses and token contracts, which means the same address can hold balances on several EVM networks at once. A balance that is missing on ${n} may simply be sitting on a different network.`,
  l2: (n) =>
    `${n} is part of the Ethereum scaling ecosystem. The same ticker can exist on Ethereum and on ${n} as separate token contracts, so a balance seen on one network cannot be assumed to exist, or to be redeemable at the same value, on the other.`,
  "non-evm": (n) =>
    `${n} does not follow standard EVM conventions. Address formats, token identifiers and approval mechanics differ, so EVM-oriented checklists and tools should only be applied to ${n} after confirming they are supported.`,
  other: (n) =>
    `${n} can expose different asset and application conventions depending on the wallet and ecosystem you use, so confirm which environment a balance belongs to before acting on it.`,
};

type Step = (n: string) => string;

const STEPS: Record<Category, Step[]> = {
  cleanup: [
    (n) => `Confirm the wallet address and that you are viewing ${n} before interpreting any balance.`,
    (n) => `List every asset visible on ${n} and mark unfamiliar tokens for research instead of interacting with them.`,
    (n) => `Compare each small balance on ${n} with the full cost of moving it before deciding to consolidate.`,
    (n) => `Keep a simple record of what you reviewed on ${n}, so the next checkup starts from a known state.`,
    (n) => `Never enter a seed phrase or private key into a scanning or recovery site, including for ${n}.`,
    (n) => `Leave a balance alone when the cost of moving it from ${n} exceeds what you would receive.`,
  ],
  security: [
    (n) => `Verify the contract address on ${n} from an independent source rather than a ticker or a logo.`,
    (n) => `Read what a ${n} transaction or signature request actually authorizes before approving it.`,
    (n) => `Treat unexpected tokens or links that appear in a ${n} wallet as untrusted until verified.`,
    (n) => `Review and revoke permissions you no longer use on ${n}, especially unlimited approvals.`,
    (n) => `Check the domain you are on before connecting a wallet for any ${n} action.`,
    (n) => `Send a small test amount first when an address or route on ${n} is new to you.`,
  ],
  bridge: [
    (n) => `Confirm both the source and destination network, including whether ${n} is one of them.`,
    (n) => `Compare the quote, the minimum received amount and the total fees before signing.`,
    (n) => `Check that the token you hold on ${n} is supported for the route you are considering.`,
    (n) => `Allow for a delay between sending and receiving; do not repeat a transfer while one is pending.`,
    (n) => `Keep enough native balance on ${n} to pay for the transaction that starts the transfer.`,
    (n) => `Review the final recipient address and network before confirming a cross-chain transfer.`,
  ],
  economics: [
    (n) => `Estimate the complete cost of moving a balance from ${n}: network fee, route cost and destination cost.`,
    (n) => `Compare that cost with the balance value, not with the price shown in a portfolio tracker.`,
    (n) => `Batch decisions when several small balances on ${n} could use the same route.`,
    (n) => `Leave balances on ${n} that cannot be moved economically; they can be revisited later.`,
    (n) => `Quotes change with network conditions, so re-check the numbers right before signing.`,
    (n) => `Do not chase a tiny balance on ${n} with an expensive multi-step route.`,
  ],
  ecosystem: [
    (n) => `Identify which token standard and address format ${n} actually uses before applying any guide.`,
    (n) => `Verify the exact token identifier on ${n} instead of trusting a shared ticker.`,
    (n) => `Confirm your wallet is connected to ${n} so balances are read from the right network.`,
    (n) => `Research unfamiliar tokens on ${n} before you interact with them.`,
    (n) => `Estimate the cost of moving a small ${n} balance before deciding whether to consolidate it.`,
    (n) => `Re-check supported networks and tokens for any tool, since coverage changes over time.`,
  ],
  route: [
    (n) => `Confirm that the token you hold on ${n} is supported for the route you are reading about.`,
    (n) => `Verify the source network, the destination network and the destination address before signing.`,
    (n) => `Compare quotes and the minimum received amount, since the final amount can differ from the estimate.`,
    (n) => `Keep enough native balance on the source network to pay for the transaction.`,
    (n) => `Do not assume a route from ${n} is available; check the current interface and quote.`,
    (n) => `Send a small test amount first if the route or address is new to you.`,
  ],
};

export function steps(chain: string, topic: string): string[] {
  const cat = categoryOf(topic);
  const n = chainMap[chain];
  const pool = STEPS[cat];
  const ci = chains.findIndex(([s]) => s === chain);
  const ti = topics.findIndex(([s]) => s === topic);
  const start = (ci * 2 + ti) % pool.length;
  return [0, 1, 2, 3].map((k) => pool[(start + k) % pool.length](n));
}

export function ecosystemFrame(chain: string, topic: string): string {
  const n = chainMap[chain];
  const fam = FAMILY[chain];
  const profile = getChainProfile(chain);
  switch (topic) {
    case "erc20-dust":
      return fam === "non-evm"
        ? `ERC-20 is an EVM token standard, so it is not how assets are represented on ${n}. ${profile.architecture} The idea of a small leftover balance still applies, but the checks differ.`
        : `${n} is EVM-based or EVM-compatible, so ERC-20-style token contracts are the usual way small balances appear. ${profile.assetFocus}`;
    case "bnb-dust":
      return chain === "bsc"
        ? `On BNB Smart Chain, small balances are typically BEP-20 tokens. ${profile.assetFocus}`
        : `BEP-20 tokens live on BNB Smart Chain. If you also use ${n}, the same ticker may be a different contract there, so compare the network and contract before treating two balances as the same asset. ${profile.assetFocus}`;
    case "layer2-dust":
      return fam === "l2"
        ? `${n} is one of the Ethereum scaling networks where small balances accumulate across applications and bridges. ${profile.feeFocus}`
        : `${n} is not an Ethereum Layer 2, but many wallets that use ${n} also hold assets on rollups. Keeping a per-network inventory helps you avoid treating them as one balance. ${profile.feeFocus}`;
    case "solana-small-balances":
      return chain === "solana"
        ? `On Solana, balances are tied to token accounts, and each mint is identified by an address. ${profile.assetFocus}`
        : `Solana handles tokens through accounts rather than EVM-style contracts. If you also use ${n}, do not apply Solana assumptions there, or the reverse. ${profile.architecture}`;
    default:
      return profile.architecture;
  }
}

export function routeFrame(chain: string, topic: string) {
  const r = routeOf(topic);
  if (!r) return null;
  const from = chainMap[r.from];
  const to = chainMap[r.to];
  const fp = getChainProfile(r.from);
  const tp = getChainProfile(r.to);
  const n = chainMap[chain];
  let intro: string;
  if (chain === r.from) {
    intro = `${n} is the starting network for this route. Before moving anything to ${to}, confirm which assets you actually hold on ${n}.`;
  } else if (chain === r.to) {
    intro = `${n} is the destination for this route. Before receiving assets from ${from}, confirm the token you expect to receive on ${n}.`;
  } else {
    intro = `${n} is neither end of the ${from} to ${to} route, but a wallet that uses ${n} often holds balances on those networks too. If your assets are on ${n}, they would first have to be on ${from} for this route to apply.`;
  }
  return {
    intro,
    sourceTitle: `Leaving ${from}`,
    source: `${fp.feeFocus} ${fp.securityFocus}`,
    destTitle: `Arriving on ${to}`,
    dest: `${tp.assetFocus} ${tp.feeFocus}`,
    from,
    to,
  };
}

export function orderedFocus(chain: string, topic: string) {
  const p = getChainProfile(chain);
  const cat = categoryOf(topic);
  const items = {
    cost: { label: "Costs", text: p.feeFocus },
    assets: { label: "Assets and tokens", text: p.assetFocus },
    security: { label: "Security", text: p.securityFocus },
  };
  const order: (keyof typeof items)[] =
    cat === "security" ? ["security", "assets", "cost"]
    : cat === "economics" || cat === "bridge" || cat === "route" ? ["cost", "security", "assets"]
    : ["assets", "cost", "security"];
  return order.map((k) => items[k]);
}

const QUOTES: Record<Category, string> = {
  cleanup: "The goal of a wallet cleanup is not to move everything. It is to make informed decisions about what is safe and economical to move.",
  security: "A signature is a decision. If a request cannot be explained in plain words, it is not ready to be signed.",
  bridge: "A quote is an estimate. The amount that matters is the minimum received, checked right before signing.",
  economics: "A balance is only worth moving when what you receive is larger than what it costs to move it.",
  ecosystem: "The same idea can work differently on each network. Confirm the environment before applying a checklist.",
  route: "A route is a plan, not a promise. Check the current quote and the destination before you sign.",
};
export function quoteFor(topic: string) {
  return QUOTES[categoryOf(topic)];
}

export function bridgeNote(chain: string, next: string) {
  const a = getChainProfile(chain);
  const b = getChainProfile(next);
  return `${a.feeFocus} On the ${chainMap[next]} side: ${lowerFirst(b.assetFocus)}`;
}

export function familyNote(chain: string) {
  return FAMILY_NOTE[FAMILY[chain] ?? "other"](chainMap[chain]);
}

export function angleOf(topic: string) {
  const item = topics.find(([s]) => s === topic)!;
  return topicAngles[topic] || item[2];
}

export function relatedTopics(chain: string, topic: string): string[] {
  const cat = categoryOf(topic);
  const ci = chains.findIndex(([s]) => s === chain);
  const same = topics.map(([s]) => s).filter((s) => s !== topic && categoryOf(s) === cat);
  const pool = same.length >= 3 ? same : topics.map(([s]) => s).filter((s) => s !== topic);
  const ti = pool.length ? (ci + topics.findIndex(([s]) => s === topic)) % pool.length : 0;
  return [0, 1, 2].map((k) => pool[(ti + k) % pool.length]);
}

export function otherChains(chain: string, topic: string): string[] {
  const ci = chains.findIndex(([s]) => s === chain);
  const ti = topics.findIndex(([s]) => s === topic);
  const step = 1 + (ti % 5);
  return [1, 2, 3].map((k) => chains[(ci + step * k) % chains.length][0]).filter((s, i, a) => s !== chain && a.indexOf(s) === i);
}

export { lowerFirst };
