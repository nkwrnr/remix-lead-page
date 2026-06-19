// Screenshots of the redesign lab across states + breakpoints.
// Requires dev server. Usage: BASE_URL=http://localhost:3000 node scripts/qa-redesign.mjs
import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SLUG = process.env.SLUG || "velvet-rope";
const OUT = `qa-screenshots/redesign-${SLUG}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const viewports = [
  { tag: "mobile", opts: { ...devices["iPhone 13"] } },
  { tag: "desktop", opts: { viewport: { width: 1280, height: 900 } } },
];

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("  shot", name);
}

// scroll through the page so lazy next/image assets load before a fullPage shot
async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

// gallery (desktop only)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/redesign`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/gallery.png`, fullPage: true });
  console.log("  shot gallery");
  await ctx.close();
}

let didSuccess = false;
for (const vp of viewports) {
  const ctx = await browser.newContext(vp.opts);
  const page = await ctx.newPage();
  const t = vp.tag;
  console.log("viewport:", t);

  // hero + full
  await page.goto(`${BASE}/redesign/${SLUG}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900); // let line-reveal settle
  await shot(page, `${t}-1-hero`);
  await autoScroll(page); // trigger lazy images
  await page.screenshot({ path: `${OUT}/${t}-2-full.png`, fullPage: true });
  console.log("  shot", `${t}-2-full`);

  // served — the melt
  await page.getByLabel("Zip code").fill("72601");
  await page.getByRole("button", { name: /see if i'm in|summon the drop|find remix near me/i }).click();
  await page.getByText(/right around the corner/i).waitFor();
  await page.locator("#finder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900); // let melt land
  await shot(page, `${t}-3-served-melt`);

  // success (once, to avoid rate limit) — desktop
  if (!didSuccess && t === "desktop") {
    await page.waitForTimeout(2300); // clear 2s time-trap
    await page.getByLabel("Email address").fill(`qa-rd-${SLUG}@example.com`);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /notify me when it drops|^sign up$/i }).click();
    await page.getByRole("heading", { name: /you're in|consider it granted|first in line/i }).waitFor();
    await page.waitForTimeout(400);
    await shot(page, `${t}-4-success`);
    didSuccess = true;
  }

  // unserved — the flip
  await page.goto(`${BASE}/redesign/${SLUG}`, { waitUntil: "networkidle" });
  await page.getByLabel("Zip code").fill("99999");
  await page.getByRole("button", { name: /see if i'm in|summon the drop|find remix near me/i }).click();
  await page.getByText(/not in your city|hasn't reached you|not your city|not your neighborhood/i).waitFor();
  await page.locator("#finder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700); // let flip land
  await shot(page, `${t}-5-unserved-flip`);

  await ctx.close();
}

await browser.close();
console.log("done ->", OUT);
