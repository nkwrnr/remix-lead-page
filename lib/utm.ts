"use client";

import { useEffect, useRef } from "react";
import type { UtmParams } from "./types";

const EMPTY: UtmParams = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
};

/**
 * Reads UTM params from the URL once on mount and returns them via a stable ref
 * (never triggers re-renders). Read .current at submit time.
 */
export function useUtm(): React.RefObject<UtmParams> {
  const ref = useRef<UtmParams>({ ...EMPTY });
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    ref.current = {
      utm_source: p.get("utm_source"),
      utm_medium: p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
      utm_content: p.get("utm_content"),
      utm_term: p.get("utm_term"),
    };
  }, []);
  return ref;
}
