"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmailCapture, type EmailSubmit } from "@/components/landing/EmailCapture";
import { StoreList } from "@/components/landing/PathA";
import { Genie, SpeechBubble } from "./Genie";
import { Sparkles } from "./Sparkles";
import { findStores } from "@/lib/zip-lookup";
import { useUtm } from "@/lib/utm";
import { API_ROUTE } from "@/lib/constants";
import type { PathType, ProductSlug, Store } from "@/lib/types";
import { tracking } from "@/lib/tracking";
import { SectionTracker } from "@/components/tracking/SectionTracker";

type Phase = "idle" | "summoning" | "served" | "unserved" | "success";

function productInterest(stores: Store[]): ProductSlug | "both" | "unset" {
  const all = new Set(stores.flatMap((s) => s.products));
  if (all.size >= 2) return "both";
  return (([...all][0] as ProductSlug) ?? "unset");
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function GenieExperience() {
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
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  function revealScroll() {
    // bring the genie stage into view so the reveal animation is seen
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleZip(e: React.FormEvent) {
    e.preventDefault();
    setZipError(null);
    setLookingUp(true);
    try {
      const result = await findStores(zipInput);
      if (result.status === "invalid") {
        setZipError("Please enter a valid 5-digit zip code.");
        setLookingUp(false);
        try {
          tracking.zipSubmitFailed({
            reason: zipInput.trim() === "" ? "empty" : "invalid_format",
            zipAttempted: zipInput,
          });
        } catch { /* non-blocking */ }
        return;
      }
      // play the summon animation before the reveal
      setPhase("summoning");
      revealScroll();
      await delay(750);
      if (result.status === "served") {
        setStores(result.stores);
        setZip(result.zip);
        setCity(result.stores[0]?.city ?? null);
        setPath("served");
        setPhase("served");
        try {
          tracking.submitZip({
            zip: result.zip,
            served: true,
            storeCount: result.stores.length,
            city: result.stores[0]?.city ?? null,
            state: result.stores[0]?.state ?? null,
          });
        } catch { /* non-blocking */ }
      } else {
        setZip(result.zip);
        setPath("unserved");
        setPhase("unserved");
        try {
          tracking.submitZip({ zip: result.zip, served: false });
        } catch { /* non-blocking */ }
      }
    } catch {
      setZipError("Something went wrong. Please try again.");
      setPhase("idle");
    } finally {
      setLookingUp(false);
    }
  }

  async function handleEmail({ email, consent, website }: EmailSubmit) {
    setSubmitting(true);
    setSubmitError(null);
    const matchedStore = stores[0]
      ? `Walmart #${stores[0].storeNumber}, ${stores[0].city}, ${stores[0].state}`
      : null;
    const interest = path === "served" ? productInterest(stores) : "unset";
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
          matchedStore,
          productInterest: interest,
          formLoadedAt: formLoadedAt.current,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          pageVariant: "genie_v2",
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
        try {
          tracking.submitEmail({
            email,
            zip,
            path,
            source: "inline",
            served: path === "served",
            matchedStore,
            productInterest: interest,
          });
        } catch { /* non-blocking */ }
      } else {
        setSubmitError(json.message || "Something went wrong. Please try again.");
        try {
          tracking.emailSubmitFailed({
            reason: res.status === 429 ? "rate_limited" : res.status >= 500 ? "server_error" : "validation",
            email,
            path,
            source: "inline",
            zip,
          });
        } catch { /* non-blocking */ }
      }
    } catch {
      setSubmitError("Network error. Please try again.");
      try {
        tracking.emailSubmitFailed({ reason: "network", email, path, source: "inline", zip });
      } catch { /* non-blocking */ }
    } finally {
      setSubmitting(false);
    }
  }

  const genieUp = phase === "served" || phase === "unserved" || phase === "success";

  return (
    <section
      id="finder"
      className="relative overflow-hidden bg-paper scroll-mt-16"
    >
      <SectionTracker section="zip_finder" index={0} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 85% 6%, rgba(232,132,114,.20), transparent 60%), radial-gradient(800px 520px at 5% 96%, rgba(233,224,52,.16), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-xl px-6 pt-14 pb-20 text-center">
        {/* eyebrow + headline (idle only) */}
        {phase === "idle" && (
          <>
            <p className="eyebrow mb-5">Make a wish</p>
            <h1 className="font-display text-ink text-[2.5rem] leading-[0.98] sm:text-6xl">
              Find your <em>Remix.</em>
            </h1>
            <p className="lede mx-auto mt-5 max-w-[34ch]">
              Rub the lamp. Drop your zip. See if the genie&apos;s got good news.
            </p>
          </>
        )}

        {/* ── The stage: genie above, lamp/orb below ── */}
        <div
          ref={stageRef}
          className="relative mx-auto mt-8 flex h-72 w-full max-w-sm items-end justify-center scroll-mt-20"
        >
          {/* speech bubble */}
          {genieUp && (
            <div className="animate-bubble absolute left-1/2 top-0 z-20 w-[15rem] -translate-x-1/2">
              <SpeechBubble>
                <span className="font-display text-lg">
                  In your zip code <span className="text-ember">{zip}</span>…
                </span>
              </SpeechBubble>
            </div>
          )}

          {/* genie */}
          {genieUp && (
            <div className="animate-genie absolute bottom-6 left-1/2 z-10 h-60 w-60 -translate-x-1/2">
              <div className="animate-sway h-full w-full origin-bottom">
                <Genie />
              </div>
            </div>
          )}

          {/* smoke puff during summon */}
          {phase === "summoning" && (
            <div
              aria-hidden
              className="animate-smoke absolute bottom-10 left-1/2 z-10 h-24 w-24 -translate-x-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(232,132,114,.6), transparent 70%)" }}
            />
          )}

          {/* lamp = the vessel orb */}
          <div
            className={`vessel relative z-0 h-20 w-20 transition-transform duration-500 ${
              phase === "summoning" ? "scale-110" : ""
            }`}
            aria-hidden
          />
        </div>

        {/* ── State content below the stage ── */}
        <div className="mt-6">
          {phase === "idle" && (
            <form onSubmit={handleZip} noValidate className="mx-auto max-w-sm">
              <div className="flex flex-col gap-2.5">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter your zip"
                  aria-label="Zip code"
                  value={zipInput}
                  invalid={!!zipError}
                  onChange={(e) => setZipInput(e.target.value)}
                  className="text-center"
                />
                <Button type="submit" disabled={lookingUp} className="w-full">
                  {lookingUp ? (
                    <>
                      <Spinner /> Summoning…
                    </>
                  ) : (
                    "Summon Remix ✨"
                  )}
                </Button>
              </div>
              {zipError && (
                <p role="alert" className="mt-2 text-sm text-error">
                  {zipError}
                </p>
              )}
            </form>
          )}

          {phase === "summoning" && (
            <p className="font-display text-xl text-ink-light">Summoning the genie…</p>
          )}

          {phase === "served" && (
            <div className="animate-rise relative mx-auto max-w-md">
              <Sparkles />
              <h2 className="font-display text-3xl sm:text-4xl">
                You&apos;re one of the <em>lucky few.</em> ✨
              </h2>
              <p className="mt-2 text-ink-light">The genie found Remix near you.</p>

              <div className="stagger mt-6 text-left">
                <StoreList stores={stores} city={city ?? "friend"} />
              </div>

              <div className="mt-5 rounded-fig bg-paper-2 border border-line p-4 text-left">
                <p className="text-sm text-ink-light">
                  <span className="font-semibold text-ink">P.S. — sold out online.</span>{" "}
                  Our drops sell out fast. Sign up for first dibs on the next one.
                </p>
              </div>

              <div className="text-left">
                <EmailCapture
                  heading="Sign up for drop alerts"
                  cta="Sign up"
                  ctaClassName="animate-cta"
                  submitting={submitting}
                  error={submitError}
                  onSubmit={handleEmail}
                />
              </div>
            </div>
          )}

          {phase === "unserved" && (
            <div className="animate-rise mx-auto max-w-md">
              <h2 className="font-display text-3xl sm:text-4xl">
                Remix hasn&apos;t reached you… <em>yet.</em>
              </h2>
              <div className="mt-4 rounded-fig bg-paper-2 border border-line p-5 text-left">
                <p className="font-display text-lg">Sold out online.</p>
                <p className="mt-2 text-sm text-ink-light leading-relaxed">
                  Our last online drop sold out in record demand — and Walmart called
                  dibs on the rest. We&apos;re brewing new batches that ship nationwide,
                  and bringing Remix to more places. Sign up and you&apos;re first to know.
                </p>
              </div>
              <div className="text-left">
                <EmailCapture
                  heading="Be first when Remix arrives"
                  cta="Sign up"
                  ctaClassName="animate-cta"
                  submitting={submitting}
                  error={submitError}
                  onSubmit={handleEmail}
                />
              </div>
            </div>
          )}

          {phase === "success" && (
            <div className="animate-rise relative mx-auto max-w-md">
              <Sparkles />
              <h2 className="font-display text-3xl sm:text-4xl">
                {path === "served" ? (
                  <>Consider it <em>granted.</em></>
                ) : (
                  <>You&apos;re <em>first in line.</em></>
                )}
              </h2>
              <p className="mt-3 text-ink-light">
                {path === "served"
                  ? "We'll ping you the moment the next drop lands. Now go grab a can. 🥂"
                  : "The genie wrote down your zip. The second Remix reaches you, you'll know. 🗺️"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
