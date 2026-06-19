import { SERVED_ZIPS_URL, ZIP_REGEX } from "./constants";
import type { ServedZips, ZipResult } from "./types";

let cache: ServedZips | null = null;
let inflight: Promise<ServedZips> | null = null;

/** Fetch the bundled served-zips dataset once and memoize it. */
export async function fetchServedZips(): Promise<ServedZips> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch(SERVED_ZIPS_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`served-zips fetch failed: ${r.status}`);
      return r.json() as Promise<ServedZips>;
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    });
  return inflight;
}

/** Normalize arbitrary user input to a 5-digit zip (strips zip+4, spaces, dashes). */
export function normalizeZip(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 5);
  return digits;
}

/** Pure lookup against an already-loaded dataset. */
export function lookupZip(raw: string, data: ServedZips): ZipResult {
  const zip = normalizeZip(raw);
  if (!ZIP_REGEX.test(zip) || /^0{5}$/.test(zip)) return { status: "invalid" };
  const stores = data[zip];
  if (stores && stores.length > 0) return { status: "served", zip, stores };
  return { status: "unserved", zip };
}

/** Convenience: fetch (if needed) + lookup. */
export async function findStores(raw: string): Promise<ZipResult> {
  const zip = normalizeZip(raw);
  if (!ZIP_REGEX.test(zip)) return { status: "invalid" };
  const data = await fetchServedZips();
  return lookupZip(raw, data);
}

/** For tests: reset the module cache. */
export function __resetZipCache() {
  cache = null;
  inflight = null;
}
