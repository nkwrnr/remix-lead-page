# Architecture

How the Remix lead page is wired. Read this before touching anything below the UI layer (API, data, backend). For visuals see [DESIGN.md](./DESIGN.md); for words see [COPY.md](./COPY.md).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — CSS-first config (`@theme` in `app/globals.css`), **no `tailwind.config.js`**
- **better-sqlite3** for the local lead store · **zod** for validation · **@upstash/ratelimit** (optional, prod)
- Tests: **Vitest** (unit) + **Playwright** (e2e, drives installed Chrome via `channel: "chrome"`)

## Routes

| Route | File | Type | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | static | v1 editorial landing page (`LandingFunnel`) |
| `/genie` | `app/genie/page.tsx` | static | v2 experiential "genie" variant (`GenieExperience`) |
| `/privacy` | `app/privacy/page.tsx` | static | privacy policy (CCPA/CAN-SPAM aware) |
| `/admin` | `app/admin/page.tsx` | dynamic | dev-only lead viewer, gated by `ADMIN_TOKEN` (`?token=…`) |
| `/api/subscribe` | `app/api/subscribe/route.ts` | dynamic | POST endpoint for lead capture |

Both funnels are client components that do an instant client-side zip lookup, then POST to `/api/subscribe`.

## Data flow

```
visitor → zip lookup (client, lib/zip-lookup.ts → public/data/served-zips.json)
        → served | unserved | invalid
        → EmailCapture → POST /api/subscribe
            → validate + anti-spam → getLeadStore().save(lead)
                → LocalStore (SQLite)  [+ Klaviyo + Airtable when configured]
        → confirmation
```

## `/api/subscribe` contract

`POST` JSON. Validated by `lib/subscribe-schema.ts` (zod). Runs on the **Node runtime** (better-sqlite3).

Request fields: `email`, `path` (`served|unserved|skipped`), `zip` (5-digit or null), `matchedStore`, `productInterest` (`perfect-paloma|muddled-berry-mojito|both|unset`), `consent` (bool), `website` (honeypot — must be empty), `formLoadedAt` (epoch ms), `referrer`, `pageVariant`, `utm_source/medium/campaign/content/term`.

Responses: `{ ok: true, message }` (200) · `{ ok: false, error, message }` with `400` bad JSON, `413` too large, `415` bad content-type, `422` validation, `429` rate-limited, `500` save failure.

## Lead backend — ports & adapters (`lib/leads/`)

One interface, swappable implementations, chosen by the `LEAD_BACKEND` env var. **Runs fully locally with zero accounts.**

- `store.ts` — `LeadStore` interface (`save`, `list`) + `makeId()`
- `local.ts` — **LocalStore** (SQLite at `data/leads.db`; default; always included as the durable audit copy)
- `klaviyo.ts` — **KlaviyoStore** (profile-import + list subscribe; no-ops safely if `KLAVIYO_API_KEY` unset)
- `airtable.ts` — **AirtableStore** (raw row append; no-ops safely if creds unset)
- `multi.ts` — **MultiStore** (fan-out; primary write must succeed, rest best-effort)
- `factory.ts` — `getLeadStore()` builds from `LEAD_BACKEND` (`local` default; `klaviyo+airtable` for prod). LocalStore is always primary so a lead is never lost.

See captured leads at `/admin?token=dev`; export via `npm run leads:export` (CSV = retailer demand / Klaviyo import).

## Geo data pipeline

`scripts/build-served-zips.py` reads `../remix-store-locations.xlsx` → filters `Status=="Add"` → dedupes by store → fixes the `"Mudled"` typo → normalizes zips → asserts integrity (**157 zips / 161 stores**, 6 states) → writes `public/data/served-zips.json`. Run via `npm run build:geo` (also runs inside `npm run build`). Update coverage = edit the xlsx, re-run, redeploy.

## Anti-spam (in `route.ts` + `lib/ratelimit.ts`)

1. **Honeypot** — hidden `website` field; if filled, silent `200` with no DB write.
2. **Time-trap** — `formLoadedAt`; submits faster than **2s** (`MIN_FILL_MS`) or older than 1h are silently dropped.
3. **Rate limit** — **5 per 10 min per IP** (`lib/ratelimit.ts`); in-memory locally, Upstash Redis when `UPSTASH_*` env set. Returns `429`.
4. Content-type, 2 KB size, and origin guards.

> ⚠️ These bite during manual testing: wait 2s before submitting, and restart the dev server to clear the in-memory rate limit if you hit `429`.

## Env vars (`.env.example`)

`LEAD_BACKEND` (default `local`), `LEADS_DB_PATH`, `ADMIN_TOKEN`, `NEXT_PUBLIC_SITE_URL`; for prod: `KLAVIYO_API_KEY`/`KLAVIYO_LIST_ID`, `AIRTABLE_TOKEN`/`AIRTABLE_BASE_ID`/`AIRTABLE_TABLE`, `UPSTASH_REDIS_REST_URL`/`_TOKEN`. Local dev uses `.env.local` (`LEAD_BACKEND=local`).

## Tests

- **Unit (Vitest)** — `lib/**/*.test.ts`: zip lookup, subscribe schema, lead adapters round-trip.
- **E2E (Playwright)** — `tests/e2e/funnel.spec.ts` (v1) + `tests/e2e/genie.spec.ts` (v2): drive both flows and **assert rows land in SQLite** (`data/leads.e2e.db`). Config in `playwright.config.ts` boots its own dev server on port 3100 with `LEAD_BACKEND=local`.
- Run: `npm test`, `npm run test:e2e`. If you change test-pinned copy strings, update the specs in the same commit (see [COPY.md](./COPY.md)).

## Going live (later)

Set `LEAD_BACKEND=klaviyo+airtable` + keys, add Upstash, license/swap the display font (see DESIGN.md), pick a domain + set `NEXT_PUBLIC_SITE_URL`, authenticate the sender domain (SPF/DKIM/DMARC), deploy to Vercel. The switch is config-only — no code change.
