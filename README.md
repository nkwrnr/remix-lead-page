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

No external accounts are needed to run or test locally — dev leads are stored in SQLite.

## Lead backend — ports & adapters

Pick the destination(s) with one env var (`LEAD_BACKEND`). **Order matters — the first adapter is the
durable primary (its write must succeed); the rest are best-effort.** `local` is NOT auto-included — it's a
Node-only SQLite store that can't write on Vercel's read-only filesystem, so use it for dev only.

| Value | Behavior |
|---|---|
| `local` (dev default) | SQLite only (`data/leads.db`). Zero accounts. |
| `supabase+klaviyo` (**production, live**) | Supabase Postgres as the durable primary + subscribe to the Klaviyo list (best-effort marketing; no-ops safely if keys missing). |

`/api/subscribe` and the whole UI are unchanged across backends. See `.env.example` for the Supabase /
Klaviyo / Upstash keys (production also sets `UPSTASH_*` for distributed rate limiting).

- See captured leads: `/admin?token=…` (reads the configured backend — Supabase in prod; gated by `ADMIN_TOKEN`).
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

## Live in production

Lead capture is live on **remixlaunch.com**: `LEAD_BACKEND=supabase+klaviyo` (Supabase primary + Klaviyo
list `X2ayZW`), Upstash rate limiting active. Captured leads in Supabase + Klaviyo; view via `/admin?token=…`.

Still open (needs owner input):
- Set `NEXT_PUBLIC_SITE_URL` to re-enable the origin guard; optional Airtable mirror (`AIRTABLE_*`).
- NT Wagner font license (currently using **Fraunces** as a stand-in — swap in `app/layout.tsx`).
- Authenticated sender domain (SPF/DKIM/DMARC) for deliverability.
