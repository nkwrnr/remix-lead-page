# Analytics — PostHog event tracking

Product analytics for the **live** lead pages (`/` Chrome Drop + `/genie`). Built
for a growth PM: see which buttons get clicked down to the lowest click, where
people snag, and what they don't scroll to (especially on mobile) — while staying
lean enough not to slow the page. Ad attribution stays on the Meta Pixel; this is
separate. Architecture lives in [ARCHITECTURE.md](./ARCHITECTURE.md).

## How it's wired

Everything routes through the provider-agnostic facade in `lib/tracking/`
(`tracking.ctaClick(...)`, `tracking.submitEmail(...)`, …). The facade fans each
event out to every registered provider:

| Provider | File | Role |
|---|---|---|
| Meta Pixel | `lib/tracking/meta-pixel.ts` | ad attribution (Launch / zip / email only; ignores the rest) |
| **PostHog** | `lib/tracking/posthog.ts` | product analytics (all events) |
| Debug | `lib/tracking/debug.ts` | **dev-only** console logger |

Providers are mounted once by `components/tracking/TrackingProvider.tsx` (on `/`
and `/genie`). PostHog registers only when `NEXT_PUBLIC_POSTHOG_KEY` is set; the
debug provider runs in dev regardless. The kill-switch `NEXT_PUBLIC_TRACKING_ENABLED=false`
suppresses all of it.

### Lean by construction (the "don't slow us down" part)
- **autocapture OFF, session replay OFF, surveys OFF** → posthog-js never fetches
  `recorder.js` or the surveys chunk.
- ingestion is **reverse-proxied** through same-origin `/ingest/*` (see
  `next.config.ts` `rewrites`) → ad-blocker resilient, and **no extra CSP domains**.
- **`person_profiles: 'identified_only'`** → anonymous traffic is cheap; a person
  is only created on email submit. (Funnels still work — see below.)

## The taxonomy

Convention: **`object_action`**, snake_case, past tense. **Few event names; detail
in properties.** Every event also auto-carries `page_variant` (super property) plus
PostHog built-ins `$current_url`, `$device_type`, `$referrer`, `utm_*` — so "by
mobile vs desktop" and "by ad source" work on every report for free.

| Event | Key properties | Fires when |
|---|---|---|
| `$pageview` *(auto)* | (built-ins) | page load (fired manually so `page_variant` rides it) |
| `$pageleave` *(auto)* | `$prev_pageview_max_scroll_percentage` | exit — scroll depth + bounce |
| `section_viewed` | `section`, `index`, `seconds_since_load` | a section first enters the viewport (once each) |
| `cta_clicked` | `cta`, `section` | any tracked button/link tap |
| `zip_submitted` | `zip`, `served`, `store_count`, `matched_city`, `matched_state` | zip resolves |
| `zip_submit_failed` | `reason` (`invalid_format`/`empty`), `zip_attempted` | zip rejected |
| `email_submitted` | `path`, `served`, `source` (`inline`/`modal`), `zip`, `matched_store`, `product_interest` | capture succeeds → **conversion** + `identify(email)` |
| `email_submit_failed` | `reason`, **`email`**, `path`, `source`, `zip` | capture errors |
| `modal_opened` / `modal_closed` | `source` (`mojito`/`paloma`/`sticky`) | next-drop modal toggles |
| `faq_opened` | `question`, `index` | an FAQ item opens |

`cta` values: `summon_zip`, `skip_browsing`, `find_near_me`, `buy_it`,
`sticky_drop`, `final_drop_zip`, `maps_open`, `fun_facts_toggle`. (Buy/sticky clicks
are represented by `modal_opened` with their `source`, which is richer than a flat
`cta`.)

### Adding a new CTA — one line
No new event name. Add the id to the `Cta` union in `lib/tracking/types.ts`, then on
the button:

```tsx
onClick={() => tracking.ctaClick({ cta: "my_new_button", section: "flavors" })}
```

It shows up immediately in the `cta_clicked` breakdown — no engineer needed to keep
reports clean.

## The 5 analyses this is built for

1. **# of zips submitted** → Trends count of `zip_submitted` (break down by
   `matched_state` / `served` / `$device_type`).
2. **"Zip submitters convert to email at a higher rate"** → Funnel
   `$pageview → zip_submitted → email_submitted`. Works on anonymous visitors:
   events share the session's `distinct_id`, and `identify(email)` on success
   auto-merges the anonymous person into the identified one, so the funnel stays
   intact even under `identified_only`.
3. **Emails that failed (and the address)** → `email_submit_failed` table; it carries
   `email` + `reason` → your recovery list of who hit a wall and why.
4. **Zip submit failures** → `zip_submit_failed` with `zip_attempted` + `reason`.
5. **Where mobile users stall** → `section_viewed` funnel broken down by
   `$device_type`, plus the `$pageleave` max-scroll-% distribution.

## Why not Vercel Web Analytics events
Vercel custom events cap at **2 properties** and have no funnels/correlation — they
can't express this schema (e.g. `email_submitted` carries 6 props) or analysis #2.
PostHog is the single source of truth for product analytics; Meta Pixel stays for
ad attribution only.

## PII
Autocapture is OFF, so no input values are ever scraped. Raw `email` is sent only on
`email_submitted` (the expected `identify`) and `email_submit_failed` (first-party,
to recover the lost lead). `zip` is low-sensitivity and powers geo breakdowns.

## Testing in development
1. **Console debug provider** — `npm run dev`, open a page, watch the console: every
   event logs (`▸ <name>` + payload) **even with no PostHog key set**. Fastest loop.
2. **`posthog.debug()`** — auto-on in dev; logs each capture's network delivery.
3. **Dev project** — set a *dev* `NEXT_PUBLIC_POSTHOG_KEY` in `.env.local`; confirm
   events in PostHog → **Activity (live events)**. Keep the prod key in Vercel only.
4. **Unit tests** — `lib/tracking/posthog.test.ts` asserts each facade call maps to
   the right `posthog.capture` (run `npm test`).

> Gotchas while testing the funnel: the 2-second form **time-trap** (submit slower
> than 2s) and the 5-per-10-min per-IP **rate limit** (restart dev to clear a `429`).

## Keeping this doc alive
When you add an event or `cta`, update the tables above and the `Cta`/`Section`
unions in `lib/tracking/types.ts`.
