"use client";

/**
 * TrackingProvider — mounts configured tracking adapters and fires the
 * `Launch` event exactly once per page load.
 *
 * Drop this component anywhere in a Client Component tree (e.g. at the top
 * of a landing page layout). It renders nothing to the DOM.
 *
 * React 19 StrictMode invokes effects twice in development. Both `init` and
 * the `launched` ref guard ensure we only initialise providers once and only
 * fire `Launch` once per logical mount, regardless of double-invocation.
 *
 * Example usage (by the funnel agent):
 *   <TrackingProvider pageVariant="redesign_chrome_drop" />
 */

import { useEffect, useRef } from "react";
import {
  getMetaPixelId,
  getPostHogConfig,
  isTrackingEnabled,
} from "@/lib/tracking/config";
import { createMetaPixelProvider } from "@/lib/tracking/meta-pixel";
import { createPostHogProvider } from "@/lib/tracking/posthog";
import { createDebugProvider } from "@/lib/tracking/debug";
import { tracking, type TrackingProvider as Provider } from "@/lib/tracking";

const isDev = process.env.NODE_ENV !== "production";

export interface TrackingProviderProps {
  /** Identifies the page variant in the Launch event (e.g. `"redesign_chrome_drop"`). */
  pageVariant?: string;
}

/**
 * Client component that initialises tracking providers and fires the `Launch`
 * event on mount. Renders nothing (`null`).
 */
export function TrackingProvider({ pageVariant }: TrackingProviderProps): null {
  // Guard against React StrictMode double-invoke: track whether we've already
  // fired Launch so we don't duplicate the event.
  const launched = useRef(false);

  useEffect(() => {
    // Hard kill-switch: respect NEXT_PUBLIC_TRACKING_ENABLED=false.
    if (!isTrackingEnabled()) return;

    // Build the provider list from environment config.
    const providers: Provider[] = [];

    const metaPixelId = getMetaPixelId();
    if (metaPixelId !== null) {
      providers.push(createMetaPixelProvider(metaPixelId));
    }

    const posthogConfig = getPostHogConfig();
    if (posthogConfig !== null) {
      providers.push(createPostHogProvider(posthogConfig.key, posthogConfig.host));
    }

    // Dev-only: log every event to the console (works even with no PostHog key).
    if (isDev) {
      providers.push(createDebugProvider());
    }

    // Register + initialise all providers (idempotent).
    tracking.init(providers);

    // Fire Launch exactly once per logical mount.
    if (!launched.current) {
      launched.current = true;
      tracking.launch({ pageVariant });
    }
  // pageVariant is intentionally excluded from deps: changing the variant
  // prop after mount should not re-fire Launch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
