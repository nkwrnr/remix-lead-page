---
name: design-qa
description: Run the visual-QA loop for the Remix lead page — launch the app, screenshot every state at mobile + desktop, read the shots back, and produce a state-by-state design review against docs/DESIGN.md. Use when asked to "QA the design", "screenshot the states", "review the UI", or after making UI/copy changes.
---

# Design QA loop

Packages the build-time visual-QA loop into one routine. Goal: **see the actual rendered UI** (not just code) and critique it against the design system.

## Steps

1. **Read the system** — skim `docs/DESIGN.md` (and `docs/COPY.md` if reviewing words) so the critique is grounded in the brand, not generic.

2. **Ensure a dev server is running.** Check `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`. If it's not up, start one in the background: `npm run dev` (port 3000) and wait until it responds. (Tests/CI use port 3100 separately.)

3. **Capture screenshots** (Playwright drives installed Chrome — no download):
   - `npm run qa:shots` → `qa-screenshots/page/` (route `/`)
   - `npm run qa:genie` → `qa-screenshots/genie/` (route `/genie`)
   - For a redesign-lab theme: `SLUG=<slug> node scripts/qa-redesign.mjs` → `qa-screenshots/redesign-<slug>/`
   - Scope to whatever the user asked about; don't capture everything if they named one route.

4. **Read the PNGs back** with the Read tool and inspect each state: hero/idle, zip-focused, served result + stores, sold-out/urgency, email capture, confirmation, genie reveal, etc. Check brand fidelity (coral/peach/navy/citron, Fraunces italic-`em` accent, hairline grids), mobile hierarchy, thumb-zone CTAs, overflow/clipping, contrast, and copy.

5. **Report** — a short verdict + score, then a prioritized list (P0/P1/P2 · issue · file · fix), then the top 3 highest-leverage changes. Apply fixes only if the user asked you to; otherwise propose them.

6. **Log it** — append a dated entry to `docs/DESIGN-LOG.md` summarizing what was reviewed and any durable decisions, and update `docs/DESIGN.md` / `docs/COPY.md` if a rule changed.

## Gotchas
- Form anti-spam: 2-second time-trap and a 5-per-10-min rate limit — restart the dev server to clear a `429` during repeated runs.
- Respect `prefers-reduced-motion` when judging motion.
- Screenshots land in `qa-screenshots/` (gitignored).
