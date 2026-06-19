import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";

const DB = "data/leads.e2e.db";

/** Read the most recent lead row for an email directly from SQLite. */
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

function uniqueEmail(tag: string) {
  return `e2e-${tag}-${Date.now()}@example.com`;
}

test("Path A: served zip → store card → email lands in DB with served=1", async ({ page }) => {
  const email = uniqueEmail("served");
  await page.goto("/redesign/warm-paper?utm_source=instagram&utm_medium=paid_social&utm_campaign=launch");

  await page.getByLabel("Zip code").fill("72601");
  await page.getByRole("button", { name: "Find Remix near me" }).click();

  // Store result renders
  await expect(page.getByText(/Remix is right around the corner/i)).toBeVisible();
  await expect(page.getByText(/Harrison, AR/i)).toBeVisible();
  await expect(page.getByText(/sell out on purpose/i)).toBeVisible();

  // wait past the 2s time-trap, then submit email
  await page.waitForTimeout(2300);
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Notify me when it drops/i }).click();

  await expect(page.getByText(/You're in/i)).toBeVisible();

  const row = leadByEmail(email);
  expect(row, "lead row should exist").toBeTruthy();
  expect(row!.served).toBe(1);
  expect(row!.zip).toBe("72601");
  expect(String(row!.matched_store)).toContain("Harrison");
  expect(row!.utm_source).toBe("instagram");
  expect(row!.utm_campaign).toBe("launch");
  expect(row!.consent).toBe(1);
});

test("Path B: unserved zip → demand copy → email lands with served=0", async ({ page }) => {
  const email = uniqueEmail("unserved");
  await page.goto("/redesign/warm-paper");

  await page.getByLabel("Zip code").fill("99999");
  await page.getByRole("button", { name: "Find Remix near me" }).click();

  await expect(page.getByText(/isn't in your neighborhood/i)).toBeVisible();

  await page.waitForTimeout(2300);
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Notify me when Remix arrives/i }).click();

  await expect(page.getByText(/Officially on the map/i)).toBeVisible();

  const row = leadByEmail(email);
  expect(row, "lead row should exist").toBeTruthy();
  expect(row!.served).toBe(0);
  expect(row!.zip).toBe("99999");
});

test("Skip → Path B with null zip", async ({ page }) => {
  const email = uniqueEmail("skip");
  await page.goto("/redesign/warm-paper");

  await page.getByRole("button", { name: /just browsing/i }).click();
  await expect(page.getByText(/isn't in your neighborhood/i)).toBeVisible();

  await page.waitForTimeout(2300);
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Notify me when Remix arrives/i }).click();

  await expect(page.getByText(/Officially on the map/i)).toBeVisible();

  const row = leadByEmail(email);
  expect(row).toBeTruthy();
  expect(row!.zip).toBeNull();
});

test("Anti-spam: honeypot submission writes NO row", async ({ page }) => {
  const email = uniqueEmail("bot");
  await page.goto("/redesign/warm-paper");
  await page.getByRole("button", { name: /just browsing/i }).click();

  await page.waitForTimeout(2300);
  // Fill the hidden honeypot field that a real user never touches.
  await page.locator('input[name="website"]').fill("i-am-a-bot", { force: true });
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Notify me when Remix arrives/i }).click();

  // UI still shows success (we don't tip off bots), but no DB row is written.
  await expect(page.getByText(/Officially on the map/i)).toBeVisible();
  expect(leadByEmail(email)).toBeFalsy();
});

test("Invalid zip shows inline error", async ({ page }) => {
  await page.goto("/redesign/warm-paper");
  await page.getByLabel("Zip code").fill("123");
  await page.getByRole("button", { name: "Find Remix near me" }).click();
  await expect(page.getByText(/valid 5-digit zip/i)).toBeVisible();
});
