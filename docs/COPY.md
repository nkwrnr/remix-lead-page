# Copy Deck — Remix Lead Page

Every user-facing string and where it lives, plus brand voice. Edit copy here-aware so you don't break tests. Design lives in [DESIGN.md](./DESIGN.md).

## Brand voice

- **Tagline / spine:** *Big Flavor, Clean Ingredients, Zero Regrets.*
- **Tone:** confident, playful, a little cheeky; concrete over abstract; short declaratives. Scarcity is honest, not desperate ("our drops sell out on purpose / in record demand").
- **Facts:** 0.0% ABV, under 20 cal, 3g sugar, real juice, electrolytes, vegan + gluten-free, $12.99. Two flavors: **Perfect Paloma** (grapefruit · lime), **Muddled Berry Mojito** (blackberry · lime · mint). In **161 Walmart stores**, 6 states; sold out online.
- **Emoji:** sparing and warm (🍃 🥂 ✨ 🗺️).

## Where copy lives

| Surface | Component / file |
|---|---|
| Announcement bar, footer | `components/landing/Chrome.tsx` |
| Hero (`/`) | `components/landing/HeroSection.tsx` |
| Zip finder + Path A/B headings (`/`) | `components/landing/LandingFunnel.tsx` |
| Store result + sold-out banner | `components/landing/PathA.tsx` |
| Email form (both variants) | `components/landing/EmailCapture.tsx` (props `heading`, `cta`) |
| Confirmation (`/`) | `components/landing/ConfirmationView.tsx` |
| Why-Remix / products / social / declaration | `components/landing/Persuasion.tsx` |
| Genie hero + all genie states (`/genie`) | `components/genie/GenieExperience.tsx` |
| Genie speech bubble | `components/genie/GenieExperience.tsx` (+ `Genie.tsx` `SpeechBubble`) |
| Product names / flavors / blurbs / nutrition | `lib/constants.ts` (`PRODUCTS`, `NUTRITION_BADGES`) |
| Privacy policy | `app/privacy/page.tsx` |
| Page `<title>`/meta | `app/layout.tsx`, `app/genie/page.tsx` |

## `/` (editorial) key strings

- Announcement: "Now in 161 Walmart stores · Online drops sell out fast"
- Hero: eyebrow "Big Flavor · Zero Proof" → H1 "Sold out online. / Not sold out **on you.**" → lede → CTA "Find Remix near me ↓"
- Finder: eyebrow "Where are you sipping?" → "Find Remix **near you.**" → button **"Find Remix near me"** → skip "Not sure / just browsing →"
- Path A: "Good news, {city} — Remix is **right around the corner.** 🍃" → store card → SoldOutBanner "Our online drops sell out **on purpose.**" → email heading "Want first dibs on the next drop?" / cta "Notify me when it drops"
- Path B: "Remix isn't in your neighborhood… **yet.**" → email heading "Put my zip on the map" / cta "Notify me when Remix arrives"
- Confirmation: "You're **in.**" (served) / "Officially **on the map.**" (unserved)

## `/genie` key strings

- Hero idle: eyebrow "Make a wish" → "Find your **Remix.**" → lede "Rub the lamp. Drop your zip. See if the genie's got good news." → button **"Summon Remix ✨"**
- Speech bubble: "In your zip code {zip}…"
- Served: "You're one of the **lucky few.** ✨" → "The genie found Remix near you." → store list → P.S. card "**P.S. — sold out online.** Our drops sell out fast. Sign up for first dibs on the next one." → email heading "Sign up for drop alerts" / cta **"Sign up"**
- Unserved: "Remix hasn't reached you… **yet.**" → card "Sold out online. Our last online drop sold out in record demand — and **Walmart called dibs** on the rest. We're brewing new batches that ship nationwide, and bringing Remix to more places…" → email heading "Be first when Remix arrives" / cta **"Sign up"**
- Success: "Consider it **granted.**" (served) / "You're **first in line.**" (unserved)

## ⚠️ Test-pinned strings (change copy AND the spec together)

These exact substrings are asserted in `tests/e2e/*` — if you edit them, update the specs in the same change or e2e fails:

- **funnel.spec.ts:** `Find Remix near me`, `right around the corner`, `Harrison, AR`, `sell out on purpose`, `Notify me when it drops`, `You're in`, `isn't in your neighborhood`, `Notify me when Remix arrives`, `Officially on the map`, `just browsing`, `valid 5-digit zip`; labels `Zip code`, `Email address`.
- **genie.spec.ts:** `Summon Remix`, `In your zip code`, `lucky few`, `Harrison, AR`, `sold out online`, `Sign up`, `Consider it granted`, `hasn't reached you`, `Walmart called dibs`, `first in line`, `valid 5-digit zip`.

Accessibility labels (`Zip code`, `Email address`) and the honeypot field name (`website`) are also referenced by tests — keep them stable.

## Chrome Drop (live `/`) — additive strings (2026-06-19)

Not test-pinned; all in `app/page.tsx` unless noted. Voice = cheeky, honest scarcity, no literal claims.

- **Time expectation — "new online drop in days."** Page-wide narrative: a new **online** drop lands in **days** and sells out fast, so the email list gets first dibs. Spots: fact-ticker item "New online drop in days"; unserved lede "A new online drop lands in days — and it sells out fast. Lock your spot for first dibs…"; success (served) "The next online drop lands in days — and you'll hear first…"; success (unserved) "A new online drop lands in days…"; final CTA "A new online drop lands in days — and it'll sell out fast. The list hears first."; `NextDropModal` headline "Our next online drop lands **in days.**"
- **8-bit stock-ticker crawl** (`NEWS[]`, rendered in `.cd-newsbar`, pixel `--font-pixel`): "REMIX DROPPING AT WALMART AHEAD OF THE FOURTH OF JULY — CHECK STORES NOW" · "RMX ▲ 161 STORES" · "ONLINE: NEW DROP IN DAYS ▲ DEMAND HIGH". Fixed tag: **"BREAKING"** (red LED). Terse, uppercase, `▲`/`◆` glyphs only — no emoji.
- **Served store card** (`components/redesign/StoreCards.tsx`): **"Open in Maps ↗"** (deep-links to the matched store).
- **Served fun-facts reveal:** toggle **"Fun facts about {city} ✦"** / **"Hide the fun facts ✦"**; wink line "Totally made up, obviously. We just think {city} rules." Fact content is obviously-fictional and lives in `lib/area-facts.ts` (`AREA_FACTS` keyed `"City, ST"` + `FALLBACK_FACTS`).

## Keeping this doc alive

When you rewrite copy, update the relevant rows here and append a dated note to [DESIGN-LOG.md](./DESIGN-LOG.md).
