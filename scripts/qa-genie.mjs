// Screenshots of the /genie experience across states + breakpoints.
// Requires dev server. Usage: BASE_URL=http://localhost:3100 node scripts/qa-genie.mjs
import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const OUT = "qa-screenshots/genie";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const viewports = [
  { tag: "mobile", opts: { ...devices["iPhone 13"] } },
  { tag: "desktop", opts: { viewport: { width: 1280, height: 950 } } },
];

for (const vp of viewports) {
  const ctx = await browser.newContext(vp.opts);
  const page = await ctx.newPage();
  const t = vp.tag;
  console.log("viewport:", t);

  // idle lamp
  await page.goto(`${BASE}/genie?utm_source=instagram&utm_campaign=qa`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${t}-1-idle.png` });

  // served reveal
  await page.getByLabel("Zip code").fill("72601");
  await page.getByRole("button", { name: /Summon Remix/i }).click();
  await page.getByText(/lucky few/i).waitFor();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${t}-2-served.png` });
  await page.screenshot({ path: `${OUT}/${t}-2-served-full.png`, fullPage: true });

  // served success
  await page.waitForTimeout(2300);
  await page.getByLabel("Email address").fill(`qa-genie-${t}-a@example.com`);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Sign up$/i }).click();
  await page.getByText(/Consider it granted/i).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${t}-3-served-success.png` });

  // unserved reveal
  await page.goto(`${BASE}/genie`, { waitUntil: "networkidle" });
  await page.getByLabel("Zip code").fill("99999");
  await page.getByRole("button", { name: /Summon Remix/i }).click();
  await page.getByText(/hasn't reached you/i).waitFor();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${t}-4-unserved.png` });

  await ctx.close();
}

await browser.close();
console.log("done ->", OUT);
