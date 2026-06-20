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
  // Growth taxonomy (PostHog). Few event names, detail in properties — see
  // docs/ANALYTICS.md. Meta Pixel ignores these (its switch has no default).
  ZIP_SUBMIT_FAILED: "zip_submit_failed",
  EMAIL_SUBMIT_FAILED: "email_submit_failed",
  CTA_CLICK: "cta_clicked",
  SECTION_VIEW: "section_viewed",
  MODAL_OPEN: "modal_opened",
  MODAL_CLOSE: "modal_closed",
  FAQ_OPEN: "faq_opened",
} as const;

// ─── Shared vocab (typed for editor autocomplete; analysts read these names) ──

/** Stable CTA ids — adding a button later = one new value here, no new event. */
export type Cta =
  | "summon_zip"
  | "skip_browsing"
  | "find_near_me"
  | "buy_it"
  | "sticky_drop"
  | "final_drop_zip"
  | "maps_open"
  | "fun_facts_toggle";

/** Page sections, top→bottom — used for scroll-depth + click attribution. */
export type Section =
  | "hero"
  | "zip_finder"
  | "why_switch"
  | "comparison"
  | "inside"
  | "flavors"
  | "reviews"
  | "serve"
  | "faq"
  | "final_cta";

export type FunnelPath = "served" | "unserved" | "skipped";

/** Where an email capture originated. */
export type EmailSource = "inline" | "modal";

/** Which surface opened the next-drop modal. */
export type ModalSource = "mojito" | "paloma" | "sticky";

// ─── Event payloads ─────────────────────────────────────────────────────────

export type LaunchPayload = { pageVariant?: string };

export type SubmitZipPayload = {
  zip: string;
  served: boolean;
  /** Number of matched stores (served only). */
  storeCount?: number;
  /** Matched store city/state for geo breakdowns (served only). */
  city?: string | null;
  state?: string | null;
};

export type ZipSubmitFailedPayload = {
  reason: "invalid_format" | "empty";
  /** Raw value the visitor typed (so we can spot confusing inputs). */
  zipAttempted: string;
};

export type SubmitEmailPayload = {
  email: string;
  zip: string | null;
  path: FunnelPath;
  /** Inline funnel form vs. the next-drop modal. */
  source?: EmailSource;
  served?: boolean;
  matchedStore?: string | null;
  productInterest?: string;
};

export type EmailSubmitFailedPayload = {
  reason: "validation" | "network" | "rate_limited" | "server_error";
  /** The attempted address — first-party, lets us recover the lost lead. */
  email: string;
  path: FunnelPath;
  source: EmailSource;
  zip: string | null;
};

export type CtaClickPayload = { cta: Cta; section?: Section };

export type SectionViewPayload = {
  section: Section;
  /** 0-based order on the page. */
  index?: number;
  /** Seconds between page load and the section entering the viewport. */
  secondsSinceLoad?: number;
};

export type ModalPayload = { source: ModalSource };

export type FaqOpenPayload = { question: string; index?: number };

// ─── Discriminated union of all trackable events ──────────────────────────

export type TrackingEvent =
  | { name: typeof TRACKING_EVENTS.LAUNCH; payload?: LaunchPayload }
  | { name: typeof TRACKING_EVENTS.SUBMIT_ZIP; payload: SubmitZipPayload }
  | { name: typeof TRACKING_EVENTS.SUBMIT_EMAIL; payload: SubmitEmailPayload }
  | { name: typeof TRACKING_EVENTS.ZIP_SUBMIT_FAILED; payload: ZipSubmitFailedPayload }
  | { name: typeof TRACKING_EVENTS.EMAIL_SUBMIT_FAILED; payload: EmailSubmitFailedPayload }
  | { name: typeof TRACKING_EVENTS.CTA_CLICK; payload: CtaClickPayload }
  | { name: typeof TRACKING_EVENTS.SECTION_VIEW; payload: SectionViewPayload }
  | { name: typeof TRACKING_EVENTS.MODAL_OPEN; payload: ModalPayload }
  | { name: typeof TRACKING_EVENTS.MODAL_CLOSE; payload: ModalPayload }
  | { name: typeof TRACKING_EVENTS.FAQ_OPEN; payload: FaqOpenPayload };

// ─── Provider interface ───────────────────────────────────────────────────

/** Contract every concrete tracking adapter must satisfy. */
export interface TrackingProvider {
  readonly name: string;
  /** Load/initialize the underlying SDK. Must be idempotent and SSR-safe. */
  init(): void;
  /** Dispatch a normalized event to the underlying SDK. */
  track(event: TrackingEvent): void;
}
