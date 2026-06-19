import Image from "next/image";
import { PRODUCTS } from "@/lib/constants";
import { Badge } from "./Chrome";

const WHY: { num: string; title: React.ReactNode; body: string; feature?: boolean }[] = [
  {
    num: "i.",
    title: <>Big flavor, <em>zero proof.</em></>,
    body: "Muddled Berry Mojito and Perfect Paloma — fully loaded on taste, 0.0% ABV. The party without the part you regret.",
  },
  {
    num: "ii.",
    title: <>Clean enough <em>to brag about.</em></>,
    body: "Real juice. Under 20 calories. 3g sugar. Plus electrolytes. Vegan and gluten-free, obviously.",
  },
  {
    num: "iii.",
    title: <>Mocktail or mixer — <em>your call.</em></>,
    body: "Crack one over ice, or splash in your favorite spirit. You make the rules.",
  },
  {
    num: "iv.",
    title: <>Loved faster <em>than we can stock.</em></>,
    body: "Already in 161 Walmart stores and selling out online. Get in early.",
    feature: true,
  },
];

export function Persuasion() {
  return (
    <>
      {/* ── Why Remix — hairline magazine grid ── */}
      <section className="bg-paper border-t border-line-soft">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="eyebrow">Why Remix</p>
          <h2 className="font-display text-ink text-4xl sm:text-6xl mt-3 max-w-[14ch]">
            Beverages <em>remastered.</em>
          </h2>
          <p className="lede mt-5 max-w-[48ch]">
            Not a watered-down &ldquo;healthy&rdquo; soda. A genuinely good drink
            that happens to be good for you.
          </p>

          <div className="hgrid mt-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <div
                key={w.num}
                className={`flex min-h-[260px] flex-col justify-between p-8 transition-colors ${
                  w.feature
                    ? "on-ink !bg-navy text-paper"
                    : "hover:!bg-paper-hover"
                }`}
              >
                <span
                  className={`font-display italic text-sm ${
                    w.feature ? "text-citron" : "text-ember"
                  }`}
                >
                  {w.num}
                </span>
                <div className="mt-6">
                  <h3 className="font-display text-[1.6rem] leading-tight">
                    {w.title}
                  </h3>
                  <p
                    className={`mt-3 text-[0.95rem] leading-relaxed ${
                      w.feature ? "text-paper/75" : "text-ink-light"
                    }`}
                  >
                    {w.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* declaration slab — the money quote */}
          <div className="decl mt-14 p-10 sm:p-14 text-2xl sm:text-4xl leading-tight">
            Big flavor. Clean ingredients. <em>Zero regrets.</em>
            <span className="block mt-6 font-sans text-[11px] uppercase tracking-[0.22em] text-[#2a0d05]/65 font-bold">
              the remix promise
            </span>
          </div>
        </div>
      </section>

      {/* ── Product duo ── */}
      <section className="bg-paper-2 border-t border-line-soft">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <p className="eyebrow">Two ways to remix</p>
          <h2 className="font-display text-ink text-4xl sm:text-6xl mt-3">
            Two flavors. <em>Endless ways.</em>
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {Object.values(PRODUCTS).map((p, i) => (
              <div
                key={p.slug}
                className="rounded-fig border border-line bg-paper p-8 text-center transition-colors hover:bg-paper-hover"
              >
                <span className="font-display italic text-sm text-ember">
                  {i === 0 ? "i." : "ii."}
                </span>
                <div className="mt-4 flex justify-center">
                  <Image
                    src={p.image}
                    alt={`Remix ${p.name}`}
                    width={240}
                    height={240}
                    className="h-48 w-auto drop-shadow-xl"
                  />
                </div>
                <h3 className="font-display text-[1.75rem] mt-5">{p.name}</h3>
                <p className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-ember font-semibold">
                  {p.flavor}
                </p>
                <p className="mt-3 text-ink-light text-[0.95rem] max-w-[34ch] mx-auto">
                  {p.blurb}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                  <Badge>$12.99</Badge>
                  <Badge>0 ABV</Badge>
                  <Badge>Under 20 Cal</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof — dark editorial break ── */}
      <section className="on-ink relative overflow-hidden bg-navy text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 600px at 85% 12%, rgba(232,132,114,.20), transparent 60%), radial-gradient(800px 500px at 5% 95%, rgba(233,224,52,.12), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-24">
          <p className="eyebrow">The verdict</p>
          <h2 className="font-display text-4xl sm:text-6xl mt-3 max-w-[16ch]">
            Rated 5.0 by the people who <em>found it.</em>
          </h2>

          <div className="mt-12 flex flex-wrap gap-12">
            {[
              ["5.0", "Average rating"],
              ["161", "Walmart stores"],
              ["0", "Regrets"],
            ].map(([n, label]) => (
              <div key={label}>
                <div className="font-display text-citron text-5xl sm:text-6xl leading-none">
                  {n}
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-paper/55 font-semibold">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              ["Tastes like a real cocktail minus the hangover. Obsessed.", "Jordan M."],
              ["The Paloma is unreal. Bought a case, gone in a week.", "Priya R."],
              ["Finally a mocktail that doesn’t taste like sad soda.", "Devin K."],
            ].map(([quote, name]) => (
              <figure key={name} className="border-t border-paper/15 pt-5">
                <p className="text-citron text-sm">★★★★★</p>
                <blockquote className="mt-2 font-display italic text-[1.05rem] leading-snug text-paper/90">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-3 text-[11px] uppercase tracking-[0.18em] text-paper/50">
                  {name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
