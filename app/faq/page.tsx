import type { Metadata } from "next";
import Script from "next/script"; // Importe o Script do Next

export const metadata: Metadata = {
  alternates: { canonical: "https://app.dustsweepertool.com/faq" },
  title: "FAQ | Dust Sweeper Tool - Web3 Wallet Toolkit",
  description: "Common questions about sweeping crypto dust, scanning for scams, and using wallet data.",
};

const faqs = [
  {
    question: "Is it safe to connect my wallet?",
    answer: "Yes. Dust Sweeper Tool is 100% non-custodial: we never have access to your private keys or seed phrase, and we never hold your funds at any point. Connecting your wallet only lets us read public on-chain data (via Alchemy) to show you your balances. Every swap or consolidation is a transaction you individually review and sign in your own wallet — we cannot move your assets without your explicit approval on each step."
  },
  {
    question: "What data do you access, and where does it come from?",
    answer: "We use Alchemy to read public blockchain data (token balances and related token metadata/prices) across the 7 networks currently queried by Dust Finder. Actual swaps, bridges, and cross-chain recovery routing are executed through the LI.FI Protocol across its supported multichain ecosystem, currently covering 60+ blockchains. Neither service gives us custody of your funds or access to your keys."
  },
  {
    question: "How does the 'Forgotten Funds' finder work?",
    answer: "Dust Finder currently scans 7 networks through Alchemy to identify small balances (dust) and forgotten tokens tied to your address. For assets that are found, Dust Sweeper can use LI.FI for supported swap, bridge, and cross-chain recovery routes. You choose which balances to move and approve each transaction yourself."
  },
  {
    question: "What does the Scam Contract Scanner do, and what are its limits?",
    answer: "It analyzes the code of any smart contract you've interacted with or plan to, flagging high-risk patterns like honeypots, hidden mint functions, or excessive sell taxes. This is an automated heuristic check, not a guarantee — it can produce false positives or miss novel scam patterns. Always treat a 'clean' result as one input among others, not a full audit."
  },
  {
    question: "Why should I use Dust Sweeper instead of a regular Exchange?",
    answer: "Standard exchanges have high deposit minimums and don't work across multiple chains. We are optimized for 'micro-recovery' — rescuing amounts that would otherwise be stuck or forgotten across networks like Ethereum, Base, Polygon, and Arbitrum."
  },
  {
    question: "What are the service fees, and when are they charged?",
    answer: "Dust recovery and consolidation use a 1% service fee. The transaction flow available from the Scam Contract Scanner also uses a 1% fee when applicable. The standard Swap widget currently uses a 0% service fee, while the Bridge widget uses a 0.5% service fee. Any applicable fee is included in the route/transaction you review and approve in your wallet."
  },
  {
    question: "Can a transaction be reversed once I approve it?",
    answer: "No — like any blockchain transaction, a swap or consolidation is final once confirmed on-chain. We show you the expected route and amount before you sign, so review it carefully in your wallet before approving."
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          {/* Título com a fonte preta e tracking tigh que usamos no resto do site */}
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Frequently Asked Questions</h1>
          <p className="text-gray-400">Everything you need to know about our Web3 Toolkit.</p>
        </header>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details 
              key={index} 
              className="group border border-white/5 bg-white/5 rounded-2xl p-6 transition-all hover:border-purple-500/50"
            >
              <summary className="flex cursor-pointer items-center justify-between font-bold text-lg list-none">
                {faq.question}
                {/* Ícone trocado para Roxo para combinar com o tema */}
                <span className="text-purple-500 group-open:rotate-180 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed font-medium">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* JSON-LD otimizado para o Google */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
          })
        }}
      />
    </main>
  );
}