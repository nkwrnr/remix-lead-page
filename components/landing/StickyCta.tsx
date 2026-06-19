"use client";

import { useEffect, useState } from "react";

export function StickyCta() {
  // The sticky CTA only exists to jump to the finder — hide it once the finder
  // (and its result/email states) is on screen so it never overlaps the form.
  const [show, setShow] = useState(false);

  useEffect(() => {
    const finder = document.getElementById("finder");
    if (!finder) return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0.12 },
    );
    io.observe(finder);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 p-3 sm:hidden transition-opacity duration-200 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <a
        href="#finder"
        className="pointer-events-auto mx-auto flex max-w-md items-center justify-center gap-2 rounded-pill bg-coral px-6 py-3.5 text-base font-bold text-white shadow-lift"
      >
        Find Remix near me
      </a>
    </div>
  );
}
