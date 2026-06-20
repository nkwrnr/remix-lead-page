/**
 * PostHog adapter — product analytics for the live lead pages.
 *
 * Mirrors `meta-pixel.ts`: no PostHog symbols leak past this file; the rest of
 * the app only speaks the `TrackingProvider` interface from `types.ts`.
 *
 * Lean by construction (the page must not slow down):
 *   - autocapture OFF, session replay OFF, surveys OFF → the heavy posthog-js
 *     chunks (`recorder.js`, surveys) are never fetched.
 *   - `person_profiles: 'identified_only'` → anonymous traffic is cheap; a person
 *     is only created on email submit.
 *   - ingestion is reverse-proxied through same-origin `/ingest` (see
 *     `next.config.ts`) → ad-blocker resilient + no extra CSP domains.
 *
 * Manual events only: we map our normalized `TrackingEvent`s to `posthog.capture`
 * with snake_case properties (the growth taxonomy — see docs/ANALYTICS.md).
 */

import posthog from "posthog-js";
import type { TrackingEvent, TrackingProvider } from "./types";
import { TRACKING_EVENTS } from "./types";

const isDev = process.env.NODE_ENV !== "production";

/** Drops `undefined`/`null` props so PostHog event schemas stay clean. */
function clean(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

/**
 * Creates a `TrackingProvider` backed by PostHog.
 *
 * @param key  - PostHog project API key (`NEXT_PUBLIC_POSTHOG_KEY`).
 * @param host - PostHog UI host for the region (`ui_host`); ingestion is proxied.
 */
export function createPostHogProvider(key: string, host: string): TrackingProvider {
  return {
    name: "posthog",

    /** Idempotent, SSR-safe init with the lean config described above. */
    init(): void {
      if (typeof window === "undefined") return;
      // posthog-js sets __loaded after a successful init; guard re-entry.
      if (posthog.__loaded) return;

      posthog.init(key, {
        api_host: "/ingest", // same-origin reverse proxy → ad-blocker resilient
        ui_host: host,
        defaults: "2025-05-24",
        autocapture: false, // manual taxonomy only — no DOM scraping, no PII leak
        capture_pageview: false, // fired manually on Launch (so page_variant rides it)
        capture_pageleave: true, // scroll depth + bounce, paired to the pageview
        disable_session_recording: true,
        disable_surveys: true,
        person_profiles: "identified_only",
      });

      if (isDev) posthog.debug(); // log each capture's network delivery in dev
    },

    /** Maps a normalized event → `posthog.capture` (+ `identify` on email). */
    track(event: TrackingEvent): void {
      if (typeof window === "undefined" || !posthog.__loaded) return;

      switch (event.name) {
        case TRACKING_EVENTS.LAUNCH: {
          // Register page_variant as a super property so EVERY event (incl. the
          // pageview we fire next) is sliceable by variant.
          if (event.payload?.pageVariant) {
            posthog.register({ page_variant: event.payload.pageVariant });
          }
          posthog.capture("$pageview");
          break;
        }

        case TRACKING_EVENTS.SUBMIT_ZIP: {
          posthog.capture(
            "zip_submitted",
            clean({
              zip: event.payload.zip,
              served: event.payload.served,
              store_count: event.payload.storeCount,
              matched_city: event.payload.city,
              matched_state: event.payload.state,
            }),
          );
          break;
        }

        case TRACKING_EVENTS.ZIP_SUBMIT_FAILED: {
          posthog.capture("zip_submit_failed", {
            reason: event.payload.reason,
            zip_attempted: event.payload.zipAttempted,
          });
          break;
        }

        case TRACKING_EVENTS.SUBMIT_EMAIL: {
          const { email, zip, path, source, served, matchedStore, productInterest } =
            event.payload;
          // Tie the anonymous person to the email (auto-merges history into the
          // identified person — keeps the zip→email funnel intact).
          posthog.identify(email, clean({ email }));
          posthog.capture(
            "email_submitted",
            clean({
              path,
              served,
              source,
              zip,
              matched_store: matchedStore,
              product_interest: productInterest,
            }),
          );
          break;
        }

        case TRACKING_EVENTS.EMAIL_SUBMIT_FAILED: {
          posthog.capture(
            "email_submit_failed",
            clean({
              reason: event.payload.reason,
              email: event.payload.email,
              path: event.payload.path,
              source: event.payload.source,
              zip: event.payload.zip,
            }),
          );
          break;
        }

        case TRACKING_EVENTS.CTA_CLICK: {
          posthog.capture(
            "cta_clicked",
            clean({ cta: event.payload.cta, section: event.payload.section }),
          );
          break;
        }

        case TRACKING_EVENTS.SECTION_VIEW: {
          posthog.capture(
            "section_viewed",
            clean({
              section: event.payload.section,
              index: event.payload.index,
              seconds_since_load: event.payload.secondsSinceLoad,
            }),
          );
          break;
        }

        case TRACKING_EVENTS.MODAL_OPEN: {
          posthog.capture("modal_opened", { source: event.payload.source });
          break;
        }

        case TRACKING_EVENTS.MODAL_CLOSE: {
          posthog.capture("modal_closed", { source: event.payload.source });
          break;
        }

        case TRACKING_EVENTS.FAQ_OPEN: {
          posthog.capture(
            "faq_opened",
            clean({ question: event.payload.question, index: event.payload.index }),
          );
          break;
        }
      }
    },
  };
}
