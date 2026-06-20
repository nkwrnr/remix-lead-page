# Design Log

Append-only record of design/UX/copy decisions. Newest first. Both the `design-reviewer` subagent and the `/design-qa` skill add dated entries here; so should you when you make a durable choice. Keep [DESIGN.md](./DESIGN.md) / [COPY.md](./COPY.md) updated alongside.

Format: `## YYYY-MM-DD — title` → what changed · why · files.

---

## 2026-06-20 — Live Chrome Drop: "What's inside every can?" copy + one-line finder headline

- **"What's inside" cards** (`INSIDE` array, `app/page.tsx`): punchier bodies on three of four — Real Fruit Juice → "Real juice. Real flavor. No artificial stuff getting in the way."; Natural Ingredients → "Nothing artificial. No mystery flavors. Just ridiculously good taste."; Electrolytes → "We pack in electrolytes so tomorrow-you feels just as good as tonight-you." Labels, headline, icons, and Low Sugar unchanged.
- **Finder headline** "Are we in your city?" sized down to one line (`clamp(1.3rem, 5.6vw, 2.4rem)` + `white-space: nowrap` on `.cd-chrome--finder`) — was wrapping to two lines on mobile.

## 2026-06-19 — PostHog product analytics + tracking facade

Added a client analytics layer so we can see — as a growth PM — which buttons get clicked down to the lowest click, where people snag, and what they don't scroll to on mobile, **without slowing the page**. Built on the existing provider-agnostic tracking facade (mirrors the Meta Pixel adapter), so no funnel rewrites. Verification: typecheck + **58 unit** (incl. new `lib/tracking/posthog.test.ts`) + **9 e2e** green; a live event smoke on a 390px viewport captured the full taxonomy firing (Launch, all 10 `section_viewed`, `cta_clicked`, `modal_opened/closed` with `mojito`/`paloma` source, `faq_opened`, `zip_submit_failed`, and rich `zip_submitted {storeCount, city, state}`).

- **PostHog adapter** (`lib/tracking/posthog.ts`) alongside Meta Pixel, both behind `lib/tracking/index.ts`. **Lean config:** autocapture off, session replay off, surveys off, `identified_only` — the heavy posthog-js chunks never load. `email_submitted` does `identify(email)` so the zip→email funnel stays intact across the anonymous→identified merge.
- **Growth taxonomy** (`lib/tracking/types.ts`, doc'd in `docs/ANALYTICS.md`): few event names, detail in properties — `cta_clicked {cta,section}`, `section_viewed`, `zip_submitted`/`zip_submit_failed`, `email_submitted`/`email_submit_failed` (carries the attempted `email` for recovery), `modal_opened/closed`, `faq_opened`. Adding a button later = one new `cta` value, no new event name.
- **Reverse proxy** (`next.config.ts` rewrites → same-origin `/ingest/*`): ad-blocker resilient and needs **no new CSP domains**. Why: the existing CSP is strict; proxying keeps it untouched.
- **Dev console debug provider** (`lib/tracking/debug.ts`) — every event logs to the console even with no PostHog key, so the taxonomy is testable before any account exists.
- **Scroll depth** via `components/tracking/SectionTracker.tsx` (one IntersectionObserver/section, fires once). **Genie** (`components/genie/GenieExperience.tsx`) instrumented directly — it has its own state machine, not `useFunnel`. `NextDropModal` now reports email events (it previously dropped every buy-intent conversion).
- **Starter dashboard** as code: `scripts/posthog-dashboard.mjs` + `npm run analytics:dashboard` (funnel, zip volume, conversions-by-path, scroll-by-device, goal-line failures). Needs a `POSTHOG_PERSONAL_API_KEY` (the public `phc_` key can't write dashboards).
- Files: `lib/tracking/*`, `components/tracking/*`, `app/page.tsx` + `app/genie/page.tsx` (mount + CTA/FAQ/section hooks), `components/redesign/{useFunnel,StoreCards,StickyDropCta,NextDropModal}.tsx`, `next.config.ts`, `.env.example`, `docs/ANALYTICS.md`. Kill switch: `NEXT_PUBLIC_TRACKING_ENABLED=false`.

## 2026-06-19 — Live Chrome Drop: copy pass + consent checkbox → notice line

Copy refinements on `app/page.tsx` + a consent-UX change in `components/redesign/RedesignEmailForm.tsx`. Build + 58 unit tests green; each spot screenshot-verified; submit path re-verified end-to-end (lead row saves with `consent=1`, `consentVersion`, timestamp).

- **Zip button:** "Summon My Remix →" → **"Gimme that Remix →"**.
- **"Remix is built different" subtitle** rewritten with a voicier line + emoji (🤌 / 😘) and a green-serif flourish: **"Your call boo."** wrapped in a new `.cd-accent` span (`font-family: var(--font-display)` + italic + `var(--rd-citron)`, **size inherited** — mirrors the `.cd-h2 em` accent). Per user: replaced the single existing paragraph; no "craft bartender" body added.
- **Flavor bodies:** Mojito "…build it into something taller" → "…spike it your way"; Paloma "+Good straight from the can. Great with tequila." appended.
- **Final CTA:** "the next one" now lime-green italic via a new `.cd-final__h em` rule (the rule didn't exist, so it rendered white).
- **Store count:** confirmed **161** is correct — `../remix-store-locations.xlsx` = 258 store+SKU rows → 161 unique stores (matches `served-zips.json`); no "181" in data/repo. No change.
- **Consent checkbox → notice line.** Replaced the gated consent checkbox with a non-blocking **italic notice** ("By submitting, you agree to receive the coolest drop emails from us." + `/privacy` link) and now always send `consent: true`. Rationale: CAN-SPAM is opt-out, single opt-in needs no checkbox, a notice converts better, and `consent`/`consentVersion`/`createdAt` are still logged server-side as proof (schema `consent: z.boolean()` unchanged; route.ts unchanged). Applies to served/unserved/`NextDropModal` (shared form). e2e specs unaffected — they target warm-paper/`/genie` which use the v1 `EmailCapture` (its own checkbox, untouched).

## 2026-06-19 — Live Chrome Drop: holo served-state, finder fixes, "breaking news" crawl, Maps + area-facts

Served-state + finder polish pass on the live `/` (Chrome Drop), all scoped to `[data-theme="chrome-drop"]`; `/genie` and tests untouched. `npx next build` + `npm test` (38) green; verified by cropped screenshots at iPhone-13 + desktop.

- **Served block coral → solid LIME, chrome headline kept.** First tried `var(--cd-holo)`; user found the colorful flood off-brand and wanted the *original liquid-chrome animated lettering* back on a *solid* color. Final: `.cd-served .rd-meltbar` floods solid `var(--rd-citron)` (#D1FE17), the "Remix is in {city}" headline keeps the base `.cd-chrome` (silver liquid-chrome gradient + `cd-flow`), and the "✦ Unlocked" pill is a **dark graphite chip** (a lime pill would vanish into the flood). Drip `clip-path` + `rd-melt` entrance kept. Files: `app/page.tsx` (served headline dropped its inline `color:#fff`), `app/redesign/redesign.css`. _(Note: silver-on-lime is legible but not high-punch — a deeper green is the fallback if more contrast is wanted.)_
- **Finder headline spacing.** "Are we in your / city?" two-line stack tightened via a scoped `.cd-chrome--finder { line-height:0.82 }` so the shared `.cd-chrome` (0.86) is untouched.
- **Retro 8-bit stock-exchange ticker** (`.cd-newsbar`) inserted in the DOM between hero and `#unlock`; given mobile `order:-2` (finder `-3`, hero `-1`) so it **fills the awkward finder↔hero dead-space on mobile**, and on desktop divides hero from finder (distinct from the thin fact-ticker `.cd-ticker`). First pass was a cheeky magenta "BREAKING" chip — user wanted *fully* retro, so rebuilt as a slim **black LED board**: pixel font (`Press_Start_2P` → `--font-pixel`, added in `app/layout.tsx`), phosphor-green crawl with `▲` glyphs + `◆` seams (no emoji), CRT scanlines, a red "BREAKING" tag with a blinking block cursor, slower 52s scroll. Reduced-motion shows a static line. Mobile `#unlock` bottom pad trimmed to 18px now the crawl divides it. Copy in `NEWS[]` (`app/page.tsx`) — terse board-style, led by the Fourth-of-July drop.
- **Scarcity copy → "new online drop in days."** Per user, shifted the page-wide narrative from "sold out online" to *a new online drop landing in days*, while keeping the list incentive ("sells out fast → the list gets first dibs"). Touched: the fact-ticker item, the 8-bit ticker line ("ONLINE: NEW DROP IN DAYS ▲ DEMAND HIGH"), the unserved lede, both success messages, the final-CTA sub, and `NextDropModal` ("Our next online drop lands in days"). All in `app/page.tsx` + `components/redesign/NextDropModal.tsx`; none test-pinned.
- **"Open in Maps ↗"** per store card (`StoreCards.tsx`) — no lat/lng in the data, so a universal `google.com/maps/search/?api=1&query=<store, address, city, state>` deep link, new tab. Styled as a compact `.cd-btn--ghost` (`.cd-store__maps`).
- **"Fun facts about {city} ✦"** reveal in the served card — toggle expands 2–3 **obviously-fictional, PG** local "facts" keyed `"City, ST"` from new `lib/area-facts.ts` (`AREA_FACTS` over 138 served cities + `FALLBACK_FACTS`; generated by a content sub-agent), with an italic "totally made up" wink. Pure client toggle (`factsOpen`). Files: `app/page.tsx`, `lib/area-facts.ts`, `app/redesign/redesign.css` (`.cd-funfacts*`).

## 2026-06-18 — New cut `/redesign/pocket-pour` — bright pink×violet DTC, mobile-first, generated lifestyle imagery

- Built a **faithful recreation of a pink→violet product-page comp the user supplied**, rebuilt **mobile-first** (designed at 390px, widens to 2-col ≥760–860px). A fresh lane vs. the dark drop-siren / loud v2 / editorial velvet-rope cuts. Theme `[data-theme="pocket-pour"]`; page `app/redesign/pocket-pour/page.tsx`; registered in the gallery. Variant tag `redesign_pocket_pour`.
- **Look:** warm near-white + soft-pink alternating grounds; **vivid violet `#7c3aed`** as the single carried accent (REMIX wordmark, eyebrows, icon-circles, comparison table, CTAs) — shared `--rd-coral/--rd-ember` tokens remapped to violet so `.rd-cta`/chips adopt it automatically. Coral→pink→lilac gradient hero with the two **real transparent cans** composited on it (crisp, mobile-perfect). Deep-violet unserved flip + magenta "you're in" badge keep the brand zip-check mechanics on-palette.
- **Type departure:** headlines use **Anton** (heavy uppercase poster grotesque), loaded via `next/font` **scoped to the redesign-only layout** (`app/redesign/layout.tsx` → `--font-poster`), so the live `/`+`/genie` Fraunces stack is untouched. In-theme `.rd-display` overrides to Anton; `em` = violet color accent (not italic, since Anton has no italic).
- **Full long page** (user chose faithful-to-comp over a trimmed slice): sticky header → hero → real zip→email **finder** (hero CTA scrolls to it) → "why switching" (red-X problems + 6 violet icon-circles) → **REMIX-vs-typical comparison table** (purple header, lavender REMIX column) → "what's inside" 4-up → Muddled Berry Mojito feature → 3 reviews → 3 serving options → FAQ accordion (native `<details>`) → purple→magenta final CTA → dark footer.
- **Imagery (user approved generating fresh):** lifestyle/cocktail shots the comp needs don't exist as real studio assets, so generated them with **Higgsfield `marketing_studio_image`**, passing the **real cans as reference media** for brand fidelity — a Paloma-over-ice glass + a two-can hero. Reused strong existing `hf_*` shots from `product-images/` (pour-into-glass splash, hand+Paloma+grapefruit, Mojito-on-pink). All downscaled to ~1200px JPGs in `public/images/pocket-pour/`. (`two-can-hero.jpg`, `ugc-friends.jpg` staged but currently unused — available for iteration.)
- Build/TS clean (`/redesign/pocket-pour` prerenders), `npm test` 14/14 green, all motion reduced-motion-gated; live `/`+`/genie`+tests untouched. QA: `SLUG=pocket-pour node scripts/qa-redesign.mjs` (widened the shared unserved matcher to also accept "not your neighborhood").

## 2026-06-19 — chrome-drop copy pass + removed lab CTA + real Remix favicon

- **Copy pass** on `app/redesign/chrome-drop/page.tsx` (per Nick's brief, copy-only): hero (eyebrow "Mocktail · Electrolyte · Mixer"; H1 **"A drink that's always here for you."** — confirmed swap off the sold-out hook, which still lives in the unlock/ticker/final; new product-promise sub); unlock idle (eyebrow "Walmart called dibs", tightened lede, submit **"Summon My Remix →"**, "Just browsing? Keep me posted →"); why-section (H2 "Why everyone keeps switching.", lead "Most mixers do you dirty.", 5 punchier problems, "Remix is built different." + craft-bartender body, benefit "Sip It or Spike It"); INSIDE + OPTIONS blurbs rewritten; final CTA (em-dash → period, button **"Drop your zip →"**). Em dashes removed from edited body copy. (Comparison TABLE, ticker, reviews, FAQ, flavor features, footer, served/unserved/success left untouched.)
- **Removed the "← Lab" hero CTA** (the back-to-lab link in the chrome-drop hero). Footer still carries a small "Redesign Lab · not the live site" dev credit.
- **Favicon → real Remix mark.** Replaced the generic black-circle `app/favicon.ico` with a coral (`#e88472`) rounded-square + white **"R"** built (Pillow, multi-size 16–256) from the brand's `Remix__Icon_Black_32x32.png`. NOTE: `app/favicon.ico` is **global** — this also updates the live `/` and `/genie` tab icon (intended brand fix). Slightly soft at large sizes (source mark is 32px) but crisp at real tab sizes.
- Unrelated: the page now imports a `TrackingProvider` (added by the user's tracking workstream); it resolved once `components/tracking/TrackingProvider.tsx` landed. Build clean, `npm test` 38/38 (tracking added tests).

## 2026-06-19 — chrome-drop polish: ambient outlines, lime electrolytes, magenta comparison pills, modal copy

- **Ambient holo outline** added to the "What's inside" cards (`.cd-inside__cell`) and retrofitted onto the "built differently" box (`.cd-built`): a rounded iridescent ring (`::before` + `mask-composite:exclude` on `var(--cd-holo)`) + a soft ambient glow (`box-shadow`), replacing `.cd-built`'s old squared `border-image`. Shimmer reduced-motion-gated.
- **Lime Electrolytes icon:** new `.cd-ic--lime` (green metallic `#D1FE17` chip, dark glyph, green glow) applied only to the what's-inside Electrolytes icon (`lime:true` flag on the `INSIDE` item); the other three stay brushed-chrome.
- **Comparison middle column → magenta pills:** `.cd-vs__label` restyled to `#ED1671` (`--cd-magenta`) pills with white text (the JUICE/SUGAR/ELECTROLYTES/ALCOHOL/CALORIES labels were hard to read); the header row's empty middle cell renders no pill.
- **Modal copy:** removed the em dash and magenta-highlighted the phrase — now "…the second it drops. **So you can taste the goodness.**" (`.cd-magenta` helper).
- **Walmart count verified:** built geo data (`served-zips.json` from `remix-store-locations.xlsx`) = 157 zips / **161 stores** / 6 states (AR,GA,KY,MI,OH,WV) → the ticker's "161 Walmart stores" is accurate; left unchanged.
- New token `--cd-magenta: #ED1671`. Build/TS clean, `npm test` 14/14; live routes untouched.

## 2026-06-19 — chrome-drop iter: two flavor features, next-drop modal, sticky disco CTA, #D1FE17 + chrome icons

- **Flavor features:** replaced the single "Tres Citrus Margarita" feature with **two** (`cd-feature` + `cd-feature--reverse`): **Muddled Berry Mojito** (new disco shot `aesthetic-comp/image-mojito-2.png` → `mojito-2.jpg`) and **Perfect Paloma** (`paloma.jpg`). **Margarita removed** from the page (dropped `marg*.jpg`; final CTA banner now uses `paloma-cans.jpg`). Each feature has two buttons: **"Find it near me"** (`cd-btn--ghost`, smooth-scrolls to page top → the finder) + **"Buy it"** (opens the next-drop modal).
- **Next-drop modal** (`components/redesign/NextDropModal.tsx`): "Our next online drop is coming soon" + email capture. Submits an **email-only lead independently** of the zip funnel (POST `path:"skipped"`, `zip:null`, `pageVariant:"redesign_chrome_drop_buy"`) so it never flips the finder to success; reuses `RedesignEmailForm` (empty heading hidden via `.rd-display:empty`), `useUtm`, honeypot + 2s time-trap (`formLoadedAt` stamped on open). ESC/backdrop close, focus-on-open, scroll-lock, in-modal success state. Verified end-to-end (lead saved).
- **Sticky disco CTA** (`components/redesign/StickyDropCta.tsx` + `.cd-dropsticky`): "✦ Don't miss the next drop" appears after scrolling ~1.3× viewport (hides near footer), opens the same modal. **Disco look = pure CSS** (adapted from the 21st.dev `badges`/`dia` components): a rotating **conic-gradient holo border** (`::before` + `mask-composite:exclude`, `cd-spin 4s`) + a **shimmer sweep** (`::after`, `cd-shimmer`). Reduced-motion-gated.
- **Accent recolor:** chrome-drop `--rd-citron` `#e9e034` → **`#D1FE17`** (bright lime) — recolors eyebrows, `em`, stars, scroll chevron, option numbers, modal accents automatically (`--rd-citron-ink` darkened to `#15200a`).
- **Chrome iconography:** `.cd-ic` chips restyled from flat citron to **brushed metallic** — `var(--cd-chrome)` fill, dark glyph, white hairline + inset bevel shadows. Reads as chrome buttons (used by the "why switching" benefits + "what's inside" cards).
- Minor: chrome `.rd-cta:hover` now re-asserts `background-image: var(--cd-holo)` so the global coral hover doesn't bleed through on holo CTAs.
- Build/TS clean, `npm test` **14/14**, motion reduced-motion-gated; live `/`+`/genie`+tests untouched.

## 2026-06-18 — New cut `/redesign/chrome-drop` ("Liquid Chrome Hype") — lifestyle hero + Pocket-Pour body, Chrome-skinned

- **New redesign `chrome-drop`** (`[data-theme="chrome-drop"]`, `app/redesign/chrome-drop/page.tsx`), built iteratively with the user (hero slice approved → full build). Drop-culture/hypebeast aesthetic: deep graphite ground + holographic/iridescent accents + liquid-chrome display type. Registered in the gallery; variant tag `redesign_chrome_drop`.
- **Hero = the user's art direction:** full-bleed **real purple Muddled Berry Mojito lifestyle photo** (from `aesthetic-comp/image-mojito.png` → `public/images/chrome-drop/hero-mojito.jpg`), white serif headline at the **top**, holographic CTA, and **4 die-cut CSS stickers** (BOMB AF / DAMN, PRETTY GOOD / THANK GOD THERE WAS REMIX / GIMME THAT) replacing carousel arrows. All 4 stickers show on mobile (repositioned to flank the can below the CTA). Chrome/holo tech: `.cd-chrome` (animated metal gradient text-clip), `.cd-holo*`, gloss sweep, holo pill `.rd-cta`, spinning sticker burst, `--cd-holo`/`--cd-holo-conic` tokens.
- **Mobile order:** zip-unlock finder is forced to the very top on mobile (`#unlock { order:-2 }`, hero `order:-1`); desktop leads with the hero. The page root is a flex column (compound `[data-theme="chrome-drop"].cd-page` — data-theme is ON the root, so the descendant selector silently no-ops; a gotcha worth remembering).
- **Body = Pocket Pour's sections, re-skinned in Chrome** (user direction: "incorporate the Pocket Pour body below my hero, in the Chrome style, replace sections 4–9"). Ported with their data/copy (placeholder — user writing final): **Why people are switching** (red-✗ problems + citron holo icon-circles), **Remix vs. a typical mixer** (reused `.cd-vs__table`), **What's inside** (4 dark-glass cards), **Tres Citrus Margarita feature** (the Margarita moment), **Reviews** (3 quote cards), **Three ways to Remix** (3 serving cards w/ Paloma shots), **FAQ** (native `<details>` accordion, holo `+`→`×`), **Final CTA** (Margarita wide banner), footer. Stickers kept hero-only (not in the body).
- **Imagery: ONLY from `aesthetic-comp/`** (per user). Mojito=hero, **Paloma** (`image-paloma`/`-1x1`/`-1x1-2`) = serving cards, **Margarita** (`image-marg-1` feature, `image-marg-2` final banner). Processed to web JPGs in `public/images/chrome-drop/`; removed the earlier Higgs-derived shots (`pour-mojito/paloma-lifestyle/two-cans`) and the stale `hero-mojito.png`.
- Build/TS clean (`/redesign/chrome-drop` prerenders), `npm test` 14/14 green, all motion reduced-motion-gated; live `/`+`/genie`+tests untouched. QA via temporary Playwright scripts (the cut has its own copy/`#unlock` anchor; the shared `qa-redesign.mjs` is tuned to older slugs).

## 2026-06-18 — Explored then SCRAPPED a Gruns-style advertorial cut (`drop-report`) — wrong direction

- Built and then **fully removed** a `/redesign/drop-report` variation: a long-form Grüns-lead-page-4/5-style **advertorial conversion funnel** (rotating announce bar, numbered "5 reasons" spine, vs-table, reviews, countdown, sticky CTA) rendered in the **literal drinkremix.co e-comm skin** (white ground, Fraunces/NT-Wagner serif, slate/sienna/teal).
- **Why scrapped:** it read as a generic DTC advertorial — a step *backward* from the bold, distinctive lab cuts (drop-siren / velvet-rope). Two compounding mistakes: (1) the long advertorial **structure** added density/spacing problems and corporate energy the brand doesn't want; (2) skinning it in the **plain real-ecomm aesthetic** stripped the personality that makes the lab cuts cool. The combination flattened it.
- **Lesson for next cuts:** the lab's value is BOLD, maximalist, distinctive aesthetics — not conversion-template advertorials, and not a faithful copy of the (fairly plain) e-comm site. Keep the short hero→zip-check shape; spend the energy on a striking *look*, not a long funnel. Reverted: route, components, `[data-theme="drop-report"]` CSS, gallery entry — all gone; live `/`+`/genie`+tests untouched.

## 2026-06-17 — v2 reworked: BRIGHT & loud (not dark), real assets, sticker callouts, split battle card

Direction correction after review of the dark v2. Six fixes:
1. **v2 pivoted from dark → bright/loud/punchy.** Dark made it "fall flat." `[data-theme="drop-siren-v2"]` is now a warm-cream ground (`#fdf0e1`) with hot coral `#ef5b3c` + acid citron `#e9e034`; hero is a light citron/coral wash (`.ds2-hero`), not the dark aurora. v1 (`/redesign/drop-siren`) stays dark as the earlier reference. The shared dark `.rd-*` overrides are back to `[data-theme="drop-siren"]`-only.
2. **Real product imagery.** The correct shots live in repo-root `product-images/` (NOT the AI "remix-draft" lifestyle images, which were wrong and removed). Copied the clean single cans → `public/images/remix-paloma.png` + `remix-mojito.png` (700×1500). v1 + velvet-rope success now point at these too (they were using the wrong 4-pack `can-*.png`; those `can-*.png` stay because `lib/constants.ts`/live site reference them).
3. **Lifestyle gallery removed** from v2 (assets weren't ours).
4. **Callouts redesigned as die-cut stickers** (`.qc-sticker`): rotated, 4px white border, chunky offset shadow, emoji tab; bright citron/coral/navy. Copy is the user's cheeky voice ("Sip it straight / because it's good as AF", "Mix it with anything / makes drinks better and hangovers hurt less"). A `.sticker-slap` ("Good as AF") sits on the hero can.
5. **Battle card now splits down the middle** (`.bc::after` center rule) like DrinkRemix: REMIX (highlighted) | Others, feature label as a pill centered on the divider, green-check/red-X.
6. **Dancing can kept** above the fold (jiggle), now bright + framed as a sticker tile.

Build/TS/lint clean; live routes + tests untouched. QA: `SLUG=drop-siren-v2 node scripts/qa-redesign.mjs`.

## 2026-06-17 — Drop Siren locked as v1; v2 "Relentless" added; orb removed

- **Drop Siren chosen as the winning direction** (dark maximalist beats refined editorial for this brand — dark ground makes coral/citron detonate, the melt reads as liquid, uppercase serif = poster energy). Locked as **v1** (`/redesign/drop-siren`).
- **Removed the glowing "vessel" orb everywhere** — it was a HeyGenverse-blueprint motif, **not a real Remix asset**. Swapped to the real product can (`can-paloma.png`) in v1 hero + both success states and velvet-rope success. (The `.vessel` class still exists in `globals.css` for the live `/`+`/genie`; only the redesigns dropped it.)
- **Real imagery added** to `public/images/`: `lifestyle-gameon|cheers|everyonesin.png` (branded lifestyle creative) + existing cans. New `components/redesign/RemixImg.tsx` (next/image wrapper) is the only way redesigns load imagery.
- **New redesign `/redesign/drop-siren-v2` ("Relentless")** — v1 pushed harder, fully functional, scoped `[data-theme="drop-siren-v2"]`:
  - **The store finder is now the LOUD vibrant peak** (`.ds2-finder`) — a citron→coral gradient block that breaks the dark hero so it's impossible to miss (per direction: "more attention to the finder, not dark, loud & vibrant"). White zip input, dark uppercase CTA, glow pulse; melt/flip results sit on a dark panel inside it.
  - **Punchy quote callouts** (`.qc-card`, cheeky voice): "Sip it straight / because it's good as AF", "Mix it with anything / makes drinks better and hangovers hurt less", "Cheers, no catch". Alternating citron/coral/dark.
  - **REMIX-vs-others battle card** (`.bc`) recreated from the real DrinkRemix comparison table (2-col product header → dashed 3-col rows, green-check/red-X, winner gradient pill), re-skinned dark with the real Mojito can.
  - Lifestyle gallery (the 3 branded shots), sparkle burst on success, retained marquee + line-reveal + tada-jiggle (now on the can).
- Shared dark-theme overrides now target `:is([data-theme="drop-siren"], [data-theme="drop-siren-v2"])` so both stay DRY. Build/TS/lint clean; live routes + tests untouched. QA: `SLUG=drop-siren-v2 node scripts/qa-redesign.mjs` (now auto-scrolls so lazy images load).
- Why: user locked the Siren direction and asked for a relentless v2 leveraging the extracted CSS/components + real product imagery, with the store finder dialed up and loud.

## 2026-06-17 — Redesign Lab added at `/redesign` (isolated, non-destructive)

- New **redesign comparison lab** so multiple full redesigns can coexist without touching the live `/` and `/genie`. Gallery index at `/redesign`; each redesign at `/redesign/<slug>`.
- **Isolation pattern:** theme tokens are scoped under `[data-theme="<slug>"]` in `app/redesign/redesign.css` (imported only by `app/redesign/layout.tsx`), so themes never leak into each other or the live build. Shared `.rd-*` structural classes read `var(--rd-*)` tokens each theme supplies. Add a redesign = add a token block + a page + a gallery entry.
- **Shared real functionality:** `components/redesign/useFunnel.ts` is a headless hook wrapping the actual zip-lookup + `/api/subscribe` flow (identical behavior to the live funnels). Leads are segmented by `pageVariant` (`redesign_velvet_rope`, `redesign_drop_siren`). Reusable themed pieces: `RedesignEmailForm`, `StoreCards`.
- **Two redesigns shipped**, both fully functional (real zip → email):
  - **Velvet Rope** (`/redesign/velvet-rope`) — refined editorial, white-forward. Line-by-line hero reveal (Chain Zoku `--line-index` mechanic), oversized "Are you in?" pill zip check.
  - **Drop Siren** (`/redesign/drop-siren`) — maximalist dark-ground hype. Drifting CSS aurora, Behave-style attention-jiggle on the orb (JS interval, reduced-motion-guarded), rotated sticker marquee, coral × citron hover-inversion CTA.
- **Signature steal — the "melt + flip" zip check** (from the Behave + Liquid Death teardown, recolored to Remix): on a served hit, a coral bar floods down with a drippy `clip-path` leading edge + citron "YOU'RE IN" badge; on a miss, the panel flips to navy. Implemented in `redesign.css` (`@keyframes rd-melt` / `rd-flip`), reduced-motion-gated.
- All new motion respects `prefers-reduced-motion`; build/TS/lint clean; existing `/`+`/genie` and all tests untouched. QA: `SLUG=velvet-rope|drop-siren node scripts/qa-redesign.mjs` → `qa-screenshots/redesign-<slug>/`.
- Why: user is iterating toward multiple redesigns and wanted to see new themes separately from the current theme + functionality. The lab makes redesigns additive and comparable, not destructive.

## 2026-06-17 — Infrastructure + docs established

- Added `docs/` (DESIGN, COPY, ARCHITECTURE, this log), authoritative `CLAUDE.md`, and `.claude/` (settings, hooks, design-reviewer subagent, /design-qa skill). No app behavior change.
- This log begins here as the living record for the design-focused workstream.

## 2026-06-16 — v2 "genie" variant added at `/genie`

- "Sold Out Online" moved out of the hero to *after* zip submit. Genie rises from the lamp/orb; served → "lucky few" + stores + sparkles + "Sign up"; unserved → sold-out/Walmart-dibs/new-batches urgency + "Sign up"; malformed → inline error. Leads tagged `pageVariant: "genie_v2"`.
- Genie is pure SVG/CSS (`components/genie/`); redesigned once after first pass read as stacked blobs rather than a character.

## 2026-06-16 — v1 redesigned into the "Warm Paper" editorial system

- Swapped display font to **Fraunces** (italic-`em` coral accent = signature move); built hairline magazine grid, declaration slab, navy dark breaks, citrus vessel orb; palette is Remix's own coral/peach/navy/citron expressed through an editorial structure.
- Self-rated 7→9; remaining gap is assets (lifestyle photography, licensed NT Wagner), not system.
