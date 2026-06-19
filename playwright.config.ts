import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    channel: "chrome", // drive installed Chrome — no browser download
  },
  projects: [
    {
      name: "mobile",
      // iPhone 13 viewport but driven by Chromium/installed Chrome (not WebKit).
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        defaultBrowserType: "chromium",
      },
    },
  ],
  webServer: {
    command: `next dev -p ${PORT}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      LEAD_BACKEND: "local",
      LEADS_DB_PATH: "data/leads.e2e.db",
      ADMIN_TOKEN: "dev",
      NEXT_PUBLIC_SITE_URL: BASE,
    },
  },
});
