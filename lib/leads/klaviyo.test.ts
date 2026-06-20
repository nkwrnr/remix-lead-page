import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KlaviyoStore } from "./klaviyo";
import { MultiStore } from "./multi";
import type { Lead } from "../types";
import type { LeadStore } from "./store";

function lead(over: Partial<Lead> = {}): Lead {
  return {
    email: "a@b.com",
    zip: "72601",
    served: true,
    matchedStore: "Walmart #5217, Harrison, AR",
    productInterest: "both",
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "chrome_drop",
    utmContent: "story",
    utmTerm: null,
    consent: true,
    consentVersion: "v1",
    referrer: null,
    pageVariant: "chrome_drop_live",
    createdAt: "2026-06-19T00:00:00.000Z",
    sessionId: "sess-1",
    capturedZip: "72601",
    ...over,
  };
}

// Capture fetch calls; default to ok responses.
let fetchMock: ReturnType<typeof vi.fn>;
function okResponse(status = 200) {
  return { ok: status >= 200 && status < 300, status, text: async () => "" } as unknown as Response;
}

beforeEach(() => {
  fetchMock = vi.fn(async () => okResponse());
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.KLAVIYO_API_KEY;
  delete process.env.KLAVIYO_LIST_ID;
});

describe("KlaviyoStore", () => {
  it("upserts the profile with custom props then subscribes to the list with consent", async () => {
    process.env.KLAVIYO_API_KEY = "pk_test";
    process.env.KLAVIYO_LIST_ID = "X2ayZW";

    const { id } = await new KlaviyoStore().save(lead());
    expect(id).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // 1) profile-import with email, location.zip, and custom properties
    const [importUrl, importInit] = fetchMock.mock.calls[0];
    expect(importUrl).toContain("/api/profile-import");
    const importBody = JSON.parse(importInit.body);
    const attrs = importBody.data.attributes;
    expect(attrs.email).toBe("a@b.com");
    expect(attrs.location.zip).toBe("72601");
    expect(attrs.properties).toMatchObject({
      served: true,
      matched_store: "Walmart #5217, Harrison, AR",
      utm_campaign: "chrome_drop",
      utm_content: "story",
      page_variant: "chrome_drop_live",
    });

    // 2) subscribe to the configured list with SUBSCRIBED consent
    const [subUrl, subInit] = fetchMock.mock.calls[1];
    expect(subUrl).toContain("/api/profile-subscription-bulk-create-jobs");
    const subBody = JSON.parse(subInit.body);
    expect(subBody.data.relationships.list.data.id).toBe("X2ayZW");
    const sub = subBody.data.attributes.profiles.data[0].attributes.subscriptions;
    expect(sub.email.marketing.consent).toBe("SUBSCRIBED");
  });

  it("does NOT subscribe when consent is false (still upserts the profile)", async () => {
    process.env.KLAVIYO_API_KEY = "pk_test";
    process.env.KLAVIYO_LIST_ID = "X2ayZW";

    await new KlaviyoStore().save(lead({ consent: false }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/profile-import");
  });

  it("is no-op-safe when KLAVIYO_API_KEY is unset (returns id, no network)", async () => {
    const { id } = await new KlaviyoStore().save(lead());
    expect(id).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when Klaviyo returns a hard error (so MultiStore logs it)", async () => {
    process.env.KLAVIYO_API_KEY = "pk_test";
    fetchMock.mockResolvedValueOnce(okResponse(500));
    await expect(new KlaviyoStore().save(lead())).rejects.toThrow(/Klaviyo profile-import failed/);
  });
});

describe("MultiStore fan-out — Klaviyo is best-effort", () => {
  it("a Klaviyo failure never drops the lead (primary still returns its id)", async () => {
    process.env.KLAVIYO_API_KEY = "pk_test";
    fetchMock.mockRejectedValue(new Error("klaviyo down"));

    const primary: LeadStore = {
      name: "supabase",
      async save() {
        return { id: "primary-id" };
      },
      async list() {
        return [];
      },
    };
    const multi = new MultiStore([primary, new KlaviyoStore()]);
    const { id } = await multi.save(lead());
    expect(id).toBe("primary-id"); // signup succeeds despite Klaviyo throwing
  });
});
