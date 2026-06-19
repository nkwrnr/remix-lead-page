// Capture screenshots of OUR landing page across states + breakpoints for visual QA.
// Requires the dev server running. Usage: BASE_URL=http://localhost:3100 node scripts/qa-shots.mjs
import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const OUT = "qa-screenshots/page";
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

for (const vp of viewports) {
  const ctx = await browser.newContext(vp.opts);
  const page = await ctx.newPage();
  const t = vp.tag;
  console.log("viewport:", t);

  // 1) Hero / idle (above the fold)
  await page.goto(`${BASE}/?utm_source=instagram&utm_campaign=qa`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot(page, `${t}-1-hero`);

  // 2) Full page
  await page.screenshot({ path: `${OUT}/${t}-2-full.png`, fullPage: true });
  console.log("  shot", `${t}-2-full`);

  // 3) Finder idle
  await page.locator("#finder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, `${t}-3-finder`);

  // 4) Path A — served result
  await page.getByLabel("Zip code").fill("72601");
  await page.getByRole("button", { name: "Find Remix near me" }).click();
  await page.getByText(/right around the corner/i).waitFor();
  await page.locator("#finder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, `${t}-4-pathA-result`);

  // 5) Path A — confirmation
  await page.waitForTimeout(2300);
  await page.getByLabel("Email address").fill(`qa-${t}-a@example.com`);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Notify me when it drops/i }).click();
  await page.getByText(/You're in/i).waitFor();
  await page.locator("#finder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, `${t}-5-pathA-confirm`);

  // 6) Path B — unserved
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.getByLabel("Zip code").fill("99999");
  await page.getByRole("button", { name: "Find Remix near me" }).click();
  await page.getByText(/isn't in your neighborhood/i).waitFor();
  await page.locator("#finder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, `${t}-6-pathB`);

  // 7) Privacy page
  await page.goto(`${BASE}/privacy`, { waitUntil: "networkidle" });
  await shot(page, `${t}-7-privacy`);

  await ctx.close();
}

await browser.close();
console.log("done ->", OUT);
