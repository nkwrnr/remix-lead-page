/**
 * Tracking facade — the single surface the application calls.
 *
 * Architecture:
 *   - Provider-agnostic: no SDK knowledge lives here.
 *   - Singleton: one registry shared across the whole client session.
 *   - SSR-safe: every method is a no-op when `typeof window === "undefined"`.
 *   - Resilient: each provider's `track()` is wrapped in try/catch so a
 *     misbehaving adapter never crashes the funnel.
 *   - Idempotent init: providers are registered + initialised exactly once,
 *     even if `init()` is called multiple times (e.g. React StrictMode).
 *
 * Usage:
 *   import { tracking } from "@/lib/tracking";
 *   tracking.init([createMetaPixelProvider(id)]);
 *   tracking.launch({ pageVariant: "chrome_drop" });
 *   tracking.submitZip({ zip: "90210", served: true });
 *   tracking.submitEmail({ email: "a@b.com", zip: "90210", path: "served" });
 */

import type {
  LaunchPayload,
  SubmitEmailPayload,
  SubmitZipPayload,
  TrackingEvent,
  TrackingProvider,
} from "./types";
import { TRACKING_EVENTS } from "./types";

// ─── Private singleton state ────────────────────────────────────────────────

/** Providers that have been both registered AND initialised. */
const _initialised = new Set<TrackingProvider>();

/** All registered providers (superset of _initialised while init is in-flight). */
let _providers: TrackingProvider[] = [];

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Returns `true` when running in a browser context. */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Dispatches a normalised event to every registered provider.
 * Each provider is wrapped individually so one failure can't affect others.
 */
function dispatch(event: TrackingEvent): void {
  if (!isBrowser()) return;

  for (const provider of _providers) {
    try {
      provider.track(event);
    } catch (err) {
      // Surface to console in development so engineers can debug adapters,
      // but never throw into the caller.
      console.error(`[tracking] provider "${provider.name}" threw:`, err);
    }
  }
}

// ─── Public facade ────────────────────────────────────────────────────────────

export const tracking = {
  /**
   * Registers `providers` and calls `init()` on any that haven't been
   * initialised yet. Safe to call multiple times (e.g. across React
   * StrictMode double-invocations) — already-initialised providers are skipped.
   *
   * No-op on the server.
   */
  init(providers: TrackingProvider[]): void {
    if (!isBrowser()) return;

    for (const provider of providers) {
      // Avoid duplicate entries in the registry.
      if (!_providers.includes(provider)) {
        _providers.push(provider);
      }

      // Initialise once, even if init() is called again later.
      if (!_initialised.has(provider)) {
        _initialised.add(provider);
        provider.init();
      }
    }
  },

  /**
   * Fires the `Launch` event.  Typically called once per page load to signal
   * that a variant has been rendered and tracking is live.
   *
   * No-op on the server.
   */
  launch(payload?: LaunchPayload): void {
    dispatch({ name: TRACKING_EVENTS.LAUNCH, payload });
  },

  /**
   * Fires the `Submit zip code` event after a visitor enters their ZIP.
   *
   * No-op on the server.
   */
  submitZip(payload: SubmitZipPayload): void {
    dispatch({ name: TRACKING_EVENTS.SUBMIT_ZIP, payload });
  },

  /**
   * Fires the `Submit email` event after a visitor submits their email.
   * Concrete adapters (e.g. Meta) use this to pass Advanced Matching data.
   *
   * No-op on the server.
   */
  submitEmail(payload: SubmitEmailPayload): void {
    dispatch({ name: TRACKING_EVENTS.SUBMIT_EMAIL, payload });
  },
} as const;

// ─── Test utilities ──────────────────────────────────────────────────────────

/**
 * Resets all internal singleton state.
 *
 * **Only for use in tests** — do not call this in application code.
 */
export function __resetTrackingForTests(): void {
  _providers = [];
  _initialised.clear();
}

// Re-export types so callers only need one import path.
export type {
  LaunchPayload,
  SubmitEmailPayload,
  SubmitZipPayload,
  TrackingEvent,
  TrackingProvider,
};
export { TRACKING_EVENTS };
