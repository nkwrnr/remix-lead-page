import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
// Meta Web Pixel: the loader script comes from connect.facebook.net and the
// event beacon is an image GET to www.facebook.com/tr — both must be allow-listed
// or the browser's CSP silently blocks all pixel events.
const FB_SCRIPT = "https://connect.facebook.net";
const FB_BEACON = "https://www.facebook.com";
// Meta Conversions API Gateway configured on pixel 458468750504303: the Madgicx
// "openbridge" gateway + the first-party drinkremix.co CAPI endpoint. The browser
// pixel dual-sends events here for server-side attribution (iOS / ad-blocker
// resilience). connect-src only — purely additive, blocks nothing already working.
const FB_CAPIG = "https://capig.madgicx.ai https://mct.drinkremix.co";
// React dev mode + HMR require 'unsafe-eval'; production CSP stays strict.
const scriptSrc = isDev
  ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${FB_SCRIPT}`
  : `script-src 'self' 'unsafe-inline' ${FB_SCRIPT}`;

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next injects small inline bootstrap scripts; 'unsafe-inline' kept for MVP simplicity.
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      // FB_SCRIPT here covers the pixel's error/log image pings.
      `img-src 'self' data: blob: ${FB_BEACON} ${FB_SCRIPT}`,
      "font-src 'self' data:",
      // email platform endpoints + Meta pixel beacon/loader + Meta CAPI gateway
      `connect-src 'self' https://a.klaviyo.com https://api.airtable.com ${FB_BEACON} ${FB_SCRIPT} ${FB_CAPIG}`,
      // Meta pixel cookie-sync iframe (improves match quality). Keep 'self' so
      // same-origin frames stay allowed (frame-src overrides the default-src fallback).
      `frame-src 'self' ${FB_BEACON}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      // www.facebook.com is the pixel's POST-transport fallback for /tr/.
      `form-action 'self' ${FB_BEACON}`,
    ].join("; "),
  },
];

// PostHog reverse proxy: the browser only ever talks to same-origin `/ingest/*`,
// which Next transparently proxies to PostHog Cloud. This is ad-blocker resilient
// and — because ingestion never crosses an origin — needs NO extra CSP entries.
// Region-overridable via env (defaults to US cloud).
const PH_INGEST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const PH_ASSETS = process.env.NEXT_PUBLIC_POSTHOG_ASSETS_HOST || "https://us-assets.i.posthog.com";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Required by the PostHog proxy so `/ingest/decide` etc. aren't 308-redirected.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // Static assets (array.js / config) come from the assets subdomain…
      { source: "/ingest/static/:path*", destination: `${PH_ASSETS}/static/:path*` },
      // …everything else (event ingest, /decide, /flags) from the main host.
      { source: "/ingest/:path*", destination: `${PH_INGEST}/:path*` },
    ];
  },
};

export default nextConfig;
