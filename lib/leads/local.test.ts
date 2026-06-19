import { afterEach, describe, expect, it } from "vitest";
import { rmSync } from "node:fs";
import { LocalStore } from "./local";
import { MultiStore } from "./multi";
import type { Lead } from "../types";
import type { LeadStore } from "./store";

const TMP = "data/test-local.db";

function lead(over: Partial<Lead> = {}): Lead {
  return {
    email: "a@b.com",
    zip: "72601",
    served: true,
    matchedStore: "Walmart #2",
    productInterest: "both",
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "launch",
    utmContent: null,
    utmTerm: null,
    consent: true,
    consentVersion: "v1",
    referrer: null,
    pageVariant: "scarcity_a",
    createdAt: new Date().toISOString(),
    sessionId: null,
    capturedZip: null,
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

describe("LocalStore", () => {
  it("saves and lists a lead round-trip", async () => {
    const store = new LocalStore(TMP);
    const { id } = await store.save(lead());
    expect(id).toBeTruthy();
    const rows = await store.list();
    expect(rows.length).toBe(1);
    expect(rows[0].email).toBe("a@b.com");
    expect(rows[0].served).toBe(true);
    expect(rows[0].zip).toBe("72601");
  });
});

describe("MultiStore", () => {
  it("returns primary id and survives a failing secondary adapter", async () => {
    const primary = new LocalStore(TMP);
    const flaky: LeadStore = {
      name: "flaky",
      async save() {
        throw new Error("boom");
      },
      async list() {
        return [];
      },
    };
    const multi = new MultiStore([primary, flaky]);
    const { id } = await multi.save(lead({ email: "c@d.com" }));
    expect(id).toBeTruthy();
    // primary still persisted despite secondary throwing
    const rows = await primary.list();
    expect(rows.find((r) => r.email === "c@d.com")).toBeTruthy();
  });
});
