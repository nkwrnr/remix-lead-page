import type { Lead } from "../types";

export interface LeadStore {
  readonly name: string;
  save(lead: Lead): Promise<{ id: string }>;
  list(): Promise<Lead[]>;
}

/** Stable id without external deps (timestamp + random suffix). */
export function makeId(): string {
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)
  );
}
