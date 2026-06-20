/**
 * Tests for the PostHog adapter (lib/tracking/posthog.ts).
 *
 * posthog-js is mocked so we can assert the exact event→capture mapping and the
 * lean init config without a real SDK or network. As in index.test.ts, the
 * vitest env is node, so we stub `globalThis.window` to clear the browser guard.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPostHogProvider } from "./posthog";
import { TRACKING_EVENTS } from "./types";

// Hoisted so the vi.mock factory can reference it.
const mockPH = vi.hoisted(() => ({
  __loaded: false,
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  register: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: mockPH }));

function enableBrowserEnv(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = globalThis;
}
function disableBrowserEnv(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).window;
}

const HOST = "https://us.i.posthog.com";

beforeEach(() => {
  enableBrowserEnv();
  mockPH.__loaded = false;
  vi.clearAllMocks();
});

afterEach(() => {
  disableBrowserEnv();
});

describe("createPostHogProvider.init", () => {
  it("inits with the lean config (autocapture + replay + surveys OFF)", () => {
    createPostHogProvider("phc_test", HOST).init();

    expect(mockPH.init).toHaveBeenCalledTimes(1);
    const [key, config] = mockPH.init.mock.calls[0];
    expect(key).toBe("phc_test");
    expect(config).toMatchObject({
      api_host: "/ingest",
      ui_host: HOST,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: "identified_only",
    });
  });

  it("is idempotent — skips re-init once posthog is loaded", () => {
    mockPH.__loaded = true;
    createPostHogProvider("phc_test", HOST).init();
    expect(mockPH.init).not.toHaveBeenCalled();
  });
});

describe("createPostHogProvider.track", () => {
  const provider = () => createPostHogProvider("phc_test", HOST);

  beforeEach(() => {
    mockPH.__loaded = true; // simulate a loaded SDK
  });

  it("Launch → registers page_variant super property + fires $pageview", () => {
    provider().track({
      name: TRACKING_EVENTS.LAUNCH,
      payload: { pageVariant: "chrome_drop_live" },
    });
    expect(mockPH.register).toHaveBeenCalledWith({ page_variant: "chrome_drop_live" });
    expect(mockPH.capture).toHaveBeenCalledWith("$pageview");
  });

  it("Submit zip code → zip_submitted with snake_case geo props", () => {
    provider().track({
      name: TRACKING_EVENTS.SUBMIT_ZIP,
      payload: { zip: "72601", served: true, storeCount: 2, city: "Harrison", state: "AR" },
    });
    expect(mockPH.capture).toHaveBeenCalledWith("zip_submitted", {
      zip: "72601",
      served: true,
      store_count: 2,
      matched_city: "Harrison",
      matched_state: "AR",
    });
  });

  it("zip_submit_failed → carries reason + attempted value", () => {
    provider().track({
      name: TRACKING_EVENTS.ZIP_SUBMIT_FAILED,
      payload: { reason: "invalid_format", zipAttempted: "abc" },
    });
    expect(mockPH.capture).toHaveBeenCalledWith("zip_submit_failed", {
      reason: "invalid_format",
      zip_attempted: "abc",
    });
  });

  it("Submit email → identifies by email then captures email_submitted", () => {
    provider().track({
      name: TRACKING_EVENTS.SUBMIT_EMAIL,
      payload: {
        email: "ada@example.com",
        zip: "72601",
        path: "served",
        source: "inline",
        served: true,
        matchedStore: "Walmart #1, Harrison, AR",
        productInterest: "both",
      },
    });
    expect(mockPH.identify).toHaveBeenCalledWith("ada@example.com", { email: "ada@example.com" });
    expect(mockPH.capture).toHaveBeenCalledWith("email_submitted", {
      path: "served",
      served: true,
      source: "inline",
      zip: "72601",
      matched_store: "Walmart #1, Harrison, AR",
      product_interest: "both",
    });
  });

  it("email_submit_failed → carries the attempted email for recovery", () => {
    provider().track({
      name: TRACKING_EVENTS.EMAIL_SUBMIT_FAILED,
      payload: { reason: "rate_limited", email: "lost@lead.com", path: "unserved", source: "modal", zip: null },
    });
    // zip is null → dropped by clean()
    expect(mockPH.capture).toHaveBeenCalledWith("email_submit_failed", {
      reason: "rate_limited",
      email: "lost@lead.com",
      path: "unserved",
      source: "modal",
    });
  });

  it("cta_clicked / section_viewed / modal / faq map through", () => {
    const p = provider();
    p.track({ name: TRACKING_EVENTS.CTA_CLICK, payload: { cta: "buy_it", section: "flavors" } });
    p.track({ name: TRACKING_EVENTS.SECTION_VIEW, payload: { section: "reviews", index: 6, secondsSinceLoad: 12 } });
    p.track({ name: TRACKING_EVENTS.MODAL_OPEN, payload: { source: "mojito" } });
    p.track({ name: TRACKING_EVENTS.FAQ_OPEN, payload: { question: "Is Remix alcoholic?", index: 0 } });

    expect(mockPH.capture).toHaveBeenCalledWith("cta_clicked", { cta: "buy_it", section: "flavors" });
    expect(mockPH.capture).toHaveBeenCalledWith("section_viewed", {
      section: "reviews",
      index: 6,
      seconds_since_load: 12,
    });
    expect(mockPH.capture).toHaveBeenCalledWith("modal_opened", { source: "mojito" });
    expect(mockPH.capture).toHaveBeenCalledWith("faq_opened", { question: "Is Remix alcoholic?", index: 0 });
  });

  it("is a no-op until the SDK is loaded", () => {
    mockPH.__loaded = false;
    provider().track({ name: TRACKING_EVENTS.CTA_CLICK, payload: { cta: "buy_it", section: "flavors" } });
    expect(mockPH.capture).not.toHaveBeenCalled();
  });
});
