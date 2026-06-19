import Link from "next/link";

/**
 * Redesign Lab — gallery index.
 * Register a new redesign by adding an entry to REDESIGNS below.
 */

interface RedesignEntry {
  slug: string;
  name: string;
  tagline: string;
  status: "live" | "soon";
  swatches: string[];
  note: string;
}

const REDESIGNS: RedesignEntry[] = [
  {
    slug: "warm-paper",
    name: "Warm Paper",
    tagline: "Editorial · archived v1",
    status: "live",
    swatches: ["#f7f1e7", "#e88472", "#16130f", "#e9e034"],
    note: "The original "Warm Paper" editorial design from launch. Cream paper, Fraunces serif with italic-coral emphasis, coral spot color. Now archived in the lab as a historical reference. The live site is now Chrome Drop.",
  },
  {
    slug: "pocket-pour",
    name: "Pocket Pour",
    tagline: "Bright mobile-first DTC · pink × violet",
    status: "live",
    swatches: ["#ff9db0", "#7c3aed", "#5b21b6", "#fde2ea", "#1fa463"],
    note: "Faithful recreation of the pink→violet product-page comp, rebuilt mobile-first. Heavy Anton headlines, a violet icon system, REMIX-vs-typical comparison table, serving options, FAQ — with the real zip→email funnel wired into the hero CTA. Generated lifestyle shots from the real cans.",
  },
  {
    slug: "velvet-rope",
    name: "Velvet Rope",
    tagline: "Refined editorial · “Are you in?”",
    status: "live",
    swatches: ["#ffffff", "#e88472", "#ef3d1f", "#2f3a63", "#e9e034"],
    note: "White-forward editorial. Line-reveal hero, oversized pill zip check that melts coral on a hit and flips to navy on a miss.",
  },
  {
    slug: "drop-siren",
    name: "Drop Siren — v1",
    tagline: "Maximalist drop-hype · the locked winner",
    status: "live",
    swatches: ["#16130f", "#e88472", "#e9e034", "#ef3d1f"],
    note: "Dark-ground hype. Drifting aurora, real product can, rotated sticker marquee, coral × citron hover-inversion CTA, melt+flip zip check. The version we locked.",
  },
  {
    slug: "drop-siren-v2",
    name: "Drop Siren — v2",
    tagline: "“Relentless” · loud & bright",
    status: "live",
    swatches: ["#fdf0e1", "#ef5b3c", "#e9e034", "#2f3a63"],
    note: "Bright, loud & punchy (not dark). A dancing real can with a slapped-on sticker, a vibrant store finder, die-cut sticker callouts, and a REMIX-vs-others battle card split down the middle.",
  },
  {
    slug: "chrome-drop",
    name: "Chrome Drop",
    tagline: "“Liquid Chrome Hype” · drop-culture",
    status: "live",
    swatches: ["#0a0b10", "#8ef6ff", "#b69bff", "#ff9ee0", "#ef6a4d"],
    note: "Hypebeast drop-culture slice. Liquid-chrome display type, holographic iridescent accents, a spinning sticker burst, and the zip check framed as a “drop unlock.” Hero + zip-check prototype — building out if the look lands.",
  },
];

export default function RedesignGallery() {
  return (
    <div data-theme="velvet-rope" className="rd-root">
      <div className="rd-shell" style={{ paddingTop: 72, paddingBottom: 88, maxWidth: 960 }}>
        <p className="rd-eyebrow" style={{ marginBottom: 18 }}>
          Internal · not the live site
        </p>
        <h1 className="rd-display" style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
          Redesign <em>Lab.</em>
        </h1>
        <p className="rd-lede" style={{ marginTop: 18, maxWidth: "52ch" }}>
          Fully-functional redesigns of the Remix lead page, each isolated under
          its own theme. The live <code>/</code> is now Chrome Drop (promoted from
          the lab). <code>/genie</code> is also live. Pick a lab variant to walk
          the real zip → email flow, or compare against the current builds below.
        </p>

        <div
          style={{
            marginTop: 48,
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {REDESIGNS.map((r) => {
            const card = (
              <div
                className="rd-panel"
                style={{
                  padding: 24,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  opacity: r.status === "soon" ? 0.62 : 1,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {r.swatches.map((c, i) => (
                    <span
                      key={i}
                      aria-hidden
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: c,
                        border: "1px solid var(--rd-line)",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h2 className="rd-display" style={{ fontSize: "1.7rem" }}>
                      {r.name}
                    </h2>
                    {r.status === "soon" && (
                      <span className="rd-badge" style={{ background: "var(--rd-line)", color: "var(--rd-ink-soft)" }}>
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="rd-eyebrow" style={{ marginTop: 6, color: "var(--rd-ink-soft)" }}>
                    {r.tagline}
                  </p>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--rd-ink-soft)", lineHeight: 1.5 }}>
                  {r.note}
                </p>
                <span
                  className="rd-eyebrow"
                  style={{ marginTop: "auto", color: r.status === "live" ? "var(--rd-ember)" : "var(--rd-ink-soft)" }}
                >
                  {r.status === "live" ? "Open redesign →" : "In progress"}
                </span>
              </div>
            );

            return r.status === "live" ? (
              <Link key={r.slug} href={`/redesign/${r.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                {card}
              </Link>
            ) : (
              <div key={r.slug}>{card}</div>
            );
          })}
        </div>

        <p style={{ marginTop: 40, fontSize: "0.78rem", color: "var(--rd-ink-soft)" }}>
          Compare against the current build:{" "}
          <Link href="/" className="rd-textlink">live “/” editorial</Link> ·{" "}
          <Link href="/genie" className="rd-textlink">live “/genie”</Link>
        </p>
      </div>
    </div>
  );
}
