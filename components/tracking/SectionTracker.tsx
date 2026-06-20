"use client";

/**
 * SectionTracker — fires `tracking.sectionView` exactly once when a page section
 * first scrolls into view. This is how we answer "what are users (especially on
 * mobile) NOT scrolling down to": a `section_viewed` funnel broken down by
 * `$device_type` shows where people drop off.
 *
 * Implementation is deliberately lean and non-invasive: it renders a single
 * zero-height, aria-hidden sentinel and observes it with one `IntersectionObserver`.
 * Drop one at the top of each section you want in the scroll funnel:
 *
 *   <section className="cd-section">
 *     <SectionTracker section="reviews" index={6} />
 *     …
 *   </section>
 */

import { useEffect, useRef } from "react";
import { tracking } from "@/lib/tracking";
import type { Section } from "@/lib/tracking/types";

export interface SectionTrackerProps {
  section: Section;
  /** 0-based order on the page (for ordering the scroll funnel). */
  index?: number;
}

export function SectionTracker({ section, index }: SectionTrackerProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            tracking.sectionView({
              section,
              index,
              // performance.now() is ms since navigation start — exactly "seconds
              // into the visit this section was reached".
              secondsSinceLoad:
                typeof performance !== "undefined"
                  ? Math.round(performance.now() / 1000)
                  : undefined,
            });
            observer.disconnect();
          }
        }
      },
      // Fire when the section is ~15% into the viewport (a real "look", not a
      // 1px graze at the very bottom edge).
      { rootMargin: "0px 0px -15% 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [section, index]);

  return <div ref={ref} aria-hidden="true" style={{ height: 0 }} />;
}
