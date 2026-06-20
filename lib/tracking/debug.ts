/**
 * Console debug adapter — the fastest inner loop for validating the taxonomy.
 *
 * In development it prints every dispatched event + its properties to the
 * browser console, so you can confirm the right events fire with the right
 * payloads **before (and without) any PostHog key set**. It is a complete no-op
 * in production, and registered only in dev by `TrackingProvider`.
 */

import type { TrackingEvent, TrackingProvider } from "./types";

const isDev = process.env.NODE_ENV !== "production";

/** Creates a dev-only `TrackingProvider` that logs events to the console. */
export function createDebugProvider(): TrackingProvider {
  return {
    name: "debug",

    init(): void {
      if (typeof window === "undefined" || !isDev) return;
      console.info(
        "%c[tracking] debug provider active — every event logs below",
        "color:#7b61ff;font-weight:700",
      );
    },

    track(event: TrackingEvent): void {
      if (typeof window === "undefined" || !isDev) return;
      console.debug(
        `%c▸ ${event.name}`,
        "color:#7b61ff;font-weight:700",
        event.payload ?? {},
      );
    },
  };
}
