import type { LeadStore } from "./store";
import { LocalStore } from "./local";
import { SupabaseStore } from "./supabase";
import { KlaviyoStore } from "./klaviyo";
import { AirtableStore } from "./airtable";
import { MultiStore } from "./multi";

let instance: LeadStore | null = null;

function makeStore(part: string): LeadStore | null {
  switch (part) {
    case "local":
      return new LocalStore();
    case "supabase":
      return new SupabaseStore();
    case "klaviyo":
      return new KlaviyoStore();
    case "airtable":
      return new AirtableStore();
    default:
      console.warn(`[leads] unknown LEAD_BACKEND adapter "${part}" — ignored`);
      return null;
  }
}

function build(spec: string): LeadStore {
  // spec examples: "local", "supabase", "supabase+klaviyo", "klaviyo+airtable"
  // ORDER MATTERS: the FIRST adapter is the durable primary (its write must
  // succeed). LocalStore is NOT auto-included — it is a Node-only SQLite store
  // that cannot write on a serverless (read-only) filesystem, so it must be
  // opted into explicitly (dev/local only).
  const stores = spec
    .split(/[+,]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map(makeStore)
    .filter((s): s is LeadStore => s !== null);

  if (stores.length === 0) {
    // Misconfigured spec (e.g. all-unknown) — fall back to local so dev never
    // silently breaks. In production this is a signal to fix LEAD_BACKEND.
    console.warn(`[leads] LEAD_BACKEND "${spec}" produced no usable adapters — falling back to local.`);
    return new LocalStore();
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
