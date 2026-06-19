"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export interface EmailSubmit {
  email: string;
  consent: boolean;
  website: string;
}

export function EmailCapture({
  heading,
  cta = "Get on the list",
  submitting,
  error,
  onSubmit,
  ctaClassName,
}: {
  heading: string;
  cta?: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (v: EmailSubmit) => void;
  ctaClassName?: string;
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

  return (
    <form onSubmit={handle} noValidate className="mt-5">
      <p className="font-display text-xl mb-3">{heading}</p>

      {/* honeypot — hidden from users, bots tend to fill it */}
      <input
        ref={honeypot}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="flex flex-col gap-2.5">
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="your@email.com"
          aria-label="Email address"
          value={email}
          invalid={!!shownErr}
          disabled={submitting}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="submit"
          disabled={submitting}
          className={`w-full ${ctaClassName ?? ""}`}
        >
          {submitting ? (
            <>
              <Spinner /> Submitting…
            </>
          ) : (
            cta
          )}
        </Button>
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-ink-light cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          disabled={submitting}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-coral shrink-0"
        />
        <span>
          Yes, send me Remix drops, restocks, and the occasional good time. By
          joining you agree to receive marketing emails from Remix. Unsubscribe
          anytime. See our{" "}
          <a href="/privacy" className="underline hover:text-coral">
            privacy policy
          </a>
          .
        </span>
      </label>

      {shownErr && (
        <p role="alert" className="mt-2 text-sm text-error">
          {shownErr}
        </p>
      )}
      <p className="mt-2 text-xs text-ink-light">
        Drop alerts, restock pings, zero spam.
      </p>
    </form>
  );
}
