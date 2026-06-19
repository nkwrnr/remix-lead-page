/**
 * Export captured leads from the local SQLite store to CSV.
 * Run: npm run leads:export   (writes data/leads-export.csv)
 *
 * This CSV is both the retailer zip-demand export and the file you'd import into
 * Klaviyo on day one of connecting it.
 */
import { writeFileSync } from "node:fs";
import { LocalStore } from "../lib/leads/local";

const COLUMNS: { key: keyof import("../lib/types").Lead; label: string }[] = [
  { key: "createdAt", label: "Created At" },
  { key: "email", label: "Email" },
  { key: "zip", label: "Zip" },
  { key: "served", label: "Served" },
  { key: "matchedStore", label: "Matched Store" },
  { key: "productInterest", label: "Product Interest" },
  { key: "utmSource", label: "UTM Source" },
  { key: "utmMedium", label: "UTM Medium" },
  { key: "utmCampaign", label: "UTM Campaign" },
  { key: "utmContent", label: "UTM Content" },
  { key: "consent", label: "Consent" },
  { key: "consentVersion", label: "Consent Version" },
  { key: "referrer", label: "Referrer" },
  { key: "pageVariant", label: "Page Variant" },
];

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const out = process.argv[2] || "data/leads-export.csv";
  const leads = await new LocalStore().list();
  const header = COLUMNS.map((c) => c.label).join(",");
  const rows = leads.map((l) => COLUMNS.map((c) => csvCell(l[c.key])).join(","));
  writeFileSync(out, [header, ...rows].join("\n") + "\n");
  console.log(`Exported ${leads.length} leads → ${out}`);
}

main();
