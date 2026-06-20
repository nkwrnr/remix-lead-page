@AGENTS.md

# Remix — Zip-Optimized Lead Page

Mobile-first, ad-driven (Instagram/Facebook) landing page that turns "where can I get Remix / it's sold out" demand into an owned, **zip-segmented email list**. A visitor enters their zip; if Remix is stocked nearby we show the Walmart(s) + a sold-out/get-notified nudge, otherwise we capture the email as unserved-area demand. Two variants exist (see below). The real asset is the segmented list.

## Live variants (+ supporting routes)

- **`/`** — the **Chrome Drop** landing page (`app/page.tsx`). Drop-culture / hypebeast aesthetic: liquid-chrome display type, holographic accents, die-cut stickers, lifestyle photo hero, zip check framed as a "drop unlock". Leads tagged `pageVariant: "redesign_chrome_drop"`.
- **`/genie`** — the **experiential** variant (`app/genie/page.tsx` → `components/genie/GenieExperience`). Scarcity moves *after* the zip; a genie rises from the lamp/orb. Leads tagged `pageVariant: "genie_v2"`.
- `/privacy` (policy), `/admin?token=dev` (dev-only lead viewer), `/api/subscribe` (POST capture), `/redesign` (design lab with all variant experiments).

## Where to change things

| Want to change… | Edit |
|---|---|
| **Live site copy/design** (Chrome Drop) | `app/page.tsx` (JSX + inline data), `app/redesign/redesign.css` (chrome-drop theme tokens) |
| Fonts | `app/layout.tsx` (Fraunces, Inter, Anton variables) |
| Genie variant | `app/genie/page.tsx`, `components/genie/*` |
| **Design lab & experiments** | Create new variant under `/app/redesign/[slug]/page.tsx`, add entry to `app/redesign/page.tsx` gallery |
| Zip check funnel logic | `components/redesign/useFunnel.ts` (shared by live site + all variants) |
| Email form | `components/redesign/RedesignEmailForm.tsx` |
| Product names/flavors/nutrition | `lib/constants.ts` |
| Store/zip data | re-run `npm run build:geo` from `remix-store-locations.xlsx` |
| Lead backend / API | `lib/leads/*`, `app/api/subscribe/route.ts` (see `docs/ARCHITECTURE.md`) |

## Commands

```
npm run dev          # http://localhost:3000  (/ Chrome Drop, /genie, /redesign lab)
npm run build        # next build (served-zips.json already generated locally)
npm run build:geo    # regenerate public/data/served-zips.json from remix-store-locations.xlsx
npm test             # Vitest unit tests
npm run test:e2e     # Playwright e2e (drives installed Chrome; asserts rows hit SQLite)
npm run qa:shots     # screenshot all "/" states  → qa-screenshots/page/
npm run qa:genie     # screenshot all "/genie" states → qa-screenshots/genie/
npm run leads:export # dump local leads → CSV
```

Captured leads: **/admin?token=…** (reads the configured backend — Supabase in prod, local SQLite in dev; dev token `dev`). Live leads also in the Supabase Table Editor + the Klaviyo list.

## Conventions

- **Live site** uses redesign components (`useFunnel`, `RedesignEmailForm`, `StoreCards`, `RemixImg`) + `redesign.css` themes.
- **Design tokens** live in `app/redesign/redesign.css` — chrome-drop theme defines `--rd-bg`, `--rd-ink`, `--cd-chrome`, `--cd-holo`, etc. Never hardcode hex.
- **Signature design move:** `cd-chrome` class applies liquid-chrome gradient + text clipping to headlines; `cd-holo` applies holographic iridescent gradient to CTAs/accents.
- **Mobile-first** (360–430px), tap targets ≥44px, CLS = 0 (reserved heights), `prefers-reduced-motion` respected.
- Reuse: headless `useFunnel` hook (real zip lookup + email submit), `RedesignEmailForm` (styled with `rd-*` classes), `StoreCards`, `RemixImg`, `StickyDropCta`.

## Deployment & Staging

**Production:** remixlaunch.com (Chrome Drop live, auto-deploy from `main` → Vercel).

**Staging / Preview:** Create a git branch, edit `app/page.tsx` or any file, push → Vercel generates a preview URL automatically. Review the branch preview before merging to `main`.

**Design experiments:** Build new variants in `/redesign/[slug]/` directory. Add to the gallery at `app/redesign/page.tsx`. When ready to promote a design to production, replace `app/page.tsx` with its content and update CLAUDE.md.

## Gotchas

- **Form anti-spam:** 2-second time-trap (submit too fast = silent drop), 5-per-10-min per-IP rate limit. In prod this uses **Upstash Redis** (distributed, works across Vercel instances); locally it's in-memory (restart `npm run dev` to clear `429`).
- **Lead backend:** dev = **`LEAD_BACKEND=local`** (SQLite, no accounts); **prod = `supabase+klaviyo`** (LIVE) — Supabase is the durable primary (better-sqlite3 can't run on Vercel's read-only FS), Klaviyo is best-effort marketing fan-out to list `X2ayZW`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The official Klaviyo MCP is wired at local scope for marketing ops.
- Test-pinned copy strings in e2e tests (list in `docs/COPY.md`) — if you reword them, update test specs in the same change.
- The Chrome Drop lab snapshot at `/redesign/chrome-drop` is a frozen reference. The live `/` evolves independently; they are not synced.

## Working on design/UX/copy

Use the **visual-QA loop** (`npm run qa:shots` / `qa:genie` → Read the PNGs → iterate), the **`/design-qa`** skill (runs the whole loop), or ask the **`design-reviewer`** subagent for a prioritized critique. **Keep the docs alive:** when you set a durable pattern, update `docs/DESIGN.md` / `docs/COPY.md` and append a dated note to `docs/DESIGN-LOG.md`.

## Reference docs

@docs/DESIGN.md
@docs/COPY.md
@docs/ARCHITECTURE.md
