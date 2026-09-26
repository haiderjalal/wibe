import type { Metadata, Viewport } from "next";
import { Anybody, Figtree, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";

import "./globals.css";

// Variable width axis powers the stretching display type.
const anybody = Anybody({ subsets: ["latin"], axes: ["wdth"], variable: "--font-anybody", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
// Editorial italic, used sparingly for accent words.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-instrument", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Wibe — Find your people, places and plans", template: "%s · Wibe" },
  description:
    "Wibe recommends places, events and hosted experiences in Islamabad, and tells you why each one made your list.",
  applicationName: "Wibe",
  appleWebApp: { capable: true, title: "Wibe", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "Wibe",
    title: "Wibe — Find your people, places and plans",
    description: "Personal, explainable picks for what to do in Islamabad tonight.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0d2a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anybody.variable} ${figtree.variable} ${plexMono.variable} ${serif.variable} h-full`}>
      <body className="min-h-full">
        {children}
        <div aria-hidden className="grain" />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
