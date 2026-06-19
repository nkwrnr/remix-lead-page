/**
 * Tests for the tracking facade (lib/tracking/index.ts).
 *
 * The vitest config uses `environment: "node"`, so `window` is not defined by
 * default. We manually stub `globalThis.window` before each test so the
 * facade's `isBrowser()` guard allows the calls through.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetTrackingForTests,
  tracking,
  TRACKING_EVENTS,
} from "./index";
import type { TrackingEvent, TrackingProvider } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Creates a spy-instrumented fake provider. */
function makeFakeProvider(name = "fake"): TrackingProvider & {
  initCalls: number;
  trackedEvents: TrackingEvent[];
} {
  const initCalls = { count: 0 };
  const trackedEvents: TrackingEvent[] = [];

  return {
    name,
    get initCalls() {
      return initCalls.count;
    },
    trackedEvents,
    init() {
      initCalls.count++;
    },
    track(event: TrackingEvent) {
      trackedEvents.push(event);
    },
  };
}

/** Stub `globalThis.window` so the browser guard passes in the node env. */
function enableBrowserEnv(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).window = globalThis;
}

/** Remove the window stub. */
function disableBrowserEnv(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).window;
}

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  __resetTrackingForTests();
  enableBrowserEnv();
});

afterEach(() => {
  disableBrowserEnv();
  vi.restoreAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("tracking.submitZip", () => {
  it("delivers a Submit zip code event with the correct payload to a registered provider", () => {
    const provider = makeFakeProvider();
    tracking.init([provider]);

    tracking.submitZip({ zip: "90210", served: true });

    expect(provider.trackedEvents).toHaveLength(1);
    expect(provider.trackedEvents[0]).toEqual({
      name: TRACKING_EVENTS.SUBMIT_ZIP,
      payload: { zip: "90210", served: true },
    });
  });
});

describe("tracking.init idempotency", () => {
  it("only calls provider.init() once even when tracking.init() is called twice", () => {
    const provider = makeFakeProvider();

    tracking.init([provider]);
    tracking.init([provider]); // second call — must be a no-op for this provider

    expect(provider.initCalls).toBe(1);
  });

  it("does not duplicate the provider in the registry on repeated init calls", () => {
    const provider = makeFakeProvider();

    tracking.init([provider]);
    tracking.init([provider]);

    // Only one track call should reach the provider.
    tracking.submitZip({ zip: "12345", served: false });
    expect(provider.trackedEvents).toHaveLength(1);
  });
});

describe("error isolation", () => {
  it("does not propagate an error thrown by a provider's track() to the caller", () => {
    const badProvider: TrackingProvider = {
      name: "bad",
      init: vi.fn(),
      track: vi.fn(() => {
        throw new Error("adapter exploded");
      }),
    };

    const goodProvider = makeFakeProvider("good");

    tracking.init([badProvider, goodProvider]);

    // Must not throw.
    expect(() =>
      tracking.submitEmail({
        email: "user@example.com",
        zip: "90210",
        path: "served",
      })
    ).not.toThrow();

    // Good provider still receives the event despite the bad one failing.
    expect(goodProvider.trackedEvents).toHaveLength(1);
    expect(goodProvider.trackedEvents[0].name).toBe(TRACKING_EVENTS.SUBMIT_EMAIL);
  });
});

describe("SSR guard", () => {
  it("is a no-op when window is undefined (server environment)", () => {
    // Reset first, then disable browser env BEFORE re-initialising.
    __resetTrackingForTests();
    disableBrowserEnv();

    const provider = makeFakeProvider();

    // These must all be silent no-ops.
    tracking.init([provider]);
    tracking.launch({ pageVariant: "test" });
    tracking.submitZip({ zip: "00000", served: false });
    tracking.submitEmail({ email: "x@y.com", zip: null, path: "skipped" });

    expect(provider.initCalls).toBe(0);
    expect(provider.trackedEvents).toHaveLength(0);
  });
});

describe("tracking.launch", () => {
  it("dispatches a Launch event with the given pageVariant", () => {
    const provider = makeFakeProvider();
    tracking.init([provider]);

    tracking.launch({ pageVariant: "redesign_chrome_drop" });

    expect(provider.trackedEvents[0]).toEqual({
      name: TRACKING_EVENTS.LAUNCH,
      payload: { pageVariant: "redesign_chrome_drop" },
    });
  });
});

describe("tracking.submitEmail", () => {
  it("dispatches a Submit email event with the correct payload", () => {
    const provider = makeFakeProvider();
    tracking.init([provider]);

    tracking.submitEmail({
      email: "ada@example.com",
      zip: "94103",
      path: "served",
    });

    expect(provider.trackedEvents[0]).toEqual({
      name: TRACKING_EVENTS.SUBMIT_EMAIL,
      payload: { email: "ada@example.com", zip: "94103", path: "served" },
    });
  });
});
