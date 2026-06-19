"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmailCapture, type EmailSubmit } from "./EmailCapture";
import { SoldOutBanner, StoreList } from "./PathA";
import { ConfirmationView } from "./ConfirmationView";
import { findStores } from "@/lib/zip-lookup";
import { useUtm } from "@/lib/utm";
import { API_ROUTE } from "@/lib/constants";
import type { PathType, ProductSlug, Store } from "@/lib/types";

type Phase = "idle" | "served" | "unserved" | "success";

function productInterest(stores: Store[]): ProductSlug | "both" | "unset" {
  const all = new Set(stores.flatMap((s) => s.products));
  if (all.size >= 2) return "both";
  const [one] = [...all];
  return (one as ProductSlug) ?? "unset";
}

export function LandingFunnel() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [stores, setStores] = useState<Store[]>([]);
  const [zip, setZip] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [path, setPath] = useState<PathType>("skipped");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const utm = useUtm();
  const formLoadedAt = useRef<number>(0);
  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  async function handleZip(e: React.FormEvent) {
    e.preventDefault();
    setZipError(null);
    setLookingUp(true);
    try {
      const result = await findStores(zipInput);
      if (result.status === "invalid") {
        setZipError("Please enter a valid 5-digit zip code.");
        return;
      }
      if (result.status === "served") {
        setStores(result.stores);
        setZip(result.zip);
        setCity(result.stores[0]?.city ?? null);
        setPath("served");
        setPhase("served");
      } else {
        setZip(result.zip);
        setCity(null);
        setPath("unserved");
        setPhase("unserved");
      }
    } catch {
      setZipError("Something went wrong. Please try again.");
    } finally {
      setLookingUp(false);
    }
  }

  function handleSkip() {
    setZip(null);
    setCity(null);
    setPath("skipped");
    setPhase("unserved");
  }

  async function handleEmail({ email, consent, website }: EmailSubmit) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(API_ROUTE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          website,
          path,
          zip,
          matchedStore: stores[0]
            ? `Walmart #${stores[0].storeNumber}, ${stores[0].city}, ${stores[0].state}`
            : null,
          productInterest: phase === "served" ? productInterest(stores) : "unset",
          formLoadedAt: formLoadedAt.current,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          pageVariant: "scarcity_a",
          utm_source: utm.current.utm_source,
          utm_medium: utm.current.utm_medium,
          utm_campaign: utm.current.utm_campaign,
          utm_content: utm.current.utm_content,
          utm_term: utm.current.utm_term,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPhase("success");
      } else {
        setSubmitError(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="finder"
      className="bg-paper-2 scroll-mt-16 border-t border-line-soft"
    >
      <div className="mx-auto max-w-xl px-6 py-20">
        <div className="rounded-fig border border-line bg-paper p-7 sm:p-9 shadow-lift">
          {phase === "success" ? (
            <ConfirmationView path={path} city={city} zip={zip} />
          ) : (
            <>
              {/* Zip step — hidden once a path is chosen */}
              {phase === "idle" && (
                <form onSubmit={handleZip} noValidate>
                  <p className="eyebrow">Where are you sipping?</p>
                  <h2 className="font-display text-3xl sm:text-4xl mt-2">
                    Find Remix <em>near you.</em>
                  </h2>
                  <div className="mt-4 flex flex-col gap-2.5">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter your zip"
                      aria-label="Zip code"
                      value={zipInput}
                      invalid={!!zipError}
                      onChange={(e) => setZipInput(e.target.value)}
                    />
                    <Button type="submit" disabled={lookingUp} className="w-full">
                      {lookingUp ? (
                        <>
                          <Spinner /> Checking…
                        </>
                      ) : (
                        "Find Remix near me"
                      )}
                    </Button>
                  </div>
                  {zipError && (
                    <p role="alert" className="mt-2 text-sm text-error">
                      {zipError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-3 text-sm text-ink-light underline hover:text-coral"
                  >
                    Not sure / just browsing →
                  </button>
                </form>
              )}

              {/* Path A */}
              {phase === "served" && (
                <div className="animate-rise">
                  <StoreList stores={stores} city={city ?? "friend"} />
                  <SoldOutBanner />
                  <EmailCapture
                    heading="Want first dibs on the next drop?"
                    cta="Notify me when it drops"
                    submitting={submitting}
                    error={submitError}
                    onSubmit={handleEmail}
                  />
                </div>
              )}

              {/* Path B */}
              {phase === "unserved" && (
                <div className="animate-rise">
                  <p className="eyebrow mb-2">On the map</p>
                  <h2 className="font-display text-3xl sm:text-4xl">
                    Remix isn&apos;t in your neighborhood… <em>yet.</em>
                  </h2>
                  <p className="mt-3 text-ink-light">
                    Every zip on our list tells retailers where to send Remix
                    next. Add yours and you&apos;re officially demanding better
                    drinks{zip ? ` in ${zip}` : ""}.
                  </p>
                  <EmailCapture
                    heading="Put my zip on the map"
                    cta="Notify me when Remix arrives"
                    submitting={submitting}
                    error={submitError}
                    onSubmit={handleEmail}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
