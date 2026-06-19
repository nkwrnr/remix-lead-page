"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFunnel } from "@/components/redesign/useFunnel";
import { RedesignEmailForm } from "@/components/redesign/RedesignEmailForm";
import { StoreCards } from "@/components/redesign/StoreCards";
import { RemixImg } from "@/components/redesign/RemixImg";

const VARIANT = "redesign_drop_siren";

const STICKERS = [
  "🔥 Drops sell out fast",
  "✦ 0.0% ABV",
  "⚡ Under 20 cal",
  "🍃 Real juice",
  "💧 3g sugar",
  "★ 161 Walmart stores",
];

const lineVar = (i: number) => ({ ["--line-index"]: i }) as React.CSSProperties;

/** Behave-style attention engine: jiggle the target every few seconds. */
function useJiggle() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      el.classList.add("is-jiggling");
      setTimeout(() => el.classList.remove("is-jiggling"), 760);
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return ref;
}

export default function DropSirenPage() {
  const f = useFunnel(VARIANT);
  const jiggleRef = useJiggle();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div data-theme="drop-siren" className="rd-root" style={{ position: "relative" }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: scrolled ? "1px solid var(--rd-line-soft)" : "1px solid transparent",
          position: "sticky",
          top: 0,
          background: scrolled ? "color-mix(in srgb, var(--rd-bg) 85%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          zIndex: 30,
          transition: "background .25s, border-color .25s",
        }}
      >
        <div
          className="rd-shell"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}
        >
          <span className="rd-display" style={{ fontSize: "1.4rem", letterSpacing: "-0.03em", color: "var(--rd-citron)" }}>
            REMIX
          </span>
          <Link href="/redesign" className="rd-eyebrow" style={{ textDecoration: "none" }}>
            ← Redesign Lab
          </Link>
        </div>
      </header>

      {/* ── Hero (aurora) ───────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div className="ds-aurora" aria-hidden />
        <div
          className="rd-shell"
          style={{ position: "relative", zIndex: 1, paddingTop: 56, paddingBottom: 36, textAlign: "center" }}
        >
          <div
            ref={jiggleRef}
            className="ds-jiggle"
            style={{
              width: 168,
              margin: "0 auto 30px",
              background: "#fff",
              borderRadius: 20,
              padding: 10,
              boxShadow: "0 24px 60px -20px rgba(232,132,114,.6)",
            }}
          >
            <RemixImg
              src="/images/remix-paloma.png"
              alt="Remix Perfect Paloma"
              width={700}
              height={1500}
              priority
              style={{ width: "100%", borderRadius: 12 }}
              sizes="168px"
            />
          </div>
          <p className="rd-eyebrow" style={{ marginBottom: 18 }}>
            The drop is live · are you in?
          </p>
          <h1
            className="rd-display rd-reveal"
            style={{ fontSize: "clamp(2.9rem, 11vw, 6.5rem)", textTransform: "uppercase" }}
          >
            <span className="rd-line" style={lineVar(0)}>
              <span>Sold out</span>
            </span>
            <span className="rd-line" style={lineVar(1)}>
              <span>online.</span>
            </span>
            <span className="rd-line" style={lineVar(2)}>
              <span>
                Not on <em>you.</em>
              </span>
            </span>
          </h1>
          <p className="rd-lede" style={{ marginTop: 22, maxWidth: "40ch", marginInline: "auto" }}>
            Our drops vanish in record demand. Drop your zip — find out if the
            genie&apos;s got good news.
          </p>
        </div>

        {/* sticker marquee */}
        <div className="ds-marquee" style={{ position: "relative", zIndex: 1, paddingBottom: 30 }}>
          <div className="ds-marquee__track">
            {[...STICKERS, ...STICKERS].map((s, i) => (
              <span key={i} className="ds-sticker" style={{ ["--rotate"]: `${(i % 4) * 4 - 6}deg` } as React.CSSProperties}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zip funnel ──────────────────────────────────────────── */}
      <section
        id="finder"
        className="rd-shell rd-shell--narrow"
        style={{ position: "relative", zIndex: 1, paddingTop: 20, paddingBottom: 80 }}
      >
        {f.phase === "idle" && (
          <div className="rd-panel" style={{ padding: "32px 28px", background: "var(--rd-bg-2)" }}>
            <p className="rd-eyebrow">Drop your zip</p>
            <h2 className="rd-display" style={{ fontSize: "2.6rem", marginTop: 8, textTransform: "uppercase" }}>
              Are you <em>in?</em>
            </h2>
            <form
              onSubmit={f.handleZip}
              noValidate
              style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter your zip"
                aria-label="Zip code"
                aria-invalid={!!f.zipError}
                value={f.zipInput}
                onChange={(e) => f.setZipInput(e.target.value)}
                className="rd-field"
              />
              <button type="submit" disabled={f.lookingUp} className="rd-cta">
                {f.lookingUp ? "Checking…" : "Summon the drop ✦"}
              </button>
            </form>
            {f.zipError && (
              <p role="alert" className="mt-2" style={{ fontSize: "0.85rem", color: "#ffd9cf" }}>
                {f.zipError}
              </p>
            )}
            <button
              type="button"
              onClick={f.handleSkip}
              className="rd-textlink"
              style={{ marginTop: 14, fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer", color: "var(--rd-ink-soft)" }}
            >
              Not sure / just browsing →
            </button>
          </div>
        )}

        {/* SERVED — the melt */}
        {f.phase === "served" && (
          <div className="rd-panel" style={{ background: "var(--rd-bg-2)" }}>
            <div className="rd-meltbar">
              <span className="rd-badge">✦ You&apos;re in</span>
              <p className="rd-display" style={{ color: "#fff", fontSize: "1.9rem", marginTop: 14 }}>
                The genie found Remix near {f.city ?? "you"}.{" "}
                <span style={{ fontStyle: "italic" }}>Right around the corner.</span>
              </p>
            </div>
            <div style={{ padding: "22px 24px 28px" }}>
              <StoreCards stores={f.stores} />
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 10,
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid var(--rd-line)",
                }}
              >
                <p className="rd-display" style={{ fontSize: "1.2rem" }}>
                  P.S. — sold out <em>online.</em>
                </p>
                <p style={{ marginTop: 6, fontSize: "0.85rem", color: "var(--rd-ink-soft)" }}>
                  Our drops sell out fast. Sign up for first dibs on the next one.
                </p>
              </div>
              <RedesignEmailForm
                heading="Sign up for drop alerts"
                cta="Sign up"
                submitting={f.submitting}
                error={f.submitError}
                onSubmit={f.handleEmail}
                tone="dark"
              />
            </div>
          </div>
        )}

        {/* UNSERVED — the flip */}
        {f.phase === "unserved" && (
          <div className="rd-panel rd-flip" style={{ padding: "32px 28px" }}>
            <p className="rd-eyebrow">Be first when Remix arrives</p>
            <h2 className="rd-display" style={{ fontSize: "2.4rem", marginTop: 8, textTransform: "uppercase" }}>
              Remix hasn&apos;t reached you… <em>yet.</em>
            </h2>
            <p style={{ marginTop: 12, color: "rgba(255,255,255,.78)", lineHeight: 1.5 }}>
              Sold out online — our last drop went in record demand, and Walmart
              called dibs on the rest. Add your zip{f.zip ? ` (${f.zip})` : ""} and
              you&apos;re first in line when the next batch ships your way.
            </p>
            <RedesignEmailForm
              heading="Be first when Remix arrives"
              cta="Sign up"
              submitting={f.submitting}
              error={f.submitError}
              onSubmit={f.handleEmail}
              tone="dark"
            />
          </div>
        )}

        {/* SUCCESS */}
        {f.phase === "success" && (
          <div className="rd-panel rd-rise" style={{ padding: "44px 28px", textAlign: "center", background: "var(--rd-bg-2)" }}>
            <div style={{ width: 120, margin: "0 auto 22px", background: "#fff", borderRadius: 16, padding: 8 }}>
              <RemixImg
                src="/images/remix-paloma.png"
                alt="Remix Perfect Paloma"
                width={700}
                height={1500}
                style={{ width: "100%", borderRadius: 10 }}
                sizes="120px"
              />
            </div>
            <h2 className="rd-display" style={{ fontSize: "2.5rem", textTransform: "uppercase" }}>
              {f.path === "served" ? (
                <>Consider it <em>granted.</em></>
              ) : (
                <>You&apos;re <em>first in line.</em></>
              )}
            </h2>
            <p style={{ marginTop: 12, color: "var(--rd-ink-soft)" }}>
              {f.path === "served"
                ? "We'll ping you the second the next drop lands. ✨"
                : "Your zip is on record. The moment Remix reaches you, you're first to know. 🗺️"}
            </p>
          </div>
        )}
      </section>

      {/* ── Declaration ─────────────────────────────────────────── */}
      <section className="rd-shell" style={{ position: "relative", zIndex: 1, paddingBottom: 80 }}>
        <div
          style={{
            background: "var(--rd-citron)",
            color: "var(--rd-citron-ink)",
            borderRadius: "var(--rd-radius)",
            padding: "clamp(28px, 6vw, 52px)",
            textAlign: "center",
          }}
        >
          <p
            className="rd-display"
            style={{ fontSize: "clamp(1.7rem, 5vw, 3rem)", color: "var(--rd-citron-ink)", textTransform: "uppercase" }}
          >
            Big flavor. Clean ingredients.{" "}
            <span style={{ fontStyle: "italic" }}>Zero regrets.</span>
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--rd-line-soft)", position: "relative", zIndex: 1 }}>
        <div
          className="rd-shell"
          style={{
            paddingTop: 28,
            paddingBottom: 40,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            color: "var(--rd-ink-soft)",
            fontSize: "0.8rem",
          }}
        >
          <span className="rd-display" style={{ fontSize: "1.2rem", color: "var(--rd-citron)" }}>
            REMIX
          </span>
          <span>Redesign Lab · “Drop Siren” · not the live site</span>
        </div>
      </footer>
    </div>
  );
}
