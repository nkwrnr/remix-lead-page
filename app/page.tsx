"use client";

import Link from "next/link";
import { useState } from "react";
import { useFunnel } from "@/components/redesign/useFunnel";
import { RedesignEmailForm } from "@/components/redesign/RedesignEmailForm";
import { StoreCards } from "@/components/redesign/StoreCards";
import { RemixImg } from "@/components/redesign/RemixImg";
import { NextDropModal } from "@/components/redesign/NextDropModal";
import { StickyDropCta } from "@/components/redesign/StickyDropCta";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import { SectionTracker } from "@/components/tracking/SectionTracker";
import { tracking } from "@/lib/tracking";
import type { ModalSource } from "@/lib/tracking/types";
import { AREA_FACTS, FALLBACK_FACTS } from "@/lib/area-facts";
import "./redesign/redesign.css";

const scrollToTop = () =>
  window.scrollTo({ top: 0, behavior: "smooth" });

/**
 * Chrome Drop — "Liquid Chrome Hype" — production live page.
 * Drop-culture / hypebeast: lifestyle-photo hero, liquid-chrome display type,
 * holographic accents, die-cut stickers, the zip check as a "drop unlock".
 * Real funnel logic via useFunnel. See /redesign/chrome-drop for the lab reference.
 */

// Live homepage tag — distinct from the frozen lab snapshot ("redesign_chrome_drop")
// so real conversions are separable from internal lab views in leads/captures/pixel data.
const VARIANT = "chrome_drop_live";

const TICKER = [
  "0.0% ABV",
  "Under 20 cal",
  "3g sugar",
  "Real juice",
  "Electrolytes",
  "Vegan + GF",
  "New online drop in days",
  "161 Walmart stores",
];

// Retro 8-bit stock-exchange ticker that fills the finder↔hero gap (see .cd-newsbar).
// Terse, board-style, uppercase; ▲ glyphs (not emoji). Lead = the drop.
const NEWS = [
  "REMIX DROPPING AT WALMART AHEAD OF THE FOURTH OF JULY — CHECK STORES NOW",
  "RMX ▲ 161 STORES",
  "ONLINE: NEW DROP IN DAYS ▲ DEMAND HIGH",
];

/* ── Inline icons (currentColor) — lifted from the lab icon set ──────────── */
const Leaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
  </svg>
);
const Bolt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);
const Drop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 2.7S5.5 9.4 5.5 14a6.5 6.5 0 0 0 13 0C18.5 9.4 12 2.7 12 2.7Z" />
  </svg>
);
const Cube = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);
const Clink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M8 22h8M7 10h10M12 15v7M5 3l3.5 7M19 3l-3.5 7M5 3h14" />
  </svg>
);
const X = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);
const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9 6.2 20.9l1.1-6.47L2.6 9.85l6.5-.95L12 2.5Z" />
  </svg>
);
const Stars = () => (
  <span className="cd-stars" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
  </span>
);
const Check = () => (
  <svg className="cd-vs__ic" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path fill="#5fe3a1" d="M9.5 17.2 4.8 12.5l1.7-1.7 3 3 7-7 1.7 1.7z" />
  </svg>
);

/* Body content (copy is placeholder per the brand — final copy in progress) */
const BENEFITS = [
  { icon: <Leaf />, label: "Real Juice" },
  { icon: <Leaf />, label: "Natural Ingredients" },
  { icon: <Bolt />, label: "Electrolytes Added" },
  { icon: <Drop />, label: "Under 20 Calories" },
  { icon: <Cube />, label: "3g Sugar" },
  { icon: <Clink />, label: "Sip It or Spike It" },
];

const TABLE = [
  { feat: "Juice", remix: "Real fruit juice", other: "Artificial flavoring" },
  { feat: "Sugar", remix: "Just 3g", other: "20g+ sugar" },
  { feat: "Electrolytes", remix: "Added", other: "None" },
  { feat: "Alcohol", remix: "With or without", other: "Requires it" },
  { feat: "Calories", remix: "Under 20", other: "100+" },
];

const INSIDE = [
  { icon: <Leaf />, h: "Real Fruit Juice", p: "Real juice. Real flavor. No artificial stuff getting in the way." },
  { icon: <Leaf />, h: "Natural Ingredients", p: "Nothing artificial. No mystery flavors. Just ridiculously good taste." },
  { icon: <Bolt />, h: "Electrolytes", p: "We pack in electrolytes so tomorrow-you feels just as good as tonight-you.", lime: true },
  { icon: <Cube />, h: "Low Sugar", p: "Three grams of sugar. We made a drink, not a dessert." },
];

const REVIEWS = [
  { q: "I've tried every non-alcoholic drink out there. This is the first one that actually feels like a cocktail.", n: "Jessica R." },
  { q: "Perfect for weeknights when I want something fun but don't want to drink.", n: "Mark T." },
  { q: "Way better ingredients than most mixers — and it tastes incredible straight from the can.", n: "Emily P." },
];

const OPTIONS = [
  { num: "Option 1", h: "Drink It Straight", p: "Cold can, cracked open. The purest form of yes.", img: "/images/chrome-drop/paloma-cans.jpg", alt: "Chilled Remix Perfect Paloma cans" },
  { num: "Option 2", h: "Pour Over Ice", p: "Over ice with a twist of lime. Looks like you tried. You didn't.", img: "/images/chrome-drop/paloma.jpg", alt: "Remix Perfect Paloma over ice with grapefruit and lime" },
  { num: "Option 3", h: "Mix It", p: "Float in your favorite spirit and make it as strong as you want. It still tastes amazing.", img: "/images/chrome-drop/paloma-pour.jpg", alt: "Remix Perfect Paloma being poured" },
];

const FAQS = [
  { q: "Is Remix alcoholic?", a: "No — Remix is 0.0% ABV. It's a premium non-alcoholic mocktail and mixer you can enjoy any time." },
  { q: "Can I mix alcohol with Remix?", a: "Absolutely. Remix shines on its own, but it's built to mix — add your favorite spirit for a lower-calorie cocktail." },
  { q: "Does Remix contain artificial sweeteners?", a: "Never. No artificial sweeteners and no artificial flavors — just real fruit juice and clean ingredients." },
  { q: "How many calories are in a can?", a: "Under 20 calories per 12 oz can." },
  { q: "How much sugar?", a: "Just 3g of sugar per can — a fraction of what's in typical mixers." },
  { q: "Why electrolytes?", a: "Added electrolytes help you stay hydrated, so you feel good during and after." },
];

export default function ChromeDropPage() {
  const f = useFunnel(VARIANT);
  const [buyOpen, setBuyOpen] = useState(false);
  const [factsOpen, setFactsOpen] = useState(false);
  // Remember which surface opened the next-drop modal so modal_opened/closed
  // and the modal's email_submitted all carry a consistent `source`.
  const [modalSource, setModalSource] = useState<ModalSource>("sticky");

  const openModal = (source: ModalSource) => {
    setModalSource(source);
    tracking.modalOpen({ source });
    setBuyOpen(true);
  };
  const closeModal = () => {
    tracking.modalClose({ source: modalSource });
    setBuyOpen(false);
  };

  return (
    <main data-theme="chrome-drop" className="rd-root cd-page">
      <TrackingProvider pageVariant={VARIANT} />
      {/* ── HERO — full-bleed lifestyle photo, text at top, die-cut stickers ── */}
      <section className="cd-hero">
        <SectionTracker section="hero" index={0} />
        <div className="cd-hero__top">
          <p className="rd-eyebrow" style={{ color: "var(--rd-citron)" }}>
            Mocktail · Electrolyte · Mixer
          </p>
          <h1 className="rd-display cd-hero__h1">
            A drink that&apos;s
            <br />
            always here for <em>you.</em>
          </h1>
          <p className="cd-hero__sub">
            Pour it over your favorite spirit, or drink it straight. Real juice,
            electrolytes, under 20 calories, and it tastes ridiculously good.
          </p>
          <span className="rd-cta cd-hero__cta cd-scrollcue" aria-hidden="true">
            Scroll to reveal<span className="cd-scrollcue__chev">↓</span>
          </span>
        </div>

        <div className="cd-hero__spacer" />

        {/* die-cut stickers — replace the carousel arrows */}
        <span className="cd-sticker cd-sticker--burst cd-sticker--purple cd-sticker--p1" style={{ "--rot": "-9deg" } as React.CSSProperties}>
          Bomb<br />AF
        </span>
        <span className="cd-sticker cd-sticker--burst cd-sticker--orange cd-sticker--p2" style={{ "--rot": "8deg" } as React.CSSProperties}>
          Damn,<br />pretty<br />good
        </span>
        <span className="cd-sticker cd-sticker--tag cd-sticker--teal cd-sticker--p3" style={{ "--rot": "-5deg" } as React.CSSProperties}>
          Thank god<br />there was<br />Remix
        </span>
        <span className="cd-sticker cd-sticker--blob cd-sticker--green cd-sticker--p4" style={{ "--rot": "6deg" } as React.CSSProperties}>
          Gimme<br />that
        </span>
      </section>

      {/* ── Retro "breaking news" crawl — fills the finder↔hero gap on mobile ── */}
      <div className="cd-newsbar" aria-label="In the news">
        <span className="cd-newsbar__tag">Breaking</span>
        <div className="cd-newsbar__viewport">
          <div className="cd-newsbar__track" aria-hidden>
            {[...NEWS, ...NEWS].map((n, i) => (
              <span key={i} className="cd-newsbar__item">{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── THE UNLOCK (zip-check) ──────────────────────────────────── */}
      <section id="unlock" className="rd-shell" style={{ paddingTop: 8, paddingBottom: "clamp(48px, 8vw, 96px)", scrollMarginTop: 24 }}>
        <SectionTracker section="zip_finder" index={1} />
        <div className="cd-panel" style={{ maxWidth: 580, margin: "0 auto", padding: "clamp(24px, 5vw, 40px)" }}>
          {f.phase === "idle" && (
            <>
              <p className="rd-eyebrow">Walmart called dibs</p>
              <h2 className="cd-chrome cd-chrome--finder" style={{ fontSize: "clamp(1.3rem, 5.6vw, 2.4rem)", marginTop: 8 }}>
                Are we in your city?
              </h2>
              <p className="rd-lede" style={{ marginTop: 10, maxWidth: "40ch" }}>
                Drop your zip. We&apos;ll tell you in a second, or put you first in
                line.
              </p>

              <form
                onSubmit={f.handleZip}
                noValidate
                style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}
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
                  {f.lookingUp ? "Checking…" : "Gimme that Remix →"}
                </button>
              </form>
              {f.zipError && (
                <p role="alert" style={{ marginTop: 10, fontWeight: 700, color: "#ff9ee0" }}>
                  {f.zipError}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  tracking.ctaClick({ cta: "skip_browsing", section: "zip_finder" });
                  f.handleSkip();
                }}
                className="rd-textlink"
                style={{ marginTop: 14, fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer" }}
              >
                Just browsing? Keep me posted →
              </button>
            </>
          )}

          {/* SERVED — coral unlock flood */}
          {f.phase === "served" && (
            <div className="cd-served">
              <div className="rd-meltbar">
                <span className="rd-badge">✦ Unlocked</span>
                <p className="cd-chrome" style={{ fontSize: "1.9rem", marginTop: 14 }}>
                  Remix is in {f.city ?? "your zone"}.
                </p>
              </div>
              <div style={{ paddingTop: 20 }}>
                <StoreCards stores={f.stores} />
                {f.city && (
                  <div className="cd-funfacts">
                    <button
                      type="button"
                      className="rd-cta cd-btn--ghost cd-funfacts__toggle"
                      aria-expanded={factsOpen}
                      onClick={() => {
                        tracking.ctaClick({ cta: "fun_facts_toggle", section: "zip_finder" });
                        setFactsOpen((o) => !o);
                      }}
                    >
                      {factsOpen ? "Hide the fun facts" : `Fun facts about ${f.city}`} ✦
                    </button>
                    {factsOpen && (
                      <ul className="cd-funfacts__list">
                        {(AREA_FACTS[`${f.city}, ${f.stores[0]?.state ?? ""}`] ?? FALLBACK_FACTS).map(
                          (fact, i) => (
                            <li key={i}>{fact}</li>
                          ),
                        )}
                        <li className="cd-funfacts__wink">
                          Totally made up, obviously. We just think {f.city} rules.
                        </li>
                      </ul>
                    )}
                  </div>
                )}
                <RedesignEmailForm
                  heading="Lock your spot for Drop 02"
                  cta="I'm in →"
                  submitting={f.submitting}
                  error={f.submitError}
                  onSubmit={f.handleEmail}
                  tone="dark"
                />
              </div>
            </div>
          )}

          {/* UNSERVED — graphite flip */}
          {f.phase === "unserved" && (
            <div className="cd-unserved rd-flip" style={{ borderRadius: "var(--rd-radius)", padding: "clamp(20px, 4vw, 32px)" }}>
              <p className="rd-eyebrow">Not yet — but you&apos;re close</p>
              <h2 className="cd-chrome" style={{ fontSize: "2rem", marginTop: 8 }}>
                {f.zip ? `${f.zip} ` : "Your zone "}isn&apos;t on the map yet
              </h2>
              <p className="rd-lede" style={{ marginTop: 12 }}>
                A new online drop lands in days — and it sells out fast. Lock your
                spot for first dibs, plus first word when Remix hits{f.zip ? ` ${f.zip}` : " your zone"}.
              </p>
              <RedesignEmailForm
                heading="Put me first in line"
                cta="Lock my spot →"
                submitting={f.submitting}
                error={f.submitError}
                onSubmit={f.handleEmail}
                tone="dark"
              />
            </div>
          )}

          {/* SUCCESS */}
          {f.phase === "success" && (
            <div className="rd-rise" style={{ textAlign: "center", padding: "12px 4px" }}>
              <div className="cd-can" style={{ width: 96, margin: "0 auto 18px" }}>
                <RemixImg src="/images/remix-paloma.png" alt="Remix Perfect Paloma" width={700} height={1500} style={{ width: "100%" }} sizes="96px" />
              </div>
              <h2 className="cd-chrome" style={{ fontSize: "2.3rem" }}>
                You&apos;re on the list.
              </h2>
              <p className="rd-lede" style={{ marginTop: 12 }}>
                {f.path === "served"
                  ? `The next online drop lands in days — and you'll hear first. Until then, there's a can with your name on it near ${f.city ?? "you"}. ✦`
                  : "A new online drop lands in days — and the second Remix reaches your zone, you'll know first. ✦"}
              </p>
            </div>
          )}
        </div>

      </section>

      {/* ── Fact ticker ─────────────────────────────────────────────── */}
      <div className="cd-ticker" aria-hidden>
        <div className="cd-ticker__track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="cd-ticker__item">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Why people are switching ────────────────────────────────── */}
      <section className="rd-shell cd-section">
        <SectionTracker section="why_switch" index={2} />
        <h2 className="cd-h2" style={{ maxWidth: "14ch" }}>Why everyone keeps <em>switching.</em></h2>
        <div className="cd-why">
          <div>
            <p className="cd-why__lead">Most mixers do you dirty.</p>
            <ul className="cd-problems">
              {["Sugar bombs in disguise", "Packed with artificial junk", "Taste like bad sparkling water", "Leave you feeling left out", "Literally not that good for you"].map((p) => (
                <li key={p}><span className="cd-x"><X /></span>{p}</li>
              ))}
            </ul>
            <div className="cd-built">
              <h3>Remix is built different.</h3>
              <p>The flavor, ritual, and experience of a great cocktail — without the alcohol, the calories, or the regret. Sip it straight or Spike it with your fav spirit. <span className="cd-accent">Your call boo.</span></p>
            </div>
          </div>
          <div className="cd-benefits">
            {BENEFITS.map((b) => (
              <div key={b.label} className="cd-benefit">
                <span className="cd-ic cd-ic--lg">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Remix vs a typical mixer (comparison) ───────────────────── */}
      <section className="rd-shell cd-section" style={{ maxWidth: 760 }}>
        <SectionTracker section="comparison" index={3} />
        <p className="rd-eyebrow" style={{ textAlign: "center" }}>The Remix difference</p>
        <h2 className="cd-h2" style={{ textAlign: "center" }}>Remix <em>vs.</em> a typical mixer.</h2>
        <div className="cd-vs__table">
          <div className="cd-vs__row cd-vs__row--head">
            <span className="cd-vs__brand">Remix</span>
            <span className="cd-vs__label">&nbsp;</span>
            <span className="cd-vs__other">Typical mixer</span>
          </div>
          {TABLE.map((r) => (
            <div className="cd-vs__row" key={r.feat}>
              <span className="cd-vs__win"><Check />{r.remix}</span>
              <span className="cd-vs__label">{r.feat}</span>
              <span className="cd-vs__lose">{r.other}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's inside every can ─────────────────────────────────── */}
      <section className="rd-shell cd-section">
        <SectionTracker section="inside" index={4} />
        <h2 className="cd-h2" style={{ textAlign: "center" }}>What&apos;s <em>inside</em> every can?</h2>
        <div className="cd-inside">
          {INSIDE.map((c) => (
            <div key={c.h} className="cd-inside__cell">
              <span className={`cd-ic cd-ic--lg${c.lime ? " cd-ic--lime" : ""}`}>{c.icon}</span>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Flavor feature — Muddled Berry Mojito ───────────────────── */}
      <section className="rd-shell cd-section">
        <SectionTracker section="flavors" index={5} />
        <div className="cd-feature">
          <div className="cd-feature__media">
            <RemixImg src="/images/chrome-drop/mojito-2.jpg" alt="Remix Muddled Berry Mojito poured over ice with blackberries and mint" width={1040} height={1300} sizes="(max-width: 820px) 90vw, 440px" />
          </div>
          <div>
            <p className="rd-eyebrow">The original</p>
            <h2 className="cd-h2">Muddled Berry Mojito</h2>
            <p className="cd-flavorline">Blackberry · Lime · Mint</p>
            <p className="rd-lede" style={{ marginTop: 14 }}>
              Deep, dark, and a little dangerous. Sip it straight or spike it your
              way. 0.0% ABV, under 20 calories, 3g sugar.
            </p>
            <div className="cd-feature__ctas">
              <button
                type="button"
                className="rd-cta cd-btn--ghost"
                onClick={() => {
                  tracking.ctaClick({ cta: "find_near_me", section: "flavors" });
                  scrollToTop();
                }}
              >
                Find it near me →
              </button>
              <button type="button" className="rd-cta" onClick={() => openModal("mojito")}>
                Buy it →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Flavor feature — Perfect Paloma (reversed) ──────────────── */}
      <section className="rd-shell cd-section">
        <div className="cd-feature cd-feature--reverse">
          <div className="cd-feature__media">
            <RemixImg src="/images/chrome-drop/paloma.jpg" alt="Remix Perfect Paloma with grapefruit and lime" width={1050} height={1400} sizes="(max-width: 820px) 90vw, 440px" />
          </div>
          <div>
            <p className="rd-eyebrow">Fan favorite</p>
            <h2 className="cd-h2">Perfect Paloma</h2>
            <p className="cd-flavorline">Grapefruit · Lime</p>
            <p className="rd-lede" style={{ marginTop: 14 }}>
              Bright, tart, ridiculously easy. The one that disappears first at the
              party. Good straight from the can. Great with tequila. 0.0% ABV, under
              20 calories, 3g sugar.
            </p>
            <div className="cd-feature__ctas">
              <button
                type="button"
                className="rd-cta cd-btn--ghost"
                onClick={() => {
                  tracking.ctaClick({ cta: "find_near_me", section: "flavors" });
                  scrollToTop();
                }}
              >
                Find it near me →
              </button>
              <button type="button" className="rd-cta" onClick={() => openModal("paloma")}>
                Buy it →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────────── */}
      <section className="rd-shell cd-section">
        <SectionTracker section="reviews" index={6} />
        <h2 className="cd-h2" style={{ textAlign: "center" }}>Why people <em>love</em> Remix.</h2>
        <div className="cd-reviews">
          {REVIEWS.map((r) => (
            <div key={r.n} className="cd-review">
              <Stars />
              <p>"{r.q}"</p>
              <span className="cd-review__name">— {r.n}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three ways to Remix (serving options) ───────────────────── */}
      <section className="rd-shell cd-section">
        <SectionTracker section="serve" index={7} />
        <h2 className="cd-h2" style={{ textAlign: "center" }}>Three ways to <em>Remix.</em></h2>
        <div className="cd-serve">
          {OPTIONS.map((o) => (
            <div key={o.h} className="cd-option">
              <div className="cd-option__media">
                <RemixImg src={o.img} alt={o.alt} width={1200} height={900} sizes="(max-width: 760px) 90vw, 320px" />
              </div>
              <div className="cd-option__body">
                <span className="cd-option__num">{o.num}</span>
                <h3>{o.h}</h3>
                <p>{o.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="rd-shell cd-section" style={{ maxWidth: 720 }}>
        <SectionTracker section="faq" index={8} />
        <h2 className="cd-h2" style={{ textAlign: "center" }}>Questions? <em>Answered.</em></h2>
        <div className="cd-faq">
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) {
                  tracking.faqOpen({ question: item.q, index: i });
                }
              }}
            >
              <summary>{item.q}<span className="cd-faq__sign" aria-hidden>+</span></summary>
              <p className="cd-faq__a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA banner (Margarita) ────────────────────────────── */}
      <section className="cd-final">
        <SectionTracker section="final_cta" index={9} />
        <h2 className="cd-final__h rd-display">
          Don&apos;t miss <em>the next one.</em>
        </h2>
        <p className="cd-final__sub">
          A new online drop lands in days — and it&apos;ll sell out fast. The list
          hears first. Drop your zip and you&apos;re in.
        </p>
        <a
          href="#unlock"
          className="rd-cta"
          style={{ width: "auto", padding: "0 34px" }}
          onClick={() => tracking.ctaClick({ cta: "final_drop_zip", section: "final_cta" })}
        >
          Drop your zip →
        </a>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="cd-foot">
        <p className="cd-foot__brand">REMIX</p>
        <p style={{ marginTop: 8, fontSize: "0.85rem" }}>Big flavor. Clean ingredients. Zero regrets.</p>
        <p style={{ marginTop: 14, fontSize: "0.74rem" }}>
          <Link href="/privacy" className="rd-textlink">Privacy</Link>
        </p>
      </footer>

      {/* sticky disco CTA + shared next-drop modal */}
      <StickyDropCta onOpen={() => openModal("sticky")} />
      <NextDropModal open={buyOpen} onClose={closeModal} />
    </main>
  );
}
