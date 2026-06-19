/**
 * Normalized tracking event vocabulary and provider contract.
 *
 * This file is the shared language between the app and every concrete adapter
 * (Meta Pixel, TikTok, GA4, …). No SDK-specific types live here.
 */

export const TRACKING_EVENTS = {
  LAUNCH: "Launch",
  SUBMIT_ZIP: "Submit zip code",
  SUBMIT_EMAIL: "Submit email",
} as const;

// ─── Event payloads ─────────────────────────────────────────────────────────

export type LaunchPayload = { pageVariant?: string };

export type SubmitZipPayload = { zip: string; served: boolean };

export type SubmitEmailPayload = {
  email: string;
  zip: string | null;
  path: "served" | "unserved" | "skipped";
};

// ─── Discriminated union of all trackable events ──────────────────────────

export type TrackingEvent =
  | { name: typeof TRACKING_EVENTS.LAUNCH; payload?: LaunchPayload }
  | { name: typeof TRACKING_EVENTS.SUBMIT_ZIP; payload: SubmitZipPayload }
  | { name: typeof TRACKING_EVENTS.SUBMIT_EMAIL; payload: SubmitEmailPayload };

// ─── Provider interface ───────────────────────────────────────────────────

/** Contract every concrete tracking adapter must satisfy. */
export interface TrackingProvider {
  readonly name: string;
  /** Load/initialize the underlying SDK. Must be idempotent and SSR-safe. */
  init(): void;
  /** Dispatch a normalized event to the underlying SDK. */
  track(event: TrackingEvent): void;
}
