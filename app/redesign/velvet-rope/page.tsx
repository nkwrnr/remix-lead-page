"use client";

import Link from "next/link";
import { useFunnel } from "@/components/redesign/useFunnel";
import { RedesignEmailForm } from "@/components/redesign/RedesignEmailForm";
import { StoreCards } from "@/components/redesign/StoreCards";
import { RemixImg } from "@/components/redesign/RemixImg";
import { NUTRITION_BADGES } from "@/lib/constants";

const VARIANT = "redesign_velvet_rope";

// helper to type the CSS custom property
const lineVar = (i: number) => ({ ["--line-index"]: i }) as React.CSSProperties;

export default function VelvetRopePage() {
  const f = useFunnel(VARIANT);

  return (
    <div data-theme="velvet-rope" className="rd-root">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid var(--rd-line-soft)",
          position: "sticky",
          top: 0,
          background: "color-mix(in srgb, var(--rd-bg) 88%, transparent)",
          backdropFilter: "blur(8px)",
          zIndex: 20,
        }}
      >
        <div
          className="rd-shell"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <span
            className="rd-display"
            style={{ fontSize: "1.4rem", letterSpacing: "-0.03em" }}
          >
            REMIX
          </span>
          <Link
            href="/redesign"
            className="rd-eyebrow"
            style={{ textDecoration: "none" }}
          >
            ← Redesign Lab
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="rd-shell" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <p className="rd-eyebrow" style={{ marginBottom: 22 }}>
          Big Flavor · Clean Ingredients · Zero Regrets
        </p>
        <h1
          className="rd-display rd-reveal"
          style={{ fontSize: "clamp(2.75rem, 9vw, 6rem)" }}
        >
          <span className="rd-line" style={lineVar(0)}>
            <span>Sold out online.</span>
          </span>
          <span className="rd-line" style={lineVar(1)}>
            <span>
              Not sold out <em>on&nbsp;you.</em>
            </span>
          </span>
        </h1>
        <p className="rd-lede" style={{ marginTop: 24, maxWidth: "46ch" }}>
          Our drops vanish fast. But there&apos;s a list — and a velvet rope.
          Drop your zip and find out if you&apos;re in.
        </p>

        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NUTRITION_BADGES.map((b) => (
            <span
              key={b}
              className="rd-chip"
              style={{ fontSize: "0.78rem", padding: "6px 12px" }}
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* ── The velvet rope (zip funnel) ────────────────────────── */}
      <section
        id="finder"
        className="rd-shell rd-shell--narrow"
        style={{ paddingTop: 24, paddingBottom: 88 }}
      >
        {f.phase === "idle" && (
          <div className="rd-panel" style={{ padding: "32px 28px" }}>
            <p className="rd-eyebrow">The velvet rope</p>
            <h2 className="rd-display" style={{ fontSize: "2.5rem", marginTop: 8 }}>
              Are you <em>in?</em>
            </h2>
            <p className="rd-lede" style={{ marginTop: 10, fontSize: "1rem" }}>
              Enter your zip. If Remix is near you, the rope drops.
            </p>
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
                {f.lookingUp ? "Checking…" : "See if I'm in →"}
              </button>
            </form>
            {f.zipError && (
              <p role="alert" className="mt-2" style={{ fontSize: "0.85rem", color: "var(--rd-ember)" }}>
                {f.zipError}
              </p>
            )}
            <button
              type="button"
              onClick={f.handleSkip}
              className="rd-textlink"
              style={{ marginTop: 14, fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer" }}
            >
              Not sure / just browsing →
            </button>
          </div>
        )}

        {/* SERVED — the melt */}
        {f.phase === "served" && (
          <div className="rd-panel">
            <div className="rd-meltbar">
              <span className="rd-badge">✦ You&apos;re in</span>
              <p
                className="rd-display"
                style={{ color: "#fff", fontSize: "1.9rem", marginTop: 14 }}
              >
                Good news, {f.city ?? "friend"} — Remix is{" "}
                <span style={{ fontStyle: "italic" }}>right around the corner.</span>
              </p>
            </div>
            <div style={{ padding: "22px 24px 28px" }}>
              <StoreCards stores={f.stores} />
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 10,
                  background: "var(--rd-bg-2)",
                  border: "1px solid var(--rd-line)",
                }}
              >
                <p className="rd-display" style={{ fontSize: "1.2rem" }}>
                  Our online drops sell out <em>on purpose.</em>
                </p>
                <p style={{ marginTop: 6, fontSize: "0.85rem", color: "var(--rd-ink-soft)" }}>
                  Small batches, gone fast. Get on the list and we&apos;ll ping you
                  the second the next one lands.
                </p>
              </div>
              <RedesignEmailForm
                heading="Want first dibs on the next drop?"
                cta="Notify me when it drops"
                submitting={f.submitting}
                error={f.submitError}
                onSubmit={f.handleEmail}
              />
            </div>
          </div>
        )}

        {/* UNSERVED — the flip */}
        {f.phase === "unserved" && (
          <div className="rd-panel rd-flip" style={{ padding: "32px 28px" }}>
            <p className="rd-eyebrow">On the list</p>
            <h2 className="rd-display" style={{ fontSize: "2.3rem", marginTop: 8 }}>
              Not in your city… <em>yet.</em>
            </h2>
            <p style={{ marginTop: 12, color: "rgba(255,255,255,.78)", lineHeight: 1.5 }}>
              Every zip on our list tells retailers where to send Remix next. Add
              yours {f.zip ? `(${f.zip}) ` : ""}and you&apos;re officially first in
              line when the rope drops in your neighborhood.
            </p>
            <RedesignEmailForm
              heading="Put my zip on the map"
              cta="Notify me when Remix arrives"
              submitting={f.submitting}
              error={f.submitError}
              onSubmit={f.handleEmail}
              tone="dark"
            />
          </div>
        )}

        {/* SUCCESS */}
        {f.phase === "success" && (
          <div className="rd-panel rd-rise" style={{ padding: "40px 28px", textAlign: "center" }}>
            <div style={{ width: 110, margin: "0 auto 22px", background: "var(--rd-bg-2)", borderRadius: 16, padding: 8 }}>
              <RemixImg
                src="/images/remix-paloma.png"
                alt="Remix Perfect Paloma"
                width={700}
                height={1500}
                style={{ width: "100%", borderRadius: 10 }}
                sizes="110px"
              />
            </div>
            <h2 className="rd-display" style={{ fontSize: "2.4rem" }}>
              {f.path === "served" ? (
                <>You&apos;re <em>in.</em></>
              ) : (
                <>Officially <em>on the map.</em></>
              )}
            </h2>
            <p style={{ marginTop: 12, color: "var(--rd-ink-soft)" }}>
              {f.path === "served"
                ? "We'll ping you the second the next drop lands. Now go grab a Paloma. 🥂"
                : "Your zip is on record. The moment Remix reaches you, you'll be first to know. 🗺️"}
            </p>
          </div>
        )}
      </section>

      {/* ── Declaration ─────────────────────────────────────────── */}
      <section className="rd-shell" style={{ paddingBottom: 88 }}>
        <div
          style={{
            background: "var(--rd-coral)",
            color: "var(--rd-on-coral)",
            borderRadius: "var(--rd-radius)",
            padding: "clamp(28px, 6vw, 56px)",
          }}
        >
          <p
            className="rd-display"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", color: "var(--rd-on-coral)" }}
          >
            Big flavor. Clean ingredients.{" "}
            <span style={{ fontStyle: "italic" }}>Zero regrets.</span>
          </p>
          <p
            style={{
              marginTop: 16,
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(42,13,5,.7)",
              fontWeight: 700,
            }}
          >
            0.0% ABV · Under 20 cal · 3g sugar · Real juice · In 161 Walmart stores
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--rd-line-soft)" }}>
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
          <span className="rd-display" style={{ fontSize: "1.2rem", color: "var(--rd-ink)" }}>
            REMIX
          </span>
          <span>Redesign Lab · “Velvet Rope” · not the live site</span>
        </div>
      </footer>
    </div>
  );
}
