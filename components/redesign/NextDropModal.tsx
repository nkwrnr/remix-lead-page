"use client";

import { useEffect, useRef, useState } from "react";
import { RedesignEmailForm } from "./RedesignEmailForm";
import { useUtm } from "@/lib/utm";
import { API_ROUTE } from "@/lib/constants";
import type { EmailSubmit } from "./useFunnel";
import { tracking } from "@/lib/tracking";

/**
 * "Next drop" email-capture modal (used by the flavor "Buy it" buttons and the
 * sticky disco CTA on /redesign/chrome-drop). Submits an EMAIL-ONLY lead
 * independently of the page's zip funnel so it never disrupts the finder UI.
 * Leads are tagged pageVariant: "redesign_chrome_drop_buy".
 */
export function NextDropModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const utm = useUtm();
  const formLoadedAt = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // stamp the time-trap + focus the email field when opened
  useEffect(() => {
    if (!open) {
      setDone(false);
      return;
    }
    formLoadedAt.current = Date.now();
    setError(null);
    const id = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLInputElement>('input[type="email"]')?.focus();
    }, 40);
    return () => clearTimeout(id);
  }, [open]);

  // ESC to close + lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handle({ email, consent, website }: EmailSubmit) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(API_ROUTE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          website,
          path: "skipped",
          zip: null,
          matchedStore: null,
          productInterest: "unset",
          formLoadedAt: formLoadedAt.current,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          pageVariant: "redesign_chrome_drop_buy",
          utm_source: utm.current.utm_source,
          utm_medium: utm.current.utm_medium,
          utm_campaign: utm.current.utm_campaign,
          utm_content: utm.current.utm_content,
          utm_term: utm.current.utm_term,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDone(true);
        try {
          tracking.submitEmail({ email, zip: null, path: "skipped", source: "modal" });
        } catch { /* non-blocking */ }
      } else {
        setError(json.message || "Something went wrong. Please try again.");
        try {
          tracking.emailSubmitFailed({
            reason: res.status === 429 ? "rate_limited" : res.status >= 500 ? "server_error" : "validation",
            email,
            path: "skipped",
            source: "modal",
            zip: null,
          });
        } catch { /* non-blocking */ }
      }
    } catch {
      setError("Network error. Please try again.");
      try {
        tracking.emailSubmitFailed({ reason: "network", email, path: "skipped", source: "modal", zip: null });
      } catch { /* non-blocking */ }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="cd-modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="cd-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Get notified about the next Remix drop"
      >
        <button className="cd-modal__close" onClick={onClose} aria-label="Close" type="button">
          ×
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "8px 4px" }}>
            <h2 className="cd-modal__h">
              You&apos;re on the <em>list.</em> ✦
            </h2>
            <p className="cd-modal__sub">
              We&apos;ll ping you the second the next drop goes live. Talk soon.
            </p>
            <button className="rd-cta" style={{ marginTop: 18 }} onClick={onClose} type="button">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="rd-eyebrow">⬡ Next drop incoming</p>
            <h2 className="cd-modal__h">
              Our next online drop lands <em>in days.</em>
            </h2>
            <p className="cd-modal__sub">
              Give us your email and we&apos;ll let you know the second it drops.{" "}
              <span className="cd-magenta">So you can taste the goodness.</span>
            </p>
            <RedesignEmailForm
              heading=""
              cta="Notify me"
              submitting={submitting}
              error={error}
              onSubmit={handle}
              tone="dark"
            />
          </>
        )}
      </div>
    </div>
  );
}
