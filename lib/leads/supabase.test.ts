import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "../types";

// ── Mock the supabase-js client ──────────────────────────────────────────────
// Captures inserted rows in-memory and lets each test choose what select returns.
const inserted: Record<string, unknown>[] = [];
let insertError: { code?: string; message: string } | null = null;
let selectRows: Record<string, unknown>[] = [];

const fromMock = vi.fn(() => ({
  insert: (row: Record<string, unknown>) => {
    if (!insertError) inserted.push(row);
    return Promise.resolve({ error: insertError });
  },
  select: () => ({
    order: () => Promise.resolve({ data: selectRows, error: null }),
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}));

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
    pageVariant: "chrome_drop_live",
    createdAt: "2026-06-19T00:00:00.000Z",
    sessionId: "sess-1",
    capturedZip: "72601",
    ...over,
  };
}

describe("SupabaseStore", () => {
  beforeEach(() => {
    inserted.length = 0;
    insertError = null;
    selectRows = [];
    vi.resetModules();
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
  });

  it("maps a lead to snake_case columns and returns an id", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    const { SupabaseStore } = await import("./supabase");

    const { id } = await new SupabaseStore().save(lead());
    expect(id).toBeTruthy();
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({
      email: "a@b.com",
      zip: "72601",
      served: true,
      matched_store: "Walmart #2",
      product_interest: "both",
      page_variant: "chrome_drop_live",
      session_id: "sess-1",
      captured_zip: "72601",
    });
  });

  it("throws when the insert errors (so MultiStore can surface a primary failure)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    insertError = { code: "23505", message: "duplicate key" };
    const { SupabaseStore } = await import("./supabase");

    await expect(new SupabaseStore().save(lead())).rejects.toThrow(/Supabase insert failed/);
  });

  it("round-trips rows back into Lead shape on list()", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    selectRows = [
      { id: "1", email: "c@d.com", zip: null, served: 0, product_interest: "unset", consent: 1, created_at: "2026-06-19T01:00:00.000Z" },
    ];
    const { SupabaseStore } = await import("./supabase");

    const rows = await new SupabaseStore().list();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: "c@d.com", zip: null, served: false, consent: true });
  });

  it("is no-op-safe when env is unset (still returns an id, no throw)", async () => {
    const { SupabaseStore } = await import("./supabase");
    const { id } = await new SupabaseStore().save(lead());
    expect(id).toBeTruthy();
    expect(inserted).toHaveLength(0);
    expect(await new SupabaseStore().list()).toEqual([]);
  });
});

describe("factory — backend selection", () => {
  beforeEach(() => vi.resetModules());

  it("does NOT auto-include LocalStore; honors order as primary", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    const { createLeadStore } = await import("./factory");

    const store = createLeadStore("supabase+klaviyo");
    // MultiStore names itself "multi(<primary>+<rest>)" — supabase must be first.
    expect(store.name).toBe("multi(supabase+klaviyo)");

    const single = createLeadStore("supabase");
    expect(single.name).toBe("supabase");

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
  });

  it("falls back to local for an all-unknown spec", async () => {
    const { createLeadStore } = await import("./factory");
    const store = createLeadStore("nonsense");
    expect(store.name).toBe("local");
  });
});
