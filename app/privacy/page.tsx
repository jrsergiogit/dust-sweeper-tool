import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://dustsweepertool.com/privacy" },
  title: "Privacy Policy | Dust Sweeper Tool",
  description:
    "Learn how Dust Sweeper Tool handles public wallet data, usage analytics, advertising measurement, and third-party blockchain infrastructure.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">
            Last Updated: September 2026
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <p className="text-xl text-blue-400 font-medium leading-relaxed italic">
              "At Dust Sweeper, we aim to keep data collection limited to what
              is necessary to operate, secure, improve, and measure the
              service."
            </p>
          </section>

          <section className="grid gap-8">
            <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                1. Information We Use
              </h2>

              <div className="text-gray-400 space-y-3">
                <p>
                  <span className="text-white font-medium">No account:</span>{" "}
                  You don’t need to create an account or provide an email
                  address to use the service.
                </p>

                <p>
                  <span className="text-white font-medium">
                    Public wallet information:
                  </span>{" "}
                  When you scan a wallet, the service may process the public
                  wallet address you provide to retrieve publicly available
                  blockchain information such as token balances and related
                  metadata.
                </p>

                <p>
                  <span className="text-white font-medium">
                    Usage analytics:
                  </span>{" "}
                  We collect limited usage information to understand how the
                  service is used, identify technical or usability issues, and
                  improve the product. This may include anonymous session
                  identifiers, page visits, feature interactions, device type,
                  language, traffic source or referrer, and aggregated
                  categories related to tool usage.
                </p>

                <p>
                  <span className="text-white font-medium">
                    Advertising measurement:
                  </span>{" "}
                  We use the Google Ads tag to measure website traffic and
                  advertising campaign performance. Advertising and measurement
                  technologies may process technical information associated
                  with visits to the website.
                </p>

                <p>
                  <span className="text-white font-medium">
                    Security and rate limiting:
                  </span>{" "}
                  Technical information such as an IP address may be processed
                  to help protect the service from abuse and enforce rate
                  limits.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                2. Usage Analytics
              </h2>

              <div className="text-gray-400 space-y-4 leading-relaxed">
                <p>
                  Dust Sweeper records limited analytics events to understand
                  how visitors move through the service. Depending on the
                  feature being used, these events may indicate that a page was
                  visited, a wallet scan was started, a scan returned a result,
                  assets were found, an asset was selected, a transaction route
                  became available, or a recovery flow was completed.
                </p>

                <p>
                  Analytics may also include general technical and attribution
                  information such as device type, language, page path,
                  referring source, and aggregated categories such as ranges or
                  status values.
                </p>

                <p>
                  Our internal usage analytics are designed not to include your
                  private keys, seed phrase, wallet private credentials, wallet
                  addresses, token contract addresses, or exact wallet
                  balances.
                </p>

                <p>
                  Analytics events may be processed and stored using Google
                  infrastructure, including Google Apps Script and Google
                  Sheets.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                3. Public Blockchain Data
              </h2>

              <p className="text-gray-400 leading-relaxed">
                Blockchain addresses and transaction activity are public by
                design. When you provide a wallet address for scanning, Dust
                Sweeper uses that public address to retrieve blockchain
                information required to provide the requested functionality.
                We do not need your private keys or seed phrase to perform a
                public wallet scan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                4. Wallet Connections and Transactions
              </h2>

              <p className="text-gray-400 leading-relaxed">
                A wallet connection may be required when you choose to perform
                a swap, bridge, or other blockchain transaction. Dust Sweeper
                does not take custody of your funds. Transactions are reviewed
                and confirmed by you in your own wallet.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                5. Transaction Logs
              </h2>

              <p className="text-gray-400 leading-relaxed">
                Any transaction you perform is recorded on the relevant public
                blockchain. These records are permanent and publicly
                accessible by the nature of blockchain technology. Dust Sweeper
                cannot hide or delete blockchain records.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                6. Third-Party Services
              </h2>

              <p className="text-gray-400 leading-relaxed">
                Dust Sweeper uses third-party infrastructure to provide parts
                of its functionality, including blockchain data providers,
                transaction routing services, wallet infrastructure,
                advertising measurement services, and analytics
                infrastructure. These providers may process technical
                information according to their own privacy policies and terms.
              </p>

              <p className="text-gray-400 leading-relaxed mt-4">
                Transaction routing for swaps, bridges, and related flows uses
                the <strong>LI.FI Protocol</strong>. Blockchain data used for
                wallet scanning is retrieved through infrastructure such as{" "}
                <strong>Alchemy</strong>.
              </p>

              <p className="text-gray-400 leading-relaxed mt-4">
                Internal usage analytics may be processed and stored using
                Google services, including <strong>Google Apps Script</strong>{" "}
                and <strong>Google Sheets</strong>. Google services may also be
                used for advertising and campaign measurement.
              </p>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                7. Security
              </h2>

              <p className="text-gray-400 leading-relaxed">
                Dust Sweeper is a non-custodial interface. The service does not
                require your seed phrase or private key to perform a public
                wallet scan. When a blockchain transaction is initiated, you
                review and authorize it through your own wallet.
              </p>

              <p className="text-gray-400 leading-relaxed mt-4">
                For more information about wallet access, infrastructure, and
                transaction handling, see our{" "}
                <a
                  href="/security"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Security &amp; Transparency
                </a>{" "}
                page.
              </p>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                8. Data Retention
              </h2>

              <div className="text-gray-400 space-y-4 leading-relaxed">
                <p>
                  Dust Sweeper does not require an account or user profile to
                  perform wallet scans. Public blockchain records remain on
                  their respective networks independently of Dust Sweeper.
                </p>

                <p>
                  Technical information processed for security, rate limiting,
                  advertising measurement, or service analytics may be retained
                  according to the relevant service and its configuration.
                </p>

                <p>
                  Usage analytics may be retained for operational,
                  troubleshooting, security, and product-analysis purposes and
                  may be periodically deleted, aggregated, or anonymized when
                  no longer required for those purposes.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}