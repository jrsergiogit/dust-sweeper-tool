import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://app.dustsweepertool.com/security" },
  title: "Security | Dust Sweeper Tool",
  description:
    "How Dust Sweeper Tool handles wallet access, transactions, third-party infrastructure, and independent verification.",
};

const externalLinks = {
  alchemy: "https://www.alchemy.com/dapps/dust-sweeper-tool",
  dappradar: "https://dappradar.com/dapp/dust-sweeper-tool",
  lifi: "https://li.fi/",
  goplus: "https://gopluslabs.io/",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-3">
            Security &amp; transparency
          </p>
          <h1 className="text-4xl font-black tracking-tighter mb-4">
            Security at Dust Sweeper
          </h1>
          <p className="text-gray-400 leading-relaxed">
            This page explains how Dust Sweeper Tool handles wallet access,
            blockchain data, transactions, and third-party infrastructure.
            Where possible, you can verify the information independently.
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              1. Non-custodial architecture
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-4">
              <p>
                Dust Sweeper Tool is non-custodial. The service does not take
                custody of user funds. Transactions are reviewed and confirmed
                in the user&apos;s own wallet.
              </p>
              <p>
                Wallet scanning can be performed by entering a public wallet
                address. A public blockchain address is not a private key or
                seed phrase.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              2. When is wallet access required?
            </h2>
            <div className="grid gap-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
                <h3 className="font-semibold text-white mb-2">
                  Scanning a wallet
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  You can enter a public wallet address and scan its
                  blockchain balances without connecting a wallet.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
                <h3 className="font-semibold text-white mb-2">
                  Swaps and bridges
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  A wallet connection is used when a transaction needs to be
                  prepared and signed. The transaction is then confirmed by
                  you in your own wallet.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              3. Blockchain data &amp; infrastructure
            </h2>
            <div className="space-y-6 text-gray-400 leading-relaxed">
              <div>
                <h3 className="font-semibold text-white mb-2">Alchemy</h3>
                <p>
                  Dust Sweeper uses Alchemy to retrieve public blockchain
                  information used by wallet scanning. The current Dust Finder
                  request queries 7 networks: Ethereum, BNB Smart Chain,
                  Polygon, Arbitrum, Base, Optimism, and Avalanche. Alchemy's
                  Portfolio API supports a broader set of networks, but Dust
                  Finder currently requests this defined 7-network set.
                </p>
                <a
                  href={externalLinks.alchemy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  View the Dust Sweeper listing on Alchemy →
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">LI.FI</h3>
                <p>
                  Swap, bridge, and cross-chain recovery routing uses the LI.FI
                  infrastructure integrated into the application. LI.FI currently
                  provides swap and bridge liquidity across 60+ blockchains.
                  Availability depends on the asset, source and destination
                  chains, liquidity, and the route returned at the time of the
                  request. The resulting transaction is reviewed and signed in
                  the user&apos;s wallet.
                </p>
                <a
                  href={externalLinks.lifi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  Visit LI.FI →
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">GoPlus</h3>
                <p>
                  The Scam Contract Scanner uses GoPlus token-security data
                  for supported networks. Its results are automated security
                  signals and are not a substitute for a full smart-contract
                  audit.
                </p>
                <a
                  href={externalLinks.goplus}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-purple-400 hover:text-purple-300"
                >
                  Visit GoPlus →
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              4. Transactions, approvals &amp; permissions
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-4">
              <p>
                Dust Sweeper does not silently execute a swap or bridge on
                your behalf. Transaction actions require confirmation in your
                wallet.
              </p>
              <p>
                Depending on the asset and route, a transaction may request
                an ERC-20 token approval. An approval allows the specified
                contract or router to spend the approved token amount under
                the terms shown by your wallet. Review the spender, token,
                amount, route, and network before signing.
              </p>
              <p>
                Blockchain transactions are irreversible once confirmed.
                Always verify the transaction details in your wallet before
                approving.
              </p>
            </div>
          </section>


          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              5. Service fees
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-4">
              <p>
                The current application configuration uses a 1% service fee for
                Dust Finder recovery/consolidation routes and a 1% fee for the
                transaction flow available from the Scam Contract Scanner when
                applicable. The standard Swap widget is configured at 0%, and
                the Bridge widget is configured at 0.5%. Network gas fees are
                separate and depend on the blockchain and transaction.
              </p>
              <p>
                Review the route and transaction details shown by your wallet
                before approving any transaction.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              6. Independent verification
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-4">
              <p>
                Don&apos;t take our word for it. You can verify the project
                and its infrastructure using independent sources.
              </p>

              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <a
                    href={externalLinks.alchemy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Alchemy Dapp Store listing
                  </a>{" "}
                  — independent ecosystem listing for Dust Sweeper Tool.
                </li>
                <li>
                  <a
                    href={externalLinks.dappradar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    DappRadar listing
                  </a>{" "}
                  — another independent public listing.
                </li>
                <li>
                  Use a blockchain explorer to inspect wallet addresses and
                  confirmed transactions directly on the relevant network.
                </li>
                <li>
                  Review the transaction details shown by your wallet before
                  approving any swap, bridge, or token approval.
                </li>
              </ul>

              <p className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 text-sm">
                Dust Sweeper does not publish a proprietary smart-contract
                address for the application itself. Swap and bridge routes
                may interact with third-party contracts selected by the
                underlying routing infrastructure.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              7. Privacy &amp; data
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-4">
              <p>
                Wallet addresses are public blockchain information. The
                application uses the address supplied by the user to perform
                the requested scan and retrieve blockchain data.
              </p>
              <p>
                For the project&apos;s detailed statements about data handling,
                public blockchain records, and third-party services, see the{" "}
                <a
                  href="/privacy"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              8. Security limitations
            </h2>
            <div className="text-gray-400 leading-relaxed space-y-4">
              <p>
                No Web3 application can eliminate the risks inherent to
                blockchain networks, smart contracts, token contracts, bridges,
                liquidity providers, wallets, or market conditions.
              </p>
              <p>
                Automated scanner results can produce false positives or miss
                previously unknown risks. A clean scan should not be treated
                as a guarantee that a token or contract is safe.
              </p>
              <p>
                Review the transaction and approval details in your wallet and
                use the information from this tool as part of your own
                verification process.
              </p>
            </div>
          </section>

          <section className="border-t border-gray-800 pt-8">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Project information
            </h2>
            <div className="text-gray-500 text-sm leading-relaxed space-y-2">
              <p>
                <span className="text-gray-300 font-medium">Project:</span>{" "}
                Dust Sweeper Tool
              </p>
              <p>
                <span className="text-gray-300 font-medium">Application:</span>{" "}
                app.dustsweepertool.com
              </p>
              <p>
                <span className="text-gray-300 font-medium">Current
                infrastructure:</span>{" "}
                Next.js application using Alchemy for blockchain data and
                LI.FI for swap/bridge routing, with GoPlus security data for
                supported token scans.
              </p>
              <p>
                <span className="text-gray-300 font-medium">Version
                history:</span>{" "}
                No public version history or changelog is currently published
                on the application.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
