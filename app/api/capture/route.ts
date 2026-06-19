import { NextRequest, NextResponse } from "next/server";
import { captureSchema } from "@/lib/capture-schema";
import { getCaptureStore } from "@/lib/captures/factory";
import { rateLimit } from "@/lib/ratelimit";
import { MAX_FILL_MS } from "@/lib/constants";
import type { ApiResponse } from "@/lib/types";

// LocalCaptureStore (better-sqlite3) requires the Node runtime.
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

  const result = captureSchema.safeParse(parsedBody);
  if (!result.success) {
    return json(
      { ok: false, error: "invalid_input", message: "Please check your details and try again." },
      422,
    );
  }
  const data = result.data;

  // 5) Time-trap — only check for staleness, NOT the MIN_FILL_MS fast-bot floor.
  // Rationale: zip_submit events fire immediately after the user types their zip
  // (often <2 s after form load), so the MIN_FILL_MS threshold would silently
  // discard legitimate captures. We still reject replayed/stale events older
  // than MAX_FILL_MS (1 hour) to prevent capture replay attacks.
  const elapsed = Date.now() - data.formLoadedAt;
  if (elapsed > MAX_FILL_MS) {
    return json({ ok: true, message: "captured" }, 200);
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

  // 7) Persist capture event
  try {
    await getCaptureStore().record({
      sessionId: data.sessionId,
      event: data.event,
      zip: data.zip,
      served: data.served,
      pageVariant: data.pageVariant,
      referrer: data.referrer,
      utmSource: data.utm_source,
      utmMedium: data.utm_medium,
      utmCampaign: data.utm_campaign,
      utmContent: data.utm_content,
      utmTerm: data.utm_term,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[capture] record failed:", e);
    return json(
      { ok: false, error: "server_error", message: "Something went wrong. Please try again." },
      500,
    );
  }

  return json({ ok: true, message: "captured" }, 200);
}

export function GET() {
  return json({ ok: false, error: "method_not_allowed", message: "Method not allowed." }, 405);
}
