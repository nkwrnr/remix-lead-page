// Shared types for the Remix zip-landing page.

export type ProductSlug = "perfect-paloma" | "muddled-berry-mojito";

export interface Store {
  storeNumber: number;
  address: string;
  city: string;
  state: string;
  format: string; // SC | NHM | D1
  products: ProductSlug[];
}

/** Shape of public/data/served-zips.json */
export type ServedZips = Record<string, Store[]>;

export type ZipResult =
  | { status: "served"; zip: string; stores: Store[] }
  | { status: "unserved"; zip: string }
  | { status: "invalid" };

export type PathType = "served" | "unserved" | "skipped";

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

/** Client → /api/subscribe request body */
export interface SubscribePayload extends UtmParams {
  email: string;
  path: PathType;
  zip: string | null;
  matchedStore: string | null;
  productInterest: ProductSlug | "both" | "unset";
  consent: boolean;
  website: string; // honeypot — must be empty
  formLoadedAt: number; // epoch ms set on form mount (time-trap)
  referrer: string | null;
  pageVariant: string | null;
  sessionId: string | null;
  capturedZip: string | null;
}

export type ApiResponse =
  | { ok: true; message: string }
  | { ok: false; error: string; message: string };

/** Canonical lead record persisted by the backend adapters. */
export interface Lead {
  id?: string;
  email: string;
  zip: string | null;
  served: boolean;
  matchedStore: string | null;
  productInterest: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  consent: boolean;
  consentVersion: string;
  referrer: string | null;
  pageVariant: string | null;
  createdAt: string; // ISO
  sessionId: string | null;
  capturedZip: string | null;
}
