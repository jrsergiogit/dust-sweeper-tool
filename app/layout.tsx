import type { Metadata, Viewport } from "next";
import "./globals.css";
import CleanUrl from "./CleanUrl";
import PageAnalytics from "./components/PageAnalytics";
import { ATTRIBUTION_BOOTSTRAP } from "./lib/attribution-bootstrap";
import Header from "./components/Header";
import SiteFooter from "./components/SiteFooter";
import Script from "next/script"; // Importante para as tags do Google

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#060609",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dustsweepertool.com"),
  
  title: "Dust Sweeper Tool: Find Forgotten Crypto & Crypto Dust",
  description: "Free non-custodial wallet scanner that finds small and forgotten token balances on 7 networks, checks contract risk signals and compares swap and bridge routes.",
  applicationName: "Dust Sweeper Tool",
  category: "finance",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },

  openGraph: {
    title: "Dust Sweeper Tool: Find Forgotten Crypto & Crypto Dust",
    description: "Scan your public wallet address for forgotten and small token balances on 7 networks. Non-custodial, no seed phrase.",
    url: "https://dustsweepertool.com",
    siteName: "Dust Sweeper Tool",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Dust Sweeper Tool" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dust Sweeper Tool: Find Forgotten Crypto & Crypto Dust",
    description: "Scan your public wallet address for forgotten and small token balances on 7 networks. Non-custodial, no seed phrase.",
    images: ["/og-image.png"],
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
        <Script id="dust-attribution-bootstrap" strategy="beforeInteractive">{ATTRIBUTION_BOOTSTRAP}</Script>
        {/* Google Tag (gtag.js) - Global */}
        {!isDev && <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-10796225601"
          strategy="afterInteractive"
        />}

        <Script
          id="dust-sweeper-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Dust Sweeper Tool",
              url: "https://dustsweepertool.com",
              description:
                "Non-custodial Web3 wallet toolkit for finding low-value crypto assets, viewing public wallet data, checking token contract risk signals, swapping tokens, and bridging assets.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              isAccessibleForFree: true,
              featureList: [
                "Crypto dust discovery",
                "Public wallet balance scanning",
                "Token contract risk scanning",
                "Token swaps",
                "Cross-chain bridging",
                "Scans Ethereum, BNB Smart Chain, Polygon, Arbitrum, Base, Optimism and Avalanche",
              ],
              provider: {
                "@type": "Organization",
                name: "Dust Sweeper Tool",
                url: "https://dustsweepertool.com",
              },
              sameAs: [
                "https://www.alchemy.com/dapps/dust-sweeper-tool",
                "https://dappradar.com/dapp/dust-sweeper-tool",
              ],
            }),
          }}
        />

        {!isDev && <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-10796225601', { page_location: window.__dsLandingUrl || window.location.href });
          `}
        </Script>}

      </head>
      
      <body className="antialiased bg-[#0B0C10] text-white min-h-screen flex flex-col font-sans">
        {/* Só roda o CleanUrl em produção */}
        <PageAnalytics />
        {!isDev && <CleanUrl />}
        
        <Header />

        <main className="flex-grow">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}