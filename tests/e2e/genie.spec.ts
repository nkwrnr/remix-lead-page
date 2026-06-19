import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";

const DB = "data/leads.e2e.db";

function leadByEmail(email: string) {
  const db = new Database(DB, { readonly: true });
  try {
    return db
      .prepare("SELECT * FROM leads WHERE email = ? ORDER BY created_at DESC LIMIT 1")
      .get(email) as Record<string, unknown> | undefined;
  } finally {
    db.close();
  }
}

const uniq = (tag: string) => `e2e-genie-${tag}-${Date.now()}@example.com`;

test("Served zip → genie + lucky few → Sign up lands with served=1, genie_v2", async ({ page }) => {
  const email = uniq("served");
  await page.goto("/genie?utm_source=instagram&utm_campaign=genie");

  await page.getByLabel("Zip code").fill("72601");
  await page.getByRole("button", { name: /Summon Remix/i }).click();

  // genie reveal
  await expect(page.getByText(/In your zip code/i)).toBeVisible();
  await expect(page.getByText(/lucky few/i)).toBeVisible();
  await expect(page.getByText(/Harrison, AR/i)).toBeVisible();
  await expect(page.getByText(/sold out online/i)).toBeVisible();

  await page.waitForTimeout(2300); // clear the bot time-trap
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Sign up$/i }).click();

  await expect(page.getByText(/Consider it granted/i)).toBeVisible();

  const row = leadByEmail(email);
  expect(row, "lead row should exist").toBeTruthy();
  expect(row!.served).toBe(1);
  expect(row!.zip).toBe("72601");
  expect(row!.page_variant).toBe("genie_v2");
  expect(row!.utm_source).toBe("instagram");
});

test("Unserved zip → sold-out/waitlist narrative → Sign up lands with served=0", async ({ page }) => {
  const email = uniq("unserved");
  await page.goto("/genie");

  await page.getByLabel("Zip code").fill("99999");
  await page.getByRole("button", { name: /Summon Remix/i }).click();

  await expect(page.getByText(/hasn't reached you/i)).toBeVisible();
  await expect(page.getByText(/Walmart called dibs/i)).toBeVisible();

  await page.waitForTimeout(2300);
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Sign up$/i }).click();

  await expect(page.getByText(/first in line/i)).toBeVisible();

  const row = leadByEmail(email);
  expect(row).toBeTruthy();
  expect(row!.served).toBe(0);
  expect(row!.zip).toBe("99999");
  expect(row!.page_variant).toBe("genie_v2");
});

test("Malformed zip → inline error, no genie reveal", async ({ page }) => {
  await page.goto("/genie");
  await page.getByLabel("Zip code").fill("123");
  await page.getByRole("button", { name: /Summon Remix/i }).click();
  await expect(page.getByText(/valid 5-digit zip/i)).toBeVisible();
  await expect(page.getByText(/In your zip code/i)).toHaveCount(0);
});

test("Genie honeypot submission writes NO row", async ({ page }) => {
  const email = uniq("bot");
  await page.goto("/genie");
  await page.getByLabel("Zip code").fill("99999");
  await page.getByRole("button", { name: /Summon Remix/i }).click();
  await expect(page.getByText(/hasn't reached you/i)).toBeVisible();

  await page.waitForTimeout(2300);
  await page.locator('input[name="website"]').fill("bot", { force: true });
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /^Sign up$/i }).click();

  await expect(page.getByText(/first in line/i)).toBeVisible();
  expect(leadByEmail(email)).toBeFalsy();
});
