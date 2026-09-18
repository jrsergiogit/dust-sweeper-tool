import type { Metadata } from "next";
import "./globals.css";
import CleanUrl from "./CleanUrl";
import Header from "./components/Header";
import Script from "next/script"; // Importante para as tags do Google

export const metadata: Metadata = {
  metadataBase: new URL("https://app.dustsweepertool.com"),
  
  alternates: {
    canonical: 'https://app.dustsweepertool.com',
  },

  title: "Dust Sweeper Tool | Web3 Wallet Security & Recovery Toolkit",
  description: "Find wallet dust, scan token contracts, inspect wallet data, swap tokens, and bridge assets.",
  keywords: ["crypto dust", "wallet cleaner", "scam scanner", "forgotten funds", "web3 tool", "wallet security"],
  
  openGraph: {
    title: "Dust Sweeper Tool | Web3 Toolkit",
    description: "Recover forgotten funds and scan your wallet for security risks.",
    url: "https://app.dustsweepertool.com",
    siteName: "DustSweeperTool",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.ico?v=4" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Tag (gtag.js) - Global */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-475613910"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-475613910');
          `}
        </Script>

      </head>
      
      <body className="antialiased bg-[#0B0C10] text-white min-h-screen flex flex-col font-sans">
        {/* Só roda o CleanUrl em produção */}
        {!isDev && <CleanUrl />}
        
        <Header />

        <main className="flex-grow">
          {children}
        </main>

        <footer className="w-full border-t border-white/5 bg-[#030303] py-8 flex flex-col items-center gap-4">
          <p className="text-[9px] text-gray-700 uppercase tracking-[0.4em] text-center">
            © 2026 Dust Sweeper Protocol • Powered by LI.FI & Alchemy
          </p>
        </footer>
      </body>
    </html>
  );
}