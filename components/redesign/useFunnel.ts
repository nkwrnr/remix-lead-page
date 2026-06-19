"use client";

import { useEffect, useRef, useState } from "react";
import { findStores } from "@/lib/zip-lookup";
import { useUtm } from "@/lib/utm";
import { API_ROUTE } from "@/lib/constants";
import type { PathType, ProductSlug, Store } from "@/lib/types";
import { tracking } from "@/lib/tracking";
import {
  getSessionId,
  rememberZip,
  recallZip,
  recordZipSubmit,
} from "@/lib/capture-client";

/**
 * Headless funnel logic shared by every redesign in the lab.
 *
 * This encapsulates the REAL zip-lookup + subscribe flow (identical behavior to
 * the live `LandingFunnel`/`GenieExperience`) so each redesign only has to write
 * its own markup + styling. Pass a distinct `pageVariant` so captured leads are
 * segmented per redesign in the leads DB.
 */

export type Phase = "idle" | "served" | "unserved" | "success";

export interface EmailSubmit {
  email: string;
  consent: boolean;
  website: string;
}

function productInterest(stores: Store[]): ProductSlug | "both" | "unset" {
  const all = new Set(stores.flatMap((s) => s.products));
  if (all.size >= 2) return "both";
  const [one] = [...all];
  return (one as ProductSlug) ?? "unset";
}

export function useFunnel(pageVariant: string) {
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
        rememberZip(result.zip);
        try { tracking.submitZip({ zip: result.zip, served: true }); } catch { /* non-blocking */ }
        recordZipSubmit({
          zip: result.zip,
          served: true,
          pageVariant,
          formLoadedAt: formLoadedAt.current,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          utm: utm.current,
        });
      } else {
        setZip(result.zip);
        setCity(null);
        setPath("unserved");
        setPhase("unserved");
        rememberZip(result.zip);
        try { tracking.submitZip({ zip: result.zip, served: false }); } catch { /* non-blocking */ }
        recordZipSubmit({
          zip: result.zip,
          served: false,
          pageVariant,
          formLoadedAt: formLoadedAt.current,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          utm: utm.current,
        });
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
          pageVariant,
          utm_source: utm.current.utm_source,
          utm_medium: utm.current.utm_medium,
          utm_campaign: utm.current.utm_campaign,
          utm_content: utm.current.utm_content,
          utm_term: utm.current.utm_term,
          sessionId: getSessionId(),
          capturedZip: recallZip(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setPhase("success");
        try { tracking.submitEmail({ email, zip, path }); } catch { /* non-blocking */ }
      } else {
        setSubmitError(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    phase,
    zipInput,
    setZipInput,
    zipError,
    lookingUp,
    handleZip,
    handleSkip,
    stores,
    zip,
    city,
    path,
    submitting,
    submitError,
    handleEmail,
  };
}
