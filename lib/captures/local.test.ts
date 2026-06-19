import { afterEach, describe, expect, it } from "vitest";
import { rmSync } from "node:fs";
import { LocalCaptureStore } from "./local";
import type { Capture } from "./store";

const TMP = "data/test-captures.db";

function capture(over: Partial<Capture> = {}): Capture {
  return {
    sessionId: "sess-abc-123",
    event: "zip_submit",
    zip: "90210",
    served: true,
    pageVariant: "redesign_chrome_drop",
    referrer: null,
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "launch",
    utmContent: null,
    utmTerm: null,
    createdAt: new Date().toISOString(),
    ...over,
  };
}

afterEach(() => {
  for (const f of [TMP, `${TMP}-wal`, `${TMP}-shm`]) {
    try {
      rmSync(f);
    } catch {
      /* ignore */
    }
  }
});

describe("LocalCaptureStore", () => {
  it("records a capture and returns an id", async () => {
    const store = new LocalCaptureStore(TMP);
    const { id } = await store.record(capture());
    expect(id).toBeTruthy();
  });

  it("latestZipForSession returns the most recent non-null zip", async () => {
    const store = new LocalCaptureStore(TMP);

    // First capture: has a zip
    await store.record(
      capture({
        sessionId: "sess-xyz",
        zip: "12345",
        createdAt: "2026-06-19T10:00:00.000Z",
      }),
    );

    // Second capture: no zip
    await store.record(
      capture({
        sessionId: "sess-xyz",
        zip: null,
        createdAt: "2026-06-19T10:01:00.000Z",
      }),
    );

    const zip = await store.latestZipForSession("sess-xyz");
    // Should return "12345" — the only non-null zip (the null one is skipped by the query).
    expect(zip).toBe("12345");
  });

  it("latestZipForSession returns null when session has no non-null zip", async () => {
    const store = new LocalCaptureStore(TMP);
    await store.record(capture({ sessionId: "sess-no-zip", zip: null }));

    const zip = await store.latestZipForSession("sess-no-zip");
    expect(zip).toBeNull();
  });

  it("latestZipForSession returns null for an unknown session", async () => {
    const store = new LocalCaptureStore(TMP);
    await store.record(capture({ sessionId: "sess-other" }));

    const zip = await store.latestZipForSession("sess-unknown");
    expect(zip).toBeNull();
  });

  it("latestZipForSession returns the MOST RECENT non-null zip when multiple exist", async () => {
    const store = new LocalCaptureStore(TMP);

    await store.record(
      capture({
        sessionId: "sess-multi",
        zip: "11111",
        createdAt: "2026-06-19T09:00:00.000Z",
      }),
    );
    await store.record(
      capture({
        sessionId: "sess-multi",
        zip: "22222",
        createdAt: "2026-06-19T09:05:00.000Z",
      }),
    );

    const zip = await store.latestZipForSession("sess-multi");
    expect(zip).toBe("22222");
  });
});
