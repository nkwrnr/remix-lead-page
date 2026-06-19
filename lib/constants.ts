import type { ProductSlug } from "./types";

export const ZIP_REGEX = /^\d{5}$/;
export const MAX_EMAIL_LENGTH = 254;
export const API_ROUTE = "/api/subscribe";
export const SERVED_ZIPS_URL = "/data/served-zips.json";
export const CONSENT_VERSION = "2026-06-16-v1";

/** Bot time-trap thresholds (ms). */
export const MIN_FILL_MS = 2000; // faster than a human = bot
export const MAX_FILL_MS = 60 * 60 * 1000; // staler than 1h = replayed form

export interface ProductInfo {
  slug: ProductSlug;
  name: string;
  flavor: string;
  image: string;
  blurb: string;
}

export const PRODUCTS: Record<ProductSlug, ProductInfo> = {
  "muddled-berry-mojito": {
    slug: "muddled-berry-mojito",
    name: "Muddled Berry Mojito",
    flavor: "Blackberry · Lime · Mint",
    image: "/images/can-mojito.png",
    blurb:
      "Blackberry, lime, and fresh mint walk into a can. Crisp, juicy, ridiculously refreshing.",
  },
  "perfect-paloma": {
    slug: "perfect-paloma",
    name: "Perfect Paloma",
    flavor: "Grapefruit · Lime",
    image: "/images/can-paloma.png",
    blurb:
      "Grapefruit and lime, zhuzhed to perfection. Tart, bright, made to be sipped slow.",
  },
};

export const PRODUCT_LABELS: Record<string, string> = {
  "perfect-paloma": "Perfect Paloma",
  "muddled-berry-mojito": "Muddled Berry Mojito",
};

/** Shared nutrition badges. */
export const NUTRITION_BADGES = ["0 ABV", "Under 20 Cal", "3g Sugar", "Real Juice"];
