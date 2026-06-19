"use client";

import { useEffect, useState } from "react";

/**
 * Sticky "Don't miss the next drop" disco button for /redesign/chrome-drop.
 * Reveals once the user scrolls past the hero (~1.3× viewport) and hides near
 * the footer. Styling (rotating holo border + shimmer) lives in redesign.css
 * under .cd-dropsticky; opens the shared NextDropModal via onOpen.
 */
export function StickyDropCta({ onOpen }: { onOpen: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const nearBottom = y + vh > docH - 220;
      setShow(y > vh * 1.3 && !nearBottom);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={`cd-dropsticky${show ? " cd-dropsticky--show" : ""}`}
      onClick={onOpen}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      ✦ Don&apos;t miss the next drop
    </button>
  );
}
