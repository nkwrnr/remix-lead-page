import { describe, expect, it } from "vitest";
import { subscribeSchema } from "./subscribe-schema";

const base = {
  email: "fan@example.com",
  path: "served" as const,
  zip: "72601",
  matchedStore: "Walmart #2, Harrison, AR",
  productInterest: "both" as const,
  consent: true,
  website: "",
  formLoadedAt: Date.now(),
  utm_source: "instagram",
  utm_medium: "paid_social",
  utm_campaign: "launch",
  utm_content: null,
  utm_term: null,
  referrer: "https://instagram.com",
  pageVariant: "scarcity_a",
};

describe("subscribeSchema", () => {
  it("accepts a well-formed payload", () => {
    expect(subscribeSchema.safeParse(base).success).toBe(true);
  });

  it("lowercases and trims email", () => {
    const r = subscribeSchema.safeParse({ ...base, email: "  FAN@Example.COM " });
    expect(r.success && r.data.email).toBe("fan@example.com");
  });

  it("rejects a bad email", () => {
    expect(subscribeSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });

  it("rejects a non-5-digit zip", () => {
    expect(subscribeSchema.safeParse({ ...base, zip: "123" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(subscribeSchema.safeParse({ ...base, website: "bot" }).success).toBe(false);
  });

  it("allows null zip for skipped path", () => {
    const r = subscribeSchema.safeParse({ ...base, path: "skipped", zip: null });
    expect(r.success).toBe(true);
  });
});
