import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://app.dustsweepertool.com/privacy" },
  title: "Privacy Policy | Dust Sweeper Tool",
  description: "Learn about our simple privacy philosophy: We don't want your data, and we don't collect it.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last Updated: January 2026</p>
        </header>

        <div className="space-y-12">
          <section>
            <p className="text-xl text-blue-400 font-medium leading-relaxed italic">
              "At Dust Sweeper, we believe that your data is your own. Our privacy philosophy is simple: We don’t want your data, and we don’t collect it."
            </p>
          </section>

          <section className="grid gap-8">
            <div className="bg-gray-900/40 p-6 rounded-xl border border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 text-white">1. No Data Collection</h2>
              <div className="text-gray-400 space-y-3">
                <p><span className="text-white font-medium">No Emails:</span> You don’t need an account to use our service.</p>
                <p><span className="text-white font-medium">No Names or IDs:</span> We never ask for your identity.</p>
                <p><span className="text-white font-medium">Advertising measurement:</span> We use the Google Ads tag to measure website traffic and advertising campaign performance. We do not use it to access private keys, seed phrases, or wallet signing credentials.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Public Blockchain Data</h2>
              <p className="text-gray-400 leading-relaxed">
                When you connect your wallet, we only see what the public blockchain sees: your public wallet address and its balances. This information is necessary to provide the “scan” functionality. We do not store this data on any private database.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Transaction Logs</h2>
              <p className="text-gray-400 leading-relaxed">
                Any transaction you perform is recorded on the public blockchain (Ethereum, Polygon, etc.). These records are permanent and public by the very nature of blockchain technology. Dust Sweeper has no power to hide or delete these public records.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Third-Party Services</h2>
              <p className="text-gray-400 leading-relaxed">
                To execute your “sweeps”, we use the <strong>LI.FI Protocol</strong>. While we don’t track you, you are subject to the technical execution environment of LI.FI and the respective blockchain networks you interact with.
              </p>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Security</h2>
              <p className="text-gray-400 leading-relaxed">
                Since we never hold your funds and never see your private keys, there is no “user database” for hackers to steal from us. You are the sole guardian of your assets.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}