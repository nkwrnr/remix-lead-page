import type { Lead } from "../types";
import { makeId, type LeadStore } from "./store";

/**
 * AirtableStore — appends the full raw lead record (the immutable source-of-truth
 * mirror + retailer zip-demand export). No-op-safe when not configured.
 *
 * Requires: AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE (default "Leads").
 */
export class AirtableStore implements LeadStore {
  readonly name = "airtable";
  private token = process.env.AIRTABLE_TOKEN;
  private baseId = process.env.AIRTABLE_BASE_ID;
  private table = process.env.AIRTABLE_TABLE || "Leads";

  private get configured() {
    return !!this.token && !!this.baseId;
  }

  async save(lead: Lead): Promise<{ id: string }> {
    if (!this.configured) {
      console.warn(
        "[AirtableStore] AIRTABLE_TOKEN/BASE_ID not set — skipping Airtable write (lead still persisted by other adapters).",
      );
      return { id: makeId() };
    }

    const res = await fetch(
      `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.table)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Email: lead.email,
            Zip: lead.zip,
            Served: lead.served,
            "Matched Store": lead.matchedStore,
            "Product Interest": lead.productInterest,
            "UTM Source": lead.utmSource,
            "UTM Medium": lead.utmMedium,
            "UTM Campaign": lead.utmCampaign,
            "UTM Content": lead.utmContent,
            "UTM Term": lead.utmTerm,
            Consent: lead.consent,
            "Consent Version": lead.consentVersion,
            Referrer: lead.referrer,
            "Page Variant": lead.pageVariant,
            "Created At": lead.createdAt,
          },
          typecast: true,
        }),
      },
    );
    if (!res.ok) {
      throw new Error(
        `Airtable create failed: ${res.status} ${(await res.text()).slice(0, 300)}`,
      );
    }
    const json = (await res.json()) as { id?: string };
    return { id: json.id || lead.id || makeId() };
  }

  async list(): Promise<Lead[]> {
    return [];
  }
}
