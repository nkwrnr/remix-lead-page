# Remix — Zip-Optimized Lead Page

Mobile-first, ad-driven landing page that turns "where can I get Remix / it's sold
out" demand into an owned, **zip-segmented email list**. A visitor enters their zip:

- **Path A (served):** show the nearby Walmart(s) + "online drops sell out — get notified" + email capture.
- **Path B (unserved / skipped):** sell Remix + capture the email as **unserved-area demand**.

Built with **Next.js 16 (App Router) + React 19 + Tailwind v4**, deployed-ready for Vercel.

**Variants:** `/` (editorial), `/genie` (experiential genie reveal), plus a non-destructive **redesign lab** at `/redesign` (e.g. `velvet-rope`, `drop-siren`) for comparing full redesigns side-by-side. All share the same real funnel + backend.

## Quick start

```bash
npm install
npm run build:geo     # generate public/data/served-zips.json from the store xlsx
cp .env.example .env.local
npm run dev           # http://localhost:3000
```

No external accounts are needed to run or test — leads are stored locally in SQLite.

## Lead backend — local-first & portable

The backend is ports-and-adapters; pick the target with one env var (`LEAD_BACKEND`):

| Value | Behavior |
|---|---|
| `local` (default) | SQLite only (`data/leads.db`). Zero accounts. |
| `klaviyo+airtable` | Fan out to Klaviyo + Airtable **and** keep a local audit copy. Each remote no-ops safely if its keys are missing. |

`/api/subscribe` and the whole UI are unchanged across backends. See `.env.example`
for the Klaviyo / Airtable / Upstash keys to add when you connect them.

- See captured leads: `/admin?token=dev` (dev only; gated by `ADMIN_TOKEN`).
- Export to CSV (retailer demand / Klaviyo import): `npm run leads:export`.

## Data pipeline

`scripts/build-served-zips.py` reads `../remix-store-locations.xlsx` → dedupes by
store, normalizes zips, fixes the "Mudled" typo, asserts integrity (157 zips / 161
stores), and writes `public/data/served-zips.json`. Update coverage = edit the xlsx,
re-run `npm run build:geo`, redeploy.

## Testing & QA (all local, no accounts)

```bash
npm test          # Vitest: zip lookup, schema validation, lead adapters
npm run test:e2e  # Playwright: both funnel paths + honeypot, asserts rows land in SQLite
npm run qa:shots  # screenshots of every "/" state @ mobile + desktop -> qa-screenshots/page
npm run qa:genie  # screenshots of every "/genie" state -> qa-screenshots/genie
npm run qa:reference  # screenshots of live drinkremix.co for design comparison
```

Playwright drives the **installed Google Chrome** (`channel: "chrome"`) — no browser download.

## Security & privacy (right-sized)

- `/api/subscribe`: Content-Type + 2KB size + origin guards, Zod validation, honeypot,
  time-trap, per-IP rate limit (in-memory locally; Upstash Redis when env keys present).
- Secrets server-only; security headers + CSP in `next.config.ts` (strict in prod,
  `unsafe-eval` allowed only in dev for React HMR).
- Consent checkbox + `/privacy` policy (CCPA/CAN-SPAM aware).

## Documentation & Claude infra

- **[CLAUDE.md](./CLAUDE.md)** — authoritative project guide (read first); imports the docs below.
- **[docs/DESIGN.md](./docs/DESIGN.md)** — the "Warm Paper" editorial design system: tokens, fonts, components, motion, the visual-QA loop.
- **[docs/COPY.md](./docs/COPY.md)** — every user-facing string → its file, brand voice, and test-pinned strings.
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — routes, API, lead adapters, data pipeline, anti-spam, tests, env.
- **[docs/DESIGN-LOG.md](./docs/DESIGN-LOG.md)** — append-only design/UX/copy decisions.
- **`.claude/`** — `settings.json` (permissions allowlist + SessionStart orientation & Stop typecheck hooks), the **design-reviewer** subagent, and the **/design-qa** skill.

## Before going live (needs owner input)

- Klaviyo API key + list id; Airtable token + base — then set `LEAD_BACKEND=klaviyo+airtable`.
- Domain (ships on `*.vercel.app` until attached) + `NEXT_PUBLIC_SITE_URL`.
- NT Wagner font license (currently using **Fraunces** as a stand-in — swap in `app/layout.tsx`).
- Authenticated sender domain (SPF/DKIM/DMARC) for deliverability.
