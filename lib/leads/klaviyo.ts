import type { Lead } from "../types";
import { makeId, type LeadStore } from "./store";

/**
 * KlaviyoStore — adds/updates a profile and subscribes it to a list.
 * No-op-safe: if KLAVIYO_API_KEY (or list id) is missing it logs a warning and
 * returns gracefully, so the app still boots and other adapters still run.
 *
 * Docs: create-or-update profile, then subscribe-profiles for consent.
 */
const KLAVIYO_REVISION = "2024-10-15";

export class KlaviyoStore implements LeadStore {
  readonly name = "klaviyo";
  private apiKey = process.env.KLAVIYO_API_KEY;
  private listId = process.env.KLAVIYO_LIST_ID;

  private get configured() {
    return !!this.apiKey;
  }

  async save(lead: Lead): Promise<{ id: string }> {
    if (!this.configured) {
      console.warn(
        "[KlaviyoStore] KLAVIYO_API_KEY not set — skipping Klaviyo write (lead still persisted by other adapters).",
      );
      return { id: makeId() };
    }

    const headers = {
      Authorization: `Klaviyo-API-Key ${this.apiKey}`,
      revision: KLAVIYO_REVISION,
      "content-type": "application/json",
      accept: "application/json",
    };

    // 1) create-or-update profile with custom properties
    const profileRes = await fetch("https://a.klaviyo.com/api/profile-import", {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email: lead.email,
            location: lead.zip ? { zip: lead.zip } : undefined,
            properties: {
              served: lead.served,
              matched_store: lead.matchedStore,
              product_interest: lead.productInterest,
              utm_source: lead.utmSource,
              utm_medium: lead.utmMedium,
              utm_campaign: lead.utmCampaign,
              zip_entered: lead.zip,
              page_variant: lead.pageVariant,
            },
          },
        },
      }),
    });
    if (!profileRes.ok && profileRes.status !== 409) {
      throw new Error(
        `Klaviyo profile-import failed: ${profileRes.status} ${await safeText(profileRes)}`,
      );
    }

    // 2) subscribe to the list (consent) — only if a list id is configured
    if (this.listId && lead.consent) {
      const subRes = await fetch(
        "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            data: {
              type: "profile-subscription-bulk-create-job",
              attributes: {
                profiles: {
                  data: [
                    {
                      type: "profile",
                      attributes: {
                        email: lead.email,
                        subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                      },
                    },
                  ],
                },
              },
              relationships: {
                list: { data: { type: "list", id: this.listId } },
              },
            },
          }),
        },
      );
      if (!subRes.ok) {
        throw new Error(
          `Klaviyo subscribe failed: ${subRes.status} ${await safeText(subRes)}`,
        );
      }
    }

    return { id: lead.id || makeId() };
  }

  async list(): Promise<Lead[]> {
    // Klaviyo is the marketing system, not a local read source.
    return [];
  }
}

async function safeText(r: Response): Promise<string> {
  try {
    return (await r.text()).slice(0, 300);
  } catch {
    return "";
  }
}
