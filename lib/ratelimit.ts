/**
 * Rate limiter with two adapters:
 *  - In-memory sliding window (default — zero deps, perfect for local dev / single instance)
 *  - Upstash Redis (used automatically when UPSTASH_REDIS_REST_URL + _TOKEN are set)
 *
 * The Upstash client is imported lazily so the package is optional at install time.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5;

const memory = new Map<string, number[]>();

function memoryLimit(key: string): { success: boolean } {
  const now = Date.now();
  const hits = (memory.get(key) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memory.set(key, hits);
  // opportunistic cleanup
  if (memory.size > 5000) {
    for (const [k, v] of memory) {
      if (v.every((t) => now - t >= WINDOW_MS)) memory.delete(k);
    }
  }
  return { success: hits.length <= MAX_HITS };
}

let upstash: { limit: (key: string) => Promise<{ success: boolean }> } | null =
  null;
let upstashTried = false;

async function getUpstash() {
  if (upstashTried) return upstash;
  upstashTried = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);
    const rl = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(MAX_HITS, "10 m"),
      prefix: "remix-subscribe",
    });
    upstash = { limit: (key: string) => rl.limit(key) };
  } catch {
    // package not installed — fall back to memory limiter silently
    upstash = null;
  }
  return upstash;
}

export async function rateLimit(key: string): Promise<{ success: boolean }> {
  const u = await getUpstash();
  if (u) return u.limit(key);
  return memoryLimit(key);
}

/** For tests. */
export function __resetRateLimit() {
  memory.clear();
}
