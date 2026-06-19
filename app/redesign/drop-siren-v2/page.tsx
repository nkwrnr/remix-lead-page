"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useFunnel } from "@/components/redesign/useFunnel";
import { RedesignEmailForm } from "@/components/redesign/RedesignEmailForm";
import { StoreCards } from "@/components/redesign/StoreCards";
import { RemixImg } from "@/components/redesign/RemixImg";

const VARIANT = "redesign_drop_siren_v2";

const STICKERS = [
  "🔥 Drops sell out fast",
  "✦ 0.0% ABV",
  "⚡ Under 20 cal",
  "🍃 Real juice",
  "💧 3g sugar",
  "★ 161 Walmart stores",
];

const CALLOUTS = [
  { variant: "citron", tab: "👅", head: "Sip it straight.", sub: "Because it's good as AF.", rot: "-3deg" },
  { variant: "coral", tab: "🍹", head: "Mix it with anything.", sub: "Because it's healthy. It makes drinks better, and it makes hangovers hurt less.", rot: "2deg" },
  { variant: "navy", tab: "🥂", head: "Cheers, no catch.", sub: "Zero proof. Under 20 calories. The non-alcoholic mocktail for everyone.", rot: "-2deg" },
] as const;

const BATTLE_ROWS = [
  { label: "Sugar", remix: "3g, real juice", other: "Loads of it" },
  { label: "Calories", remix: "Under 20", other: "Way more" },
  { label: "Proof", remix: "0.0% — stay sharp", other: "Wrecks tomorrow" },
  { label: "Electrolytes", remix: "Naturally hydrating", other: "Dehydrating" },
  { label: "Taste", remix: "Bold + balanced", other: "Sugary or fake" },
];

const lineVar = (i: number) => ({ ["--line-index"]: i }) as React.CSSProperties;

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

const Check = () => (
  <svg className="bc__ic" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path fill="#2faa4d" d="M9.5 17.2 4.8 12.5l1.7-1.7 3 3 7-7 1.7 1.7z" />
  </svg>
);
const Cross = () => (
  <svg className="bc__ic" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path fill="#e23b2a" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 6.3 17.7 4.9 16.3 11.2 10 4.9 3.7 6.3 2.3 10.6 6.6z" />
  </svg>
);

function SuccessSparkles() {
  const bits = Array.from({ length: 10 });
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {bits.map((_, i) => (
        <span
          key={i}
          className="animate-sparkle"
          style={{
            position: "absolute",
            top: 0,
            left: `${(i * 9 + 6) % 95}%`,
            width: 9,
            height: 9,
            borderRadius: 2,
            background: i % 2 ? "var(--rd-citron)" : "var(--rd-coral)",
            animationDelay: `${(i % 5) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function DropSirenV2Page() {
  const f = useFunnel(VARIANT);
  const jiggleRef = useJiggle();

  return (
    <div data-theme="drop-siren-v2" className="rd-root">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "color-mix(in srgb, var(--rd-bg) 86%, transparent)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--rd-line-soft)",
        }}
      >
        <div className="rd-shell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <span className="rd-display" style={{ fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--rd-ember)" }}>
            REMIX
          </span>
          <Link href="/redesign" className="rd-eyebrow" style={{ textDecoration: "none" }}>
            ← Redesign Lab
          </Link>
        </div>
      </header>

      {/* ── Hero (bright wash, dancing can + slapped sticker) ────── */}
      <section className="ds2-hero" style={{ overflow: "hidden" }}>
        <div className="rd-shell" style={{ paddingTop: 48, paddingBottom: 28 }}>
          <div className="ds2-herogrid">
            <div>
              <p className="rd-eyebrow" style={{ marginBottom: 18 }}>
                The drop is live · are you in?
              </p>
              <h1 className="rd-display rd-reveal" style={{ fontSize: "clamp(2.9rem, 9.5vw, 5.8rem)", textTransform: "uppercase" }}>
                <span className="rd-line" style={lineVar(0)}><span>Sold out</span></span>
                <span className="rd-line" style={lineVar(1)}><span>online.</span></span>
                <span className="rd-line" style={lineVar(2)}><span>Not on <em>you.</em></span></span>
              </h1>
              <p className="rd-lede" style={{ marginTop: 20, maxWidth: "36ch" }}>
                Our drops vanish in record demand. Drop your zip below and find out
                if Remix is already waiting for you.
              </p>
            </div>

            {/* dancing can in a sticker-style tile with a slapped-on sticker */}
            <div style={{ position: "relative", justifySelf: "center", width: "min(76%, 260px)" }}>
              <div
                ref={jiggleRef}
                className="ds-jiggle"
                style={{
                  background: "#fff",
                  borderRadius: 22,
                  padding: "16px 16px 8px",
                  border: "4px solid #fff",
                  boxShadow: "10px 16px 0 -2px rgba(28,18,8,.14), 0 30px 60px -24px rgba(239,91,60,.5)",
                }}
              >
                <RemixImg
                  src="/images/remix-paloma.png"
                  alt="Remix Perfect Paloma"
                  width={700}
                  height={1500}
                  priority
                  style={{ width: "100%", display: "block" }}
                  sizes="(max-width:640px) 76vw, 260px"
                />
              </div>
              <span
                className="sticker-slap"
                style={{ position: "absolute", bottom: 18, right: -6, transform: "rotate(8deg)", background: "var(--rd-coral)", color: "#fff" }}
              >
                Good as AF
              </span>
            </div>
          </div>
        </div>

        {/* sticker marquee */}
        <div className="ds-marquee" style={{ paddingBottom: 26 }}>
          <div className="ds-marquee__track">
            {[...STICKERS, ...STICKERS].map((s, i) => (
              <span key={i} className="ds-sticker" style={{ ["--rotate"]: `${(i % 4) * 4 - 6}deg` } as React.CSSProperties}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE LOUD VIBRANT STORE FINDER ───────────────────────── */}
      <section id="finder" className="rd-shell" style={{ paddingTop: 8, paddingBottom: 60 }}>
        <div className="ds2-finder">
          {f.phase === "idle" && (
            <>
              <p className="rd-eyebrow">📍 Store finder</p>
              <h2 className="rd-display" style={{ fontSize: "clamp(2.2rem, 7vw, 3.6rem)", marginTop: 8, textTransform: "uppercase" }}>
                Everyone&apos;s in. <em>Are you?</em>
              </h2>
              <p className="rd-lede" style={{ marginTop: 8, maxWidth: "32ch" }}>
                Drop your zip. If Remix is near you, you&apos;ll know in a second.
              </p>
              <form onSubmit={f.handleZip} noValidate style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12, maxWidth: 460 }}>
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
                  {f.lookingUp ? "Checking…" : "Find Remix near me →"}
                </button>
              </form>
              {f.zipError && (
                <p role="alert" style={{ marginTop: 8, fontWeight: 700, color: "var(--rd-ink-dark)" }}>{f.zipError}</p>
              )}
              <button
                type="button"
                onClick={f.handleSkip}
                className="rd-textlink"
                style={{ marginTop: 14, fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer" }}
              >
                Not sure / just browsing →
              </button>
            </>
          )}

          {/* SERVED — melt (panel is light here) */}
          {f.phase === "served" && (
            <div className="rd-panel" style={{ maxWidth: 560, margin: "0 auto" }}>
              <div className="rd-meltbar">
                <span className="rd-badge">✦ You&apos;re in</span>
                <p className="rd-display" style={{ color: "#fff", fontSize: "1.9rem", marginTop: 14 }}>
                  Remix is near {f.city ?? "you"}.{" "}
                  <span style={{ fontStyle: "italic" }}>Right around the corner.</span>
                </p>
              </div>
              <div style={{ padding: "22px 24px 28px" }}>
                <StoreCards stores={f.stores} />
                <RedesignEmailForm
                  heading="Sign up for drop alerts"
                  cta="Sign up"
                  submitting={f.submitting}
                  error={f.submitError}
                  onSubmit={f.handleEmail}
                  tone="light"
                />
              </div>
            </div>
          )}

          {/* UNSERVED — flip to navy */}
          {f.phase === "unserved" && (
            <div className="rd-panel rd-flip" style={{ maxWidth: 560, margin: "0 auto", padding: "32px 28px" }}>
              <p className="rd-eyebrow">Be first when Remix arrives</p>
              <h2 className="rd-display" style={{ fontSize: "2.2rem", marginTop: 8, textTransform: "uppercase" }}>
                Not your city… <em>yet.</em>
              </h2>
              <p style={{ marginTop: 12, color: "rgba(255,255,255,.78)", lineHeight: 1.5 }}>
                Sold out online, and Walmart called dibs on the rest. Add your zip
                {f.zip ? ` (${f.zip})` : ""} and you&apos;re first in line when the next
                batch ships your way.
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
            <div className="rd-panel rd-rise" style={{ position: "relative", maxWidth: 560, margin: "0 auto", padding: "40px 28px 44px", textAlign: "center" }}>
              <SuccessSparkles />
              <div style={{ position: "relative", width: 92, margin: "0 auto 18px" }}>
                <RemixImg src="/images/remix-paloma.png" alt="Remix Perfect Paloma" width={700} height={1500} style={{ width: "100%" }} sizes="92px" />
              </div>
              <h2 className="rd-display" style={{ fontSize: "2.4rem", textTransform: "uppercase" }}>
                {f.path === "served" ? <>You&apos;re <em>in.</em></> : <>First <em>in line.</em></>}
              </h2>
              <p style={{ marginTop: 12, color: "var(--rd-ink-soft)" }}>
                {f.path === "served"
                  ? "We'll ping you the second the next drop lands. ✨"
                  : "Your zip is on record. The moment Remix reaches you, you're first to know. 🗺️"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Punchy STICKER callouts ─────────────────────────────── */}
      <section className="rd-shell" style={{ paddingBottom: 60 }}>
        <p className="rd-eyebrow" style={{ marginBottom: 24 }}>Why people are obsessed</p>
        <div className="qc-grid">
          {CALLOUTS.map((c) => (
            <div
              key={c.head}
              className={`qc-sticker ${c.variant === "coral" ? "qc-sticker--coral" : c.variant === "navy" ? "qc-sticker--navy" : ""}`}
              style={{ ["--rot"]: c.rot } as React.CSSProperties}
            >
              <span className="qc-sticker__tab" aria-hidden>{c.tab}</span>
              <p className="qc-sticker__head">{c.head}</p>
              <p className="qc-sticker__sub">{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Battle card — split down the middle ─────────────────── */}
      <section className="rd-shell" style={{ paddingBottom: 64, maxWidth: 720 }}>
        <h2 className="rd-display" style={{ fontSize: "clamp(2rem, 6vw, 3rem)", textAlign: "center", marginBottom: 24, textTransform: "uppercase" }}>
          Remix <em>vs.</em> the others
        </h2>
        <div className="bc">
          <div className="bc__head">
            <div className="bc__side bc__side--win">
              <span className="bc__badge bc__badge--win">Remix 👍</span>
              <div className="bc__imgwrap">
                <RemixImg src="/images/remix-mojito.png" alt="Remix Muddled Berry Mojito" width={700} height={1500} style={{ width: "100%" }} sizes="96px" />
              </div>
            </div>
            <div className="bc__side">
              <span className="bc__badge bc__badge--lose">Others 👎</span>
              <div className="bc__imgwrap--lose" aria-hidden>🥤</div>
            </div>
          </div>
          {BATTLE_ROWS.map((r) => (
            <div className="bc__row" key={r.label}>
              <div className="bc__cell bc__cell--win"><Check />{r.remix}</div>
              <span className="bc__label">{r.label}</span>
              <div className="bc__cell bc__cell--lose">{r.other}<Cross /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Declaration ─────────────────────────────────────────── */}
      <section className="rd-shell" style={{ paddingBottom: 72 }}>
        <div style={{ background: "var(--rd-citron)", color: "var(--rd-citron-ink)", borderRadius: "var(--rd-radius)", padding: "clamp(28px, 6vw, 52px)", textAlign: "center", border: "4px solid #fff", boxShadow: "10px 14px 0 -2px rgba(28,18,8,.16)" }}>
          <p className="rd-display" style={{ fontSize: "clamp(1.7rem, 5vw, 3rem)", color: "var(--rd-citron-ink)", textTransform: "uppercase" }}>
            Big flavor. Clean ingredients. <span style={{ fontStyle: "italic" }}>Zero regrets.</span>
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--rd-line-soft)" }}>
        <div className="rd-shell" style={{ paddingTop: 28, paddingBottom: 40, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, color: "var(--rd-ink-soft)", fontSize: "0.8rem" }}>
          <span className="rd-display" style={{ fontSize: "1.2rem", color: "var(--rd-ember)" }}>REMIX</span>
          <span>Redesign Lab · “Drop Siren” v2 — Relentless · not the live site</span>
        </div>
      </footer>
    </div>
  );
}
