import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "../types";
import { makeId, type LeadStore } from "./store";

/**
 * SupabaseStore — persists leads to a Supabase Postgres `leads` table over the
 * PostgREST HTTPS API (serverless-safe: no DB sockets, no connection pool to
 * exhaust on Vercel). This is the durable production source-of-truth.
 *
 * Uses a SECRET key (server-only) so the write bypasses RLS and /admin can read
 * back. No-op-safe: if the URL/key are missing it logs a warning and returns
 * gracefully, so the app still boots and other adapters still run.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY. Table: see schema in
 * docs/ARCHITECTURE.md (mirrors the SQLite columns in local.ts).
 */
const TABLE = "leads";

export class SupabaseStore implements LeadStore {
  readonly name = "supabase";
  private url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private key = process.env.SUPABASE_SECRET_KEY;
  private _client: SupabaseClient | null = null;

  private get configured() {
    return !!this.url && !!this.key;
  }

  private client(): SupabaseClient {
    if (!this._client) {
      this._client = createClient(this.url!, this.key!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return this._client;
  }

  async save(lead: Lead): Promise<{ id: string }> {
    if (!this.configured) {
      console.warn(
        "[SupabaseStore] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY not set — skipping Supabase write (lead still persisted by other adapters).",
      );
      return { id: lead.id || makeId() };
    }

    const id = lead.id || makeId();
    const { error } = await this.client().from(TABLE).insert(leadToRow(lead, id));
    if (error) {
      throw new Error(`Supabase insert failed: ${error.code ?? ""} ${error.message}`);
    }
    return { id };
  }

  async list(): Promise<Lead[]> {
    if (!this.configured) return [];
    const { data, error } = await this.client()
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(`Supabase list failed: ${error.code ?? ""} ${error.message}`);
    }
    return (data ?? []).map(rowToLead);
  }
}

/** Lead → snake_case row (same column shape as the SQLite store). */
function leadToRow(lead: Lead, id: string) {
  return {
    id,
    email: lead.email,
    zip: lead.zip,
    served: lead.served,
    matched_store: lead.matchedStore,
    product_interest: lead.productInterest,
    utm_source: lead.utmSource,
    utm_medium: lead.utmMedium,
    utm_campaign: lead.utmCampaign,
    utm_content: lead.utmContent,
    utm_term: lead.utmTerm,
    consent: lead.consent,
    consent_version: lead.consentVersion,
    referrer: lead.referrer,
    page_variant: lead.pageVariant,
    created_at: lead.createdAt,
    session_id: lead.sessionId,
    captured_zip: lead.capturedZip,
  };
}

function rowToLead(r: Record<string, unknown>): Lead {
  return {
    id: r.id as string,
    email: r.email as string,
    zip: (r.zip as string) ?? null,
    served: !!r.served,
    matchedStore: (r.matched_store as string) ?? null,
    productInterest: (r.product_interest as string) ?? "unset",
    utmSource: (r.utm_source as string) ?? null,
    utmMedium: (r.utm_medium as string) ?? null,
    utmCampaign: (r.utm_campaign as string) ?? null,
    utmContent: (r.utm_content as string) ?? null,
    utmTerm: (r.utm_term as string) ?? null,
    consent: !!r.consent,
    consentVersion: (r.consent_version as string) ?? "",
    referrer: (r.referrer as string) ?? null,
    pageVariant: (r.page_variant as string) ?? null,
    createdAt: r.created_at as string,
    sessionId: (r.session_id as string) ?? null,
    capturedZip: (r.captured_zip as string) ?? null,
  };
}
