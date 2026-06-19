import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./redesign.css";

export const metadata: Metadata = {
  title: "Remix — Redesign Lab",
  description: "Internal redesign comparison lab. Not the live site.",
  robots: { index: false, follow: false },
};

/**
 * Poster-weight display face, scoped to the redesign lab only (never loaded by
 * the live `/` or `/genie`). Themes opt in via `--font-poster`; today the
 * "pocket-pour" cut uses it for its heavy uppercase headlines.
 */
const poster = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poster",
});

export default function RedesignLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={poster.variable}>{children}</div>;
}
