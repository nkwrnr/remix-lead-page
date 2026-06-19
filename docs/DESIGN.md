# Design System — Remix "Warm Paper" Editorial

The visual source of truth. This is what to read (and keep updated) when working on UI/UX. Architecture lives in [ARCHITECTURE.md](./ARCHITECTURE.md); words in [COPY.md](./COPY.md); decisions in [DESIGN-LOG.md](./DESIGN-LOG.md).

## The aesthetic in one paragraph

Editorial print-magazine, not SaaS. Warm **cream paper**, warm near-black **ink**, one molten **coral** spot color carried by an italic serif (**Fraunces**), with **citron** as the secondary accent that only appears on dark sections, and **navy** for full-bleed "ink" breaks. A high-contrast serif carries all personality; **Inter** does the quiet work in body and labels. Signature moves: an italic-coral `<em>` inside serif headlines, hairline magazine grids, alternating light/ink sections, a coral declaration slab, and a glowing citrus **"vessel" orb** that doubles as the genie's lamp on `/genie`.

## Where everything lives

| Thing | File |
|---|---|
| **Design tokens** (colors, fonts, radii, shadows) | `app/globals.css` → `@theme { … }` |
| **Helper classes + keyframes** (`.font-display`, `.eyebrow`, `.lede`, `.hgrid`, `.decl`, `.vessel`, `.animate-*`) | `app/globals.css` (below `@theme`) |
| **Fonts** (Fraunces display, Inter body) | `app/layout.tsx` |
| Shared UI primitives | `components/ui/` (`Button`, `Input`, `Spinner`) |
| v1 landing components | `components/landing/` |
| v2 genie components | `components/genie/` |
| Product/copy constants | `lib/constants.ts` |

**Never hardcode hex in components** — reference tokens (`bg-coral`, `text-ink`, `rounded-fig`, `font-display`, …). Tailwind v4 exposes every `@theme` token as a utility automatically.

## Color tokens (current — keep in sync with `globals.css`)

| Token | Hex | Role |
|---|---|---|
| `--color-coral` | `#e88472` | brand spot color; primary CTAs/fills |
| `--color-ember` | `#ef3d1f` | hotter coral — **italic `<em>` emphasis** + button hover |
| `--color-terracotta` | `#b7623c` | deep coral accent |
| `--color-citron` | `#e9e034` | secondary accent — **on dark only** (eyebrows, stats, genie gems) |
| `--color-citron-ink` | `#351b20` | text on citron |
| `--color-navy` | `#2f3a63` | full-bleed dark "ink" sections |
| `--color-ink` | `#16130f` | warm near-black text |
| `--color-ink-light` | `#6b655c` | muted/secondary text, ledes |
| `--color-paper` | `#f7f1e7` | primary cream ground |
| `--color-paper-2` | `#efe6d6` | deeper cream — alternating sections, info cards |
| `--color-paper-hover` | `#fcf6ec` | card hover |
| `--color-line` / `--color-line-soft` | ink @ .12 / .06 | hairline dividers (the grid technique) |
| `--color-success` `#3c7d4a` · `--color-error` `#9a2414` | states |
| `--color-peach` `#f7d3bf` · `--color-blush` `#f1b59d` | hero gradient stops |

## Type

- **Display** = Fraunces (`--font-display`, `.font-display`, weight 500, `letter-spacing:-.02em`). Loaded in `app/layout.tsx` as a stand-in for the brand's **NT Wagner** — see "Swapping fonts" below.
- **Body/labels** = Inter (`--font-sans`).
- **Signature move:** wrap one word in `<em>` inside a `.font-display` heading → renders italic + `--color-ember` (or `--color-citron` inside `.on-ink`). e.g. `Beverages <em>remastered.</em>`
- **Eyebrow:** `.eyebrow` (11px, `.22em` tracking, uppercase, coral; citron on `.on-ink`).
- **Lede:** `.lede` (fluid, muted ink). Section rhythm is **eyebrow → headline → lede**.

## Shape & depth

Radii: `--radius-card` 4px · `--radius-fig` 8px · `--radius-field` 6px · `--radius-pill` 300px. Shadows are reserved for orbs/figures and lifts: `--shadow-orb`, `--shadow-card`, `--shadow-lift`. Editorial = mostly flat; let hairlines and type do the work.

## Editorial building blocks

- **Hairline grid** (`.hgrid`) — `gap:1px` over an ink background bleeds through as crisp 1px dividers. Used for the "Why Remix" pillars; flip one cell to `.on-ink !bg-navy` as the feature.
- **Declaration slab** (`.decl`) — coral block, deep-brown text, the quotable line ("Big flavor. Clean ingredients. *Zero regrets.*").
- **Vessel orb** (`.vessel`) — radial citrus gradient + pulse/ring; the hero motif and the genie's lamp.
- **Dark break** — navy section + ambient radial glow + citron accents (social proof).

## Component inventory

**v1 (`components/landing/`)**: `HeroSection`, `LandingFunnel` (zip→result state machine), `PathA` (`StoreList` + `SoldOutBanner`), `EmailCapture` (honeypot + consent; accepts `cta`, `ctaClassName`), `ConfirmationView`, `Persuasion` (why-grid + products + social + declaration), `Chrome` (`AnnouncementBar`, `Header`, `Footer`, `Badge`), `StickyCta`.

**v2 (`components/genie/`)**: `GenieExperience` (lamp + zip + reveal state machine: idle → summoning → served/unserved → success), `Genie` (SVG genie + `SpeechBubble`), `Sparkles`. Reuses `EmailCapture`, `StoreList`, the `.vessel` orb.

## Motion catalog (`app/globals.css`, all gated by `prefers-reduced-motion`)

`animate-rise` (entrance) · `animate-genie` (rise w/ overshoot) · `animate-sway` (idle bob) · `animate-smoke` (puff) · `animate-bubble` (speech pop) · `animate-sparkle` (confetti) · `animate-cta` (Sign-up pulse) · `.stagger` (store-card delays) · `vessel-pulse`/`vessel-ring` (orb). Use `transform`/`opacity` only; keep CLS at 0 by reserving heights.

## Responsive & accessibility

Mobile-first (designed 360–430px; ad traffic is IG/FB mobile). Tap targets ≥44px; zip input `inputMode="numeric"`, 16px text (no iOS zoom); honeypot is `sr-only` + `aria-hidden`; AA contrast (coral text only at large sizes — body uses `--color-ink`); every animation respects reduced-motion.

## Visual-QA loop (how to actually check your work)

This is the core design workflow — Playwright drives the **installed Chrome** (no download):

```
npm run dev                 # http://localhost:3000  (/ and /genie)
npm run qa:shots            # screenshots all / states  → qa-screenshots/page/
npm run qa:genie            # screenshots all /genie states → qa-screenshots/genie/
npm run qa:reference        # screenshots live drinkremix.co → qa-screenshots/reference/ (brand-fidelity compare)
```

Then **Read the PNGs back** and iterate the CSS until it's right. Or just run the `/design-qa` skill, or ask the **design-reviewer** subagent for a critique. Gotchas while testing: 2s form time-trap; 5/10min rate limit (restart dev to clear).

## Swapping fonts (NT Wagner)

The brand's real display face is **NT Wagner** (currently substituted by Fraunces). To swap: replace the display font in `app/layout.tsx` (self-host the licensed woff2 via `next/font/local`, keep the `--font-display-face` variable). One change, everything updates. Confirm licensing first.

## Keeping this doc alive

When you establish a durable pattern, token, or rule, **update this file** and append a dated note to [DESIGN-LOG.md](./DESIGN-LOG.md). The `design-reviewer` subagent and `/design-qa` skill are instructed to do the same.
