"use client";

import Link from "next/link";
import { useFunnel } from "@/components/redesign/useFunnel";
import { RedesignEmailForm } from "@/components/redesign/RedesignEmailForm";
import { StoreCards } from "@/components/redesign/StoreCards";
import { RemixImg } from "@/components/redesign/RemixImg";

const VARIANT = "redesign_pocket_pour";

/* ── Inline icon set (currentColor) ─────────────────────────────────────── */
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
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m5 12 5 5 9-11" />
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
const Menu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
const Cart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="21" r="1.4" /><circle cx="18" cy="21" r="1.4" />
    <path d="M1 1h3l2.6 13.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
);

const Stars = ({ size = 17 }: { size?: number }) => (
  <span className="pp-stars" style={{ ["--s" as string]: `${size}px` }} aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ width: size, height: size, display: "inline-flex" }}><Star /></span>
    ))}
  </span>
);

const BENEFITS = [
  { icon: <Leaf />, label: "Real Juice" },
  { icon: <Leaf />, label: "Natural Ingredients" },
  { icon: <Bolt />, label: "Electrolytes Added" },
  { icon: <Drop />, label: "Under 20 Calories" },
  { icon: <Cube />, label: "3g Sugar" },
  { icon: <Clink />, label: "Enjoy With or Without Alcohol" },
];

const TABLE = [
  { icon: <Leaf />, feat: "Juice", remix: "Real fruit juice", other: "Artificial flavoring" },
  { icon: <Cube />, feat: "Sugar", remix: "Just 3g", other: "20g+ sugar" },
  { icon: <Bolt />, feat: "Electrolytes", remix: "Added", other: "None" },
  { icon: <Clink />, feat: "Alcohol", remix: "With or without", other: "Requires it" },
  { icon: <Drop />, feat: "Calories", remix: "Under 20", other: "100+" },
];

const INSIDE = [
  { icon: <Leaf />, h: "Real Fruit Juice", p: "We start with real fruit juice because flavor should come from fruit, not a chemistry lab." },
  { icon: <Leaf />, h: "Natural Ingredients", p: "No artificial sweeteners. No artificial flavors. Just ingredients that belong in your drink." },
  { icon: <Bolt />, h: "Electrolytes", p: "Unlike traditional mixers and cocktails, Remix includes added electrolytes to support hydration." },
  { icon: <Cube />, h: "Low Sugar", p: "Only 3g sugar per can. Because nobody wants to drink dessert." },
];

const REVIEWS = [
  { q: "I've tried every non-alcoholic drink out there. This is the first one that actually feels like a cocktail.", n: "Jessica R." },
  { q: "Perfect for weeknights when I want something fun but don't want to drink.", n: "Mark T." },
  { q: "Way better ingredients than most mixers — and it tastes incredible straight from the can.", n: "Emily P." },
];

const OPTIONS = [
  { num: "Option 1", h: "Drink It Straight", p: "Cold can. Crack open. Done.", img: "/images/pocket-pour/hand-paloma.jpg", alt: "A hand holding a chilled Remix Perfect Paloma can" },
  { num: "Option 2", h: "Pour Over Ice", p: "Add a lime. Instant premium mocktail.", img: "/images/pocket-pour/paloma-over-ice.jpg", alt: "Remix Perfect Paloma poured over ice in a tall glass with grapefruit and lime" },
  { num: "Option 3", h: "Mix It", p: "Add your favorite spirit for a lower-calorie cocktail experience.", img: "/images/pocket-pour/mojito-pour.jpg", alt: "Remix Muddled Berry Mojito poured into a cocktail glass with blackberries and mint" },
];

const FAQS = [
  { q: "Is Remix alcoholic?", a: "No — Remix is 0.0% ABV. It's a premium non-alcoholic mocktail and mixer you can enjoy any time." },
  { q: "Can I mix alcohol with Remix?", a: "Absolutely. Remix shines on its own, but it's built to mix — add your favorite spirit for a lower-calorie cocktail." },
  { q: "Does Remix contain artificial sweeteners?", a: "Never. No artificial sweeteners and no artificial flavors — just real fruit juice and clean ingredients." },
  { q: "How many calories are in a can?", a: "Under 20 calories per 12 oz can." },
  { q: "How much sugar?", a: "Just 3g of sugar per can — a fraction of what's in typical mixers." },
  { q: "Why electrolytes?", a: "Added electrolytes help you stay hydrated, so you feel good during and after." },
];

export default function PocketPourPage() {
  const f = useFunnel(VARIANT);

  return (
    <div data-theme="pocket-pour" className="rd-root">
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="pp-header">
        <div className="pp-wrap pp-header__row">
          <span style={{ justifySelf: "start" }}>
            <Link href="/redesign" className="pp-iconbtn" aria-label="Back to Redesign Lab">
              <Menu />
            </Link>
          </span>
          <span className="pp-wordmark">REMIX</span>
          <span style={{ justifySelf: "end" }}>
            <span className="pp-iconbtn" aria-hidden><Cart /></span>
          </span>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="pp-hero">
        <div className="pp-wrap pp-hero__inner">
          <h1 className="rd-display pp-hero__h1">
            Big flavor.<br />No booze<br />required.
          </h1>
          <p className="pp-hero__sub">The mocktail that actually tastes like a cocktail.</p>

          <div className="pp-statrow">
            <span className="pp-stat"><Drop /> Under 20 Calories</span>
            <span className="pp-stat"><Cube /> 3g Sugar</span>
            <span className="pp-stat"><Bolt /> Electrolytes Added</span>
          </div>

          <div style={{ marginTop: 24 }}>
            <a href="#finder" className="rd-cta" style={{ maxWidth: 320 }}>Find Remix near me ↓</a>
          </div>

          <div className="pp-trust">
            <Stars />
            <span className="pp-trust__txt" style={{ color: "#fff" }}>5,000+ happy customers</span>
          </div>

          <div className="pp-hero__cans">
            <RemixImg src="/images/remix-paloma.png" alt="Remix Perfect Paloma" width={700} height={1500} priority sizes="(max-width:760px) 47vw, 230px" />
            <RemixImg src="/images/remix-mojito.png" alt="Remix Muddled Berry Mojito" width={700} height={1500} priority sizes="(max-width:760px) 47vw, 230px" />
          </div>
        </div>
      </section>

      {/* ── FINDER (the real zip → email funnel) ──────────────────── */}
      <section id="finder" className="pp-sec pp-sec--soft" style={{ scrollMarginTop: 64 }}>
        <div className="pp-narrow" style={{ textAlign: "center" }}>
          {f.phase === "idle" && (
            <>
              <p className="pp-kicker">📍 Where are you sipping?</p>
              <h2 className="rd-display pp-h2" style={{ marginTop: 10 }}>
                Find Remix <em>near you.</em>
              </h2>
              <p className="rd-lede" style={{ marginTop: 12, marginInline: "auto", maxWidth: "34ch" }}>
                Drop your zip. If Remix is on a shelf near you, you&apos;ll know in a second.
              </p>
              <form onSubmit={f.handleZip} noValidate style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12, maxWidth: 420, marginInline: "auto" }}>
                <input
                  type="text" inputMode="numeric" maxLength={10}
                  placeholder="Enter your zip" aria-label="Zip code"
                  aria-invalid={!!f.zipError}
                  value={f.zipInput} onChange={(e) => f.setZipInput(e.target.value)}
                  className="rd-field" style={{ textAlign: "center" }}
                />
                <button type="submit" disabled={f.lookingUp} className="rd-cta">
                  {f.lookingUp ? "Checking…" : "Find Remix near me"}
                </button>
              </form>
              {f.zipError && <p role="alert" style={{ marginTop: 10, color: "var(--pp-red)", fontWeight: 700 }}>{f.zipError}</p>}
              <button type="button" onClick={f.handleSkip} className="rd-textlink" style={{ marginTop: 14, fontSize: "0.85rem", background: "none", border: "none", cursor: "pointer" }}>
                Not sure / just browsing →
              </button>
            </>
          )}

          {f.phase === "served" && (
            <div className="rd-panel" style={{ maxWidth: 560, margin: "0 auto", textAlign: "left" }}>
              <div className="rd-meltbar">
                <span className="rd-badge">✦ You&apos;re in</span>
                <p className="rd-display" style={{ color: "#fff", fontSize: "1.9rem", marginTop: 14, textTransform: "uppercase" }}>
                  Remix is near {f.city ?? "you"}. Right around the corner.
                </p>
              </div>
              <div style={{ padding: "22px 24px 28px" }}>
                <StoreCards stores={f.stores} />
                <RedesignEmailForm heading="Want first dibs on the next drop?" cta="Notify me when it drops" submitting={f.submitting} error={f.submitError} onSubmit={f.handleEmail} tone="light" />
              </div>
            </div>
          )}

          {f.phase === "unserved" && (
            <div className="rd-panel rd-flip" style={{ maxWidth: 560, margin: "0 auto", padding: "32px 28px", textAlign: "left" }}>
              <p className="rd-eyebrow">Put my zip on the map</p>
              <h2 className="rd-display" style={{ fontSize: "2.1rem", marginTop: 8, textTransform: "uppercase", color: "#fff" }}>
                Not your neighborhood… <em>yet.</em>
              </h2>
              <p style={{ marginTop: 12, color: "rgba(255,255,255,.82)", lineHeight: 1.55 }}>
                We&apos;re rolling out fast. Add your zip {f.zip ? `(${f.zip}) ` : ""}and you&apos;ll be first to know the moment Remix lands near you.
              </p>
              <RedesignEmailForm heading="Be first when Remix arrives" cta="Notify me when Remix arrives" submitting={f.submitting} error={f.submitError} onSubmit={f.handleEmail} tone="dark" />
            </div>
          )}

          {f.phase === "success" && (
            <div className="rd-panel rd-rise" style={{ maxWidth: 520, margin: "0 auto", padding: "40px 28px 44px", textAlign: "center" }}>
              <div style={{ width: 84, margin: "0 auto 16px" }}>
                <RemixImg src="/images/remix-mojito.png" alt="Remix can" width={700} height={1500} sizes="84px" />
              </div>
              <h2 className="rd-display pp-h2">{f.path === "served" ? <>You&apos;re <em>in.</em></> : <>On the <em>map.</em></>}</h2>
              <p style={{ marginTop: 12, color: "var(--rd-ink-soft)" }}>
                {f.path === "served"
                  ? "We'll ping you the second the next drop lands. ✨"
                  : "Your zip is on record — you'll be first to know when Remix reaches you. 🗺️"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY PEOPLE ARE SWITCHING ──────────────────────────────── */}
      <section className="pp-sec">
        <div className="pp-wrap">
          <h2 className="rd-display pp-h2" style={{ maxWidth: "14ch" }}>Why people are switching to Remix</h2>
          <div className="pp-switch" style={{ marginTop: 30 }}>
            <div>
              <p style={{ fontWeight: 700, color: "var(--rd-ink)" }}>Most alcohol alternatives have a problem.</p>
              <ul className="pp-problems">
                {["Loaded with sugar", "Packed with artificial ingredients", "Taste like flavored sparkling water", "Leave you feeling like you're missing out"].map((p) => (
                  <li key={p}><span className="pp-x"><X /></span>{p}</li>
                ))}
              </ul>
              <div className="pp-built">
                <h3>Remix was built differently.</h3>
                <p>You get the flavor, ritual, and experience of a great cocktail — without the alcohol, the calories, or the regret.</p>
              </div>
            </div>
            <div className="pp-benefits">
              {BENEFITS.map((b) => (
                <div key={b.label} className="pp-benefit">
                  <span className="pp-ic pp-ic--lg">{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THE REMIX DIFFERENCE (comparison) ─────────────────────── */}
      <section className="pp-sec pp-sec--pink">
        <div className="pp-wrap">
          <p className="pp-kicker" style={{ textAlign: "center" }}>The Remix difference</p>
          <h2 className="rd-display pp-h2" style={{ textAlign: "center", marginTop: 8 }}>Remix <em>vs.</em> a typical mixer</h2>
          <div className="pp-compare" style={{ marginTop: 30 }}>
            <div className="pp-compare__media">
              <RemixImg src="/images/pocket-pour/paloma-over-ice.jpg" alt="A Remix Perfect Paloma mocktail over ice with grapefruit and lime" width={1200} height={1490} sizes="(max-width:860px) 90vw, 360px" />
            </div>
            <div>
              <div className="pp-table">
                <div className="pp-table__head">
                  <span>&nbsp;</span>
                  <span className="pp-th-remix">Remix</span>
                  <span>Typical Mixer</span>
                </div>
                {TABLE.map((r) => (
                  <div className="pp-row" key={r.feat}>
                    <span className="pp-row__feat"><span className="pp-ic">{r.icon}</span>{r.feat}</span>
                    <span className="pp-row__remix">{r.remix}</span>
                    <span className="pp-row__other">{r.other}</span>
                  </div>
                ))}
              </div>
              <div className="pp-betters">
                <span className="pp-better"><Cube /> Better ingredients</span>
                <span className="pp-better"><Star /> Better taste</span>
                <span className="pp-better"><Bolt /> Better mornings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE EVERY CAN ───────────────────────────────── */}
      <section className="pp-sec">
        <div className="pp-wrap">
          <h2 className="rd-display pp-h2" style={{ textAlign: "center" }}>What&apos;s inside every can?</h2>
          <div className="pp-inside" style={{ marginTop: 34 }}>
            {INSIDE.map((c) => (
              <div key={c.h} className="pp-inside__cell">
                <span className="pp-ic pp-ic--lg">{c.icon}</span>
                <h3>{c.h}</h3>
                <p>{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET YOUR NEW FAVORITE MOCKTAIL ───────────────────────── */}
      <section className="pp-sec pp-sec--pink">
        <div className="pp-wrap">
          <div className="pp-feature">
            <div className="pp-feature__media">
              <RemixImg src="/images/pocket-pour/mojito-pink.jpg" alt="Remix Muddled Berry Mojito can with blackberries, lime and mint" width={1152} height={2592} sizes="(max-width:820px) 90vw, 440px" />
            </div>
            <div>
              <p className="pp-kicker">Meet your new favorite mocktail</p>
              <h2 className="rd-display pp-h2" style={{ marginTop: 8 }}>Muddled Berry Mojito</h2>
              <p className="pp-flavorline">Blackberry. Lime. Mint.</p>
              <p className="rd-lede" style={{ marginTop: 14 }}>
                Everything you love about a mojito — without the alcohol. Under 20 calories and just 3g sugar.
              </p>
              <a href="#finder" className="rd-cta" style={{ marginTop: 22, maxWidth: 340 }}>Try Muddled Berry Mojito</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────────────────────────────── */}
      <section className="pp-sec">
        <div className="pp-wrap">
          <h2 className="rd-display pp-h2" style={{ textAlign: "center" }}>Why people love Remix</h2>
          <div className="pp-reviews" style={{ marginTop: 30 }}>
            {REVIEWS.map((r) => (
              <div key={r.n} className="pp-review">
                <Stars size={16} />
                <p>“{r.q}”</p>
                <span className="pp-review__name">— {r.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVING OPTIONS ───────────────────────────────────────── */}
      <section className="pp-sec pp-sec--soft">
        <div className="pp-wrap">
          <h2 className="rd-display pp-h2" style={{ textAlign: "center" }}>Three ways to Remix</h2>
          <div className="pp-options" style={{ marginTop: 30 }}>
            {OPTIONS.map((o) => (
              <div key={o.h} className="pp-option">
                <div className="pp-option__media">
                  <RemixImg src={o.img} alt={o.alt} width={1200} height={900} sizes="(max-width:760px) 90vw, 320px" />
                </div>
                <div className="pp-option__body">
                  <span className="pp-option__num">{o.num}</span>
                  <h3>{o.h}</h3>
                  <p>{o.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="pp-sec">
        <div className="pp-narrow">
          <h2 className="rd-display pp-h2" style={{ textAlign: "center" }}>Frequently asked questions</h2>
          <div className="pp-faq" style={{ marginTop: 28 }}>
            {FAQS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}<span className="pp-faq__sign" aria-hidden>+</span></summary>
                <p className="pp-faq__a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="pp-final pp-sec">
        <div className="pp-wrap pp-final__inner" style={{ textAlign: "center" }}>
          <h2 className="rd-display" style={{ color: "#fff", textTransform: "uppercase", fontSize: "clamp(2.2rem, 8.5vw, 3.6rem)", maxWidth: "16ch", marginInline: "auto" }}>
            Life&apos;s too short for boring drinks
          </h2>
          <p style={{ color: "rgba(255,255,255,.92)", fontWeight: 600, marginTop: 14, fontSize: "1.05rem" }}>
            Big flavor. Clean ingredients. Zero regrets.
          </p>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <a href="#finder" className="rd-cta" style={{ maxWidth: 280 }}>Find Remix near me</a>
          </div>
          <div className="pp-trust" style={{ justifyContent: "center", marginTop: 18 }}>
            <Stars />
            <span className="pp-trust__txt" style={{ color: "#fff" }}>Loved by thousands of sober-curious sippers</span>
          </div>
          <div className="pp-final__cans" style={{ marginTop: 28 }}>
            <RemixImg src="/images/remix-paloma.png" alt="Remix Perfect Paloma" width={700} height={1500} sizes="(max-width:760px) 42vw, 180px" />
            <RemixImg src="/images/remix-mojito.png" alt="Remix Muddled Berry Mojito" width={700} height={1500} sizes="(max-width:760px) 42vw, 180px" />
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="pp-footer">
        <div className="pp-wrap" style={{ paddingBlock: 34, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
          <span className="pp-wordmark" style={{ color: "#fff", textAlign: "left" }}>REMIX</span>
          <nav className="pp-footnav">
            <a href="#finder">Shop</a>
            <a href="#finder">Find in Store</a>
            <a href="#finder">FAQ</a>
            <Link href="/redesign">← Redesign Lab</Link>
          </nav>
        </div>
        <div className="pp-wrap" style={{ paddingBottom: 30, fontSize: "0.72rem", color: "rgba(255,255,255,.5)" }}>
          Redesign Lab · “Pocket Pour” — mobile-first recreation · not the live site.
        </div>
      </footer>
    </div>
  );
}
