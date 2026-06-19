/**
 * Meta (Facebook) Web Pixel adapter.
 *
 * Faithfully reproduces the official fbevents.js loader snippet, with these
 * additions:
 *   - SSR-safe: every code path guards `typeof window === "undefined"`.
 *   - Idempotent init: skips injection if `window.fbq` already exists.
 *   - Advanced Matching on Submit email: passes the hashed email to Meta via
 *     a re-init call so it can be matched against ad audiences.
 *
 * No Meta-specific types or symbols leak out of this file; the rest of the
 * app only knows about the `TrackingProvider` interface from `types.ts`.
 */

import type { TrackingEvent, TrackingProvider } from "./types";
import { TRACKING_EVENTS } from "./types";

// ─── Global fbq type shim ────────────────────────────────────────────────────
// fbq is dynamically injected by the pixel snippet; we need a minimal ambient
// declaration so TypeScript is happy. A single `any` in the variadic rest
// parameter is idiomatic for this kind of bridge to an untyped third-party SDK.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: unknown;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Creates a `TrackingProvider` that wraps the Meta Web Pixel.
 *
 * @param pixelId - The numeric Meta Pixel ID (e.g. `"458468750504303"`).
 */
export function createMetaPixelProvider(pixelId: string): TrackingProvider {
  return {
    name: "meta-pixel",

    /**
     * Bootstraps the fbq loader exactly as the official Meta snippet does,
     * then fires the mandatory `init` + `PageView` calls.
     *
     * Safe to call multiple times — exits immediately if `window.fbq` is
     * already present (either from a prior call or an external script).
     */
    init(): void {
      // Guard 1: never run on the server.
      if (typeof window === "undefined") return;

      // Guard 2: idempotent — fbq already bootstrapped.
      if (window.fbq) return;

      // ── Reproduce the official Meta Pixel inline loader snippet ──────────
      // Original:
      //   !function(f,b,e,v,n,t,s){
      //     if(f.fbq)return;
      //     n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      //     if(!f._fbq)f._fbq=n;
      //     n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      //     t=b.createElement(e);t.async=!0;t.src=v;
      //     s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
      //   }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

      type FbqStub = ((...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void;
        queue: unknown[][];
        push: FbqStub;
        loaded: boolean;
        version: string;
      };

      const n: FbqStub = function (...args: unknown[]) {
        if (n.callMethod) {
          n.callMethod(...args);
        } else {
          n.queue.push(args);
        }
      } as FbqStub;

      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      // Assign to window before the async script loads so any queued calls
      // are captured in the stub.
      window.fbq = n;
      if (!window._fbq) window._fbq = n;

      // Async-load the fbevents.js SDK — same approach as the snippet.
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode!.insertBefore(script, firstScript);
      // ─────────────────────────────────────────────────────────────────────

      // Mandatory calls that must follow immediately after the loader.
      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
    },

    /**
     * Maps a normalized `TrackingEvent` to the appropriate Meta Pixel call(s).
     *
     * | Normalized event  | fbq call(s)                                                  |
     * |-------------------|--------------------------------------------------------------|
     * | Launch            | `trackCustom('Launch', { page_variant })`                    |
     * | Submit zip code   | `trackCustom('Submit zip code', { zip, served })`            |
     * | Submit email      | `init(pixelId, { em })` (Advanced Matching)                  |
     * |                   | + `trackCustom('Submit email', { zip, path })`               |
     * |                   | + `track('Lead', { zip })` (standard event for optimization) |
     */
    track(event: TrackingEvent): void {
      // Guard: never run on server; bail if fbq hasn't been injected yet.
      if (typeof window === "undefined" || !window.fbq) return;

      const fbq = window.fbq;

      switch (event.name) {
        case TRACKING_EVENTS.LAUNCH: {
          fbq("trackCustom", "Launch", {
            page_variant: event.payload?.pageVariant,
          });
          break;
        }

        case TRACKING_EVENTS.SUBMIT_ZIP: {
          fbq("trackCustom", "Submit zip code", {
            zip: event.payload.zip,
            served: event.payload.served,
          });
          break;
        }

        case TRACKING_EVENTS.SUBMIT_EMAIL: {
          const { email, zip, path } = event.payload;

          // Advanced Matching: Meta hashes the email client-side.
          // Normalize per Meta's requirements: lowercase + trimmed.
          fbq("init", pixelId, { em: email.toLowerCase().trim() });

          // Custom event for our funnel reporting.
          fbq("trackCustom", "Submit email", { zip, path });

          // Standard Lead event for ad set optimization signals.
          fbq("track", "Lead", { zip });
          break;
        }
      }
    },
  };
}
