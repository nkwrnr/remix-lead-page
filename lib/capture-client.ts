/**
 * Client-only helpers for session identity, zip memory, and the capture beacon.
 * All functions guard against SSR with `typeof window` checks.
 */

const SESSION_KEY = "rmx_sid";
const ZIP_KEY = "rmx_zip";

/** Read or create a session ID stored in sessionStorage. Returns "" on the server. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "";
  }
}

/** Persist the submitted zip in sessionStorage for later recall. */
export function rememberZip(zip: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ZIP_KEY, zip);
  } catch {
    // storage unavailable — silently ignore
  }
}

/** Read the stored zip. Returns null if absent or running on the server. */
export function recallZip(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ZIP_KEY);
  } catch {
    return null;
  }
}

interface ZipSubmitInput {
  zip: string | null;
  served: boolean;
  pageVariant: string;
  formLoadedAt: number;
  referrer: string | null;
  utm: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
  };
}

/**
 * Fire-and-forget POST to /api/capture with the zip-submit event.
 * Never awaited, never throws into the caller.
 */
export function recordZipSubmit(input: ZipSubmitInput): void {
  const { zip, served, pageVariant, formLoadedAt, referrer, utm } = input;
  fetch("/api/capture", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      event: "zip_submit",
      sessionId: getSessionId(),
      zip,
      served,
      pageVariant,
      formLoadedAt,
      referrer,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
    }),
    keepalive: true,
  }).catch(() => {});
}
