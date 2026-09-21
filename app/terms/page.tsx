import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://dustsweepertool.com/terms" },
  title: "Terms of Use | Dust Sweeper Tool",
  description: "Terms of Service and Service Disclaimer for Dust Sweeper Tool.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Use & Service Disclaimer</h1>
          <p className="text-gray-400 text-sm">Last Updated: January 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-10">
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-500">1. Nature of the Service</h2>
            <div className="text-gray-400 space-y-4">
              <p>
                Dust Sweeper is a decentralized finance (DeFi) interface that uses <strong>Alchemy</strong> for wallet balance discovery on the networks currently queried by Dust Finder and <strong>LI.FI</strong> for supported swap, bridge, and recovery routing. The default recovery destination is the asset's source network when a compatible same-chain route is available; cross-chain destinations may be selected when supported.
              </p>
              <p>
                We are a <strong>non-custodial</strong> service. This means we never have access to your private keys and we do not store your assets. All transactions are executed directly between your wallet and the smart contracts of the liquidity providers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-500">2. Service Fees (The “Sweep Fee”)</h2>
            <div className="text-gray-400 space-y-4">
              <p>By using this tool, you acknowledge and agree to the following fee structure:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Dust recovery / consolidation:</strong> A <strong>5%</strong> service fee is configured for recovery and consolidation routes.</li>
                <li><strong>Scam Contract Scanner transaction flow:</strong> A <strong>5%</strong> service fee is configured when that transaction flow is used.</li>
                <li><strong>Standard Swap:</strong> The current Swap widget is configured with a <strong>1%</strong> service fee.</li>
                <li><strong>Bridge:</strong> The current Bridge widget is configured with a <strong>2%</strong> service fee.</li>
                <li><strong>Network Fees (Gas):</strong> You are responsible for paying the network “gas” fees. If your balance is too small to cover the gas fee, the transaction may fail or no route may be available.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-500">3. No Financial Advice</h2>
            <p className="text-gray-400 leading-relaxed">
              The information provided on this website does not constitute financial, investment, or trading advice. Cryptocurrencies are highly volatile assets. You should only sweep assets that you have personally identified as “dust” or redundant.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-500">4. Limitation of Liability</h2>
            <div className="text-gray-400 space-y-4">
              <p><strong>Market Risk:</strong> Dust Sweeper is not responsible for price slippage or market volatility during execution.</p>
              <p><strong>Smart Contract Risk:</strong> While we use audited protocols (LI.FI), you acknowledge that interacting with smart contracts carries inherent technical risks.</p>
              <p><strong>Refunds:</strong> Due to the irreversible nature of blockchain transactions, all “sweeps” are final. No refunds can be issued.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-500">5. Prohibited Jurisdictions</h2>
            <p className="text-gray-400 leading-relaxed">
              Users are responsible for ensuring that their use of this service complies with local laws. Do not use this service if you are located in a region where DeFi or cryptocurrency trading is prohibited.
            </p>
          </section>

          <section className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-semibold mb-2 text-white">6. Modification of Terms</h2>
            <p className="text-gray-400 text-sm">
              Dust Sweeper reserves the right to modify these terms, including the fee structure, at any time to ensure the sustainability of the protocol.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}