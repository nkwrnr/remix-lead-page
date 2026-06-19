import { makeId } from "@/lib/leads/store";

export { makeId };

export interface Capture {
  id?: string;
  sessionId: string;
  event: string; // "zip_submit"
  zip: string | null;
  served: boolean;
  pageVariant: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  createdAt: string; // ISO
}

export interface CaptureStore {
  readonly name: string;
  record(c: Capture): Promise<{ id: string }>;
  /** Most recent non-null zip captured for this session, or null. */
  latestZipForSession(sessionId: string): Promise<string | null>;
}
