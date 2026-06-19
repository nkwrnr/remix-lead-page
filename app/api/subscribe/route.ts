import { NextRequest, NextResponse } from "next/server";
import { subscribeSchema } from "@/lib/subscribe-schema";
import { getLeadStore } from "@/lib/leads/factory";
import { getCaptureStore } from "@/lib/captures/factory";
import { rateLimit } from "@/lib/ratelimit";
import { CONSENT_VERSION, MAX_FILL_MS, MIN_FILL_MS } from "@/lib/constants";
import type { ApiResponse, Lead } from "@/lib/types";

// LocalStore (better-sqlite3) requires the Node runtime.
export const runtime = "nodejs";

const MAX_BODY_BYTES = 2048;

function json(body: ApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1) Content-Type guard
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "bad_request", message: "Invalid request." }, 415);
  }

  // 2) Payload size guard
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "too_large", message: "Request too large." }, 413);
  }

  // 3) Origin guard (defense-in-depth; not a hard boundary)
  const origin = req.headers.get("origin");
  const allowed = process.env.NEXT_PUBLIC_SITE_URL;
  if (origin && allowed && !origin.startsWith(allowed) && process.env.NODE_ENV === "production") {
    return json({ ok: false, error: "forbidden", message: "Forbidden." }, 403);
  }

  // 4) Parse + validate
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "bad_json", message: "Invalid JSON." }, 400);
  }

  const result = subscribeSchema.safeParse(parsedBody);
  if (!result.success) {
    // Honeypot non-empty fails the max(0) check — treat as silent success (don't tip off bots).
    const honeypotHit = result.error.issues.some((i) => i.path[0] === "website");
    if (honeypotHit) return json({ ok: true, message: "subscribed" }, 200);

    const emailIssue = result.error.issues.find((i) => i.path[0] === "email");
    return json(
      {
        ok: false,
        error: emailIssue ? "invalid_email" : "invalid_input",
        message: emailIssue
          ? "Please enter a valid email address."
          : "Please check your details and try again.",
      },
      422,
    );
  }
  const data = result.data;

  // 5) Time-trap — too fast (bot) or stale (replayed) → silent success
  const elapsed = Date.now() - data.formLoadedAt;
  if (elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return json({ ok: true, message: "subscribed" }, 200);
  }

  // 6) Rate limit per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { success } = await rateLimit(ip);
  if (!success) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  // 7) Persist via the configured backend(s)

  // Zip carry-through: use the best available zip signal in priority order:
  //   1. data.zip          — zip entered on THIS submit form
  //   2. data.capturedZip  — zip the client remembered from the earlier zip-submit stage
  //   3. server-side lookup via getCaptureStore().latestZipForSession() — in case the
  //      client didn't carry the value forward but we recorded a capture event earlier
  //   4. null              — no zip available
  let effectiveZip: string | null = data.zip ?? data.capturedZip ?? null;
  if (!effectiveZip && data.sessionId) {
    try {
      effectiveZip = await getCaptureStore().latestZipForSession(data.sessionId);
    } catch (e) {
      // Best-effort: never fail a subscribe because the capture lookup errored.
      console.warn("[subscribe] capture zip lookup failed (non-fatal):", e);
    }
  }

  const lead: Lead = {
    email: data.email,
    zip: effectiveZip,
    served: data.path === "served",
    matchedStore: data.matchedStore,
    productInterest: data.productInterest,
    utmSource: data.utm_source,
    utmMedium: data.utm_medium,
    utmCampaign: data.utm_campaign,
    utmContent: data.utm_content,
    utmTerm: data.utm_term,
    consent: data.consent,
    consentVersion: CONSENT_VERSION,
    referrer: data.referrer,
    pageVariant: data.pageVariant,
    createdAt: new Date().toISOString(),
    sessionId: data.sessionId,
    capturedZip: data.capturedZip,
  };

  try {
    await getLeadStore().save(lead);
  } catch (e) {
    console.error("[subscribe] save failed:", e);
    return json(
      { ok: false, error: "server_error", message: "Something went wrong. Please try again." },
      500,
    );
  }

  return json({ ok: true, message: "subscribed" }, 200);
}

export function GET() {
  return json({ ok: false, error: "method_not_allowed", message: "Method not allowed." }, 405);
}
