import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meritspe | Buy & Sell Unlisted Shares & Pre-IPO Stocks in India",
  description:
    "India's most trusted platform to invest in unlisted shares and pre-IPO stocks. Buy and sell shares of Groww, OYO, CSK, HDFC Securities and 180+ companies with T+1 settlement.",
  keywords: [
    "unlisted shares",
    "pre-IPO stocks",
    "unlisted shares India",
    "pre IPO investment",
    "buy unlisted shares",
    "Groww unlisted shares",
    "OYO pre-IPO",
  ],
  openGraph: {
    title: "Meritspe | Buy & Sell Unlisted Shares & Pre-IPO Stocks in India",
    description:
      "India's most trusted platform to invest in unlisted shares and pre-IPO stocks. T+1 settlement, 180+ companies.",
    url: "https://meritspe.com",
    siteName: "Meritspe",
    images: [
      {
        url: "https://meritspe.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Meritspe - Unlisted Shares & Pre-IPO Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meritspe | Buy & Sell Unlisted Shares & Pre-IPO Stocks",
    description:
      "India's most trusted platform for unlisted shares and pre-IPO investments.",
    images: ["https://meritspe.com/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://meritspe.com" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Meritspe",
  url: "https://meritspe.com",
  description:
    "India's most trusted platform for unlisted shares and pre-IPO investments",
  address: { "@type": "PostalAddress", addressCountry: "IN" },
  offers: {
    "@type": "Offer",
    description: "Buy and sell unlisted shares and pre-IPO stocks in India",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-center bg-cover"
          style={{
            backgroundImage: "url('/bg-collage.png')",
            opacity: 0.3,
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
