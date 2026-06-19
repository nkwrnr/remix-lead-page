import type { Lead } from "../types";
import type { LeadStore } from "./store";

/**
 * MultiStore — fans a lead out to several adapters. The FIRST adapter is treated
 * as the durable source-of-truth: its write must succeed (its id is returned).
 * Remaining adapters are best-effort — a failure is logged but never drops the lead.
 */
export class MultiStore implements LeadStore {
  readonly name: string;
  constructor(private stores: LeadStore[]) {
    this.name = `multi(${stores.map((s) => s.name).join("+")})`;
  }

  async save(lead: Lead): Promise<{ id: string }> {
    const [primary, ...rest] = this.stores;
    const result = await primary.save(lead); // must succeed
    const withId: Lead = { ...lead, id: result.id };
    await Promise.allSettled(
      rest.map((s) =>
        s.save(withId).catch((e) => {
          console.error(`[MultiStore] adapter "${s.name}" failed:`, e);
          throw e;
        }),
      ),
    );
    return result;
  }

  async list(): Promise<Lead[]> {
    // Read from the first adapter that can read (LocalStore).
    for (const s of this.stores) {
      const rows = await s.list();
      if (rows.length) return rows;
    }
    return this.stores[0]?.list() ?? [];
  }
}
