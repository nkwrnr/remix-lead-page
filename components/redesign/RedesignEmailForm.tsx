"use client";

import { useRef, useState } from "react";
import type { EmailSubmit } from "./useFunnel";

/**
 * Theme-scoped email capture (honeypot + consent + 2s time-trap friendly).
 * Styled entirely with `.rd-*` classes so it adopts whatever `[data-theme]`
 * scope it is rendered inside. Mirrors the validation of the live EmailCapture.
 */
export function RedesignEmailForm({
  heading,
  cta = "Get on the list",
  submitting,
  error,
  onSubmit,
  tone = "light",
}: {
  heading: string;
  cta?: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (v: EmailSubmit) => void;
  tone?: "light" | "dark";
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setLocalErr("Please enter a valid email address.");
      return;
    }
    if (!consent) {
      setLocalErr("Please check the box to join the list.");
      return;
    }
    setLocalErr(null);
    onSubmit({ email, consent, website: honeypot.current?.value || "" });
  }

  const shownErr = localErr || error;
  const subColor = tone === "dark" ? "rgba(255,255,255,.7)" : "var(--rd-ink-soft)";

  return (
    <form onSubmit={handle} noValidate className="mt-5">
      <p className="rd-display" style={{ fontSize: "1.35rem", marginBottom: 12 }}>
        {heading}
      </p>

      {/* honeypot */}
      <input
        ref={honeypot}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="your@email.com"
          aria-label="Email address"
          aria-invalid={!!shownErr}
          disabled={submitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rd-field"
        />
        <button type="submit" disabled={submitting} className="rd-cta">
          {submitting ? "Submitting…" : cta}
        </button>
      </div>

      <label
        className="mt-3"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          fontSize: "0.75rem",
          color: subColor,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          disabled={submitting}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
        />
        <span>
          Yes, send me Remix drops, restocks, and the occasional good time. By
          joining you agree to receive marketing emails from Remix. Unsubscribe
          anytime. See our{" "}
          <a href="/privacy" className="rd-textlink">
            privacy policy
          </a>
          .
        </span>
      </label>

      {shownErr && (
        <p role="alert" className="mt-2" style={{ fontSize: "0.85rem", color: tone === "dark" ? "#ffd9cf" : "var(--rd-ember)" }}>
          {shownErr}
        </p>
      )}
      <p className="mt-2" style={{ fontSize: "0.72rem", color: subColor }}>
        Drop alerts, restock pings, zero spam.
      </p>
    </form>
  );
}
