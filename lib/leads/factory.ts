import type { LeadStore } from "./store";
import { LocalStore } from "./local";
import { KlaviyoStore } from "./klaviyo";
import { AirtableStore } from "./airtable";
import { MultiStore } from "./multi";

let instance: LeadStore | null = null;

function build(spec: string): LeadStore {
  // spec examples: "local", "klaviyo", "airtable", "klaviyo+airtable"
  const parts = spec
    .split(/[+,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const stores: LeadStore[] = [];
  // LocalStore is ALWAYS included as the durable local audit copy, and is the
  // primary (source-of-truth) so the lead is never lost even if a remote fails.
  stores.push(new LocalStore());

  for (const p of parts) {
    if (p === "local") continue; // already added
    if (p === "klaviyo") stores.push(new KlaviyoStore());
    else if (p === "airtable") stores.push(new AirtableStore());
    else console.warn(`[leads] unknown LEAD_BACKEND adapter "${p}" — ignored`);
  }

  return stores.length === 1 ? stores[0] : new MultiStore(stores);
}

/** Returns the configured lead store (singleton). LEAD_BACKEND defaults to "local". */
export function getLeadStore(): LeadStore {
  if (instance) return instance;
  const spec = process.env.LEAD_BACKEND || "local";
  instance = build(spec);
  return instance;
}

/** For tests: build a fresh store with an explicit spec, bypassing the singleton. */
export function createLeadStore(spec: string): LeadStore {
  return build(spec);
}

/** For tests. */
export function __resetLeadStore() {
  instance = null;
}
