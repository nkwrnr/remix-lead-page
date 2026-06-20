/**
 * Tracking configuration helpers — read from environment variables.
 *
 * All values are safe to call on the server (they only read `process.env`).
 */

/** Hard-coded fallback so the live Chrome Drop page works without a .env file. */
const META_PIXEL_FALLBACK = "458468750504303";

/**
 * Returns the Meta Pixel ID to use.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_META_PIXEL_ID` env var (if non-empty)
 *   2. Built-in fallback `"458468750504303"`
 *   3. `null` if the env var is explicitly set to an empty string
 *
 * @returns The pixel ID string, or `null` to disable the Meta provider.
 */
export function getMetaPixelId(): string | null {
  const envVal = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Explicitly set to empty → caller wants no Meta pixel.
  if (envVal === "") return null;

  // Non-empty env value takes precedence.
  if (envVal !== undefined) return envVal;

  // Not set at all → use the baked-in ID.
  return META_PIXEL_FALLBACK;
}

/**
 * Returns `true` unless `NEXT_PUBLIC_TRACKING_ENABLED` is explicitly `"false"`.
 *
 * Set `NEXT_PUBLIC_TRACKING_ENABLED=false` in `.env.local` to suppress all
 * client-side tracking during local development.
 */
export function isTrackingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TRACKING_ENABLED !== "false";
}

/** Default PostHog Cloud ingestion host (US region). EU users override via env. */
const POSTHOG_HOST_FALLBACK = "https://us.i.posthog.com";

/**
 * Returns the PostHog config, or `null` when no project key is set (so the
 * provider is simply not registered — e.g. in dev before you create a project,
 * where the console debug provider still shows every event).
 *
 * - `key`  — `NEXT_PUBLIC_POSTHOG_KEY` (point at a *dev* project locally).
 * - `host` — `NEXT_PUBLIC_POSTHOG_HOST` for the PostHog UI/region; ingestion is
 *            reverse-proxied through `/ingest` (see `next.config.ts`), so this is
 *            only used as `ui_host`. Defaults to the US cloud.
 */
export function getPostHogConfig(): { key: string; host: string } | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || POSTHOG_HOST_FALLBACK;
  return { key, host };
}
