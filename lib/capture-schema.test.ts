import { describe, expect, it } from "vitest";
import { captureSchema } from "./capture-schema";

const validBody = {
  event: "zip_submit",
  sessionId: "sess-abc-0000",
  zip: "90210",
  served: true,
  pageVariant: "redesign_chrome_drop",
  formLoadedAt: Date.now() - 1000,
  referrer: null,
  utm_source: "instagram",
  utm_medium: "paid_social",
  utm_campaign: "launch",
  utm_content: null,
  utm_term: null,
};

describe("captureSchema", () => {
  it("accepts a valid body", () => {
    const result = captureSchema.safeParse(validBody);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.event).toBe("zip_submit");
      expect(result.data.zip).toBe("90210");
      expect(result.data.served).toBe(true);
    }
  });

  it("transforms null utm fields to null (not undefined)", () => {
    const result = captureSchema.safeParse(validBody);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.utm_content).toBeNull();
      expect(result.data.utm_term).toBeNull();
    }
  });

  it("transforms null zip to null (not undefined)", () => {
    const result = captureSchema.safeParse({ ...validBody, zip: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zip).toBeNull();
    }
  });

  it("transforms missing zip to null", () => {
    const { zip: _zip, ...body } = validBody;
    const result = captureSchema.safeParse(body);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zip).toBeNull();
    }
  });

  it("rejects a non-5-digit zip", () => {
    const result = captureSchema.safeParse({ ...validBody, zip: "1234" });
    expect(result.success).toBe(false);
  });

  it("rejects a zip with letters", () => {
    const result = captureSchema.safeParse({ ...validBody, zip: "9021A" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown event type", () => {
    const result = captureSchema.safeParse({ ...validBody, event: "page_view" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing sessionId", () => {
    const { sessionId: _sid, ...body } = validBody;
    const result = captureSchema.safeParse(body);
    expect(result.success).toBe(false);
  });

  it("rejects an empty sessionId", () => {
    const result = captureSchema.safeParse({ ...validBody, sessionId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a sessionId longer than 80 chars", () => {
    const result = captureSchema.safeParse({
      ...validBody,
      sessionId: "a".repeat(81),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing event field", () => {
    const { event: _ev, ...body } = validBody;
    const result = captureSchema.safeParse(body);
    expect(result.success).toBe(false);
  });

  it("accepts a body with all optional fields omitted (nullish)", () => {
    const result = captureSchema.safeParse({
      event: "zip_submit",
      sessionId: "sess-min",
      served: false,
      formLoadedAt: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zip).toBeNull();
      expect(result.data.pageVariant).toBeNull();
    }
  });
});
