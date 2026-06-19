import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Anton } from "next/font/google";
import "./globals.css";

// Editorial display face — high-contrast serif with optical sizing; italics carry
// the brand personality (italic-accent emphasis is the signature move). Body is Inter.
const display = Fraunces({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

const poster = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poster",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Remix — Find It Near You",
  description:
    "Sold out online, not sold out on you. Big Flavor, Clean Ingredients, Zero Regrets. Drop your zip to find Remix near you, or get first dibs on the next drop.",
  openGraph: {
    title: "Remix — Find It Near You",
    description:
      "Sold out online, not sold out on you. Find Remix near you, or get first dibs on the next drop.",
    images: ["/images/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remix — Find It Near You",
    description: "Find Remix near you, or get first dibs on the next drop.",
    images: ["/images/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e88472",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${poster.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
