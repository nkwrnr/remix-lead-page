// Pixel QA probe — drives "/" (Chrome Drop) on an already-running server and
// verifies the Meta Web Pixel + internal capture actually fire end-to-end. It
// wraps window.fbq so every call is logged even if fbevents.js is network-blocked,
// and watches the network for facebook.com/tr beacons + /api/capture + /api/subscribe.
//
//   npm run qa:pixel                       # against http://localhost:3000
//   QA_BASE=http://localhost:3100 npm run qa:pixel
//
// ⚠️  RUN AGAINST A LOCAL SERVER ONLY. It walks the real funnel, so it SUBMITS A
//     REAL LEAD (qa-pixel-*@example.com) and FIRES REAL PIXEL EVENTS to Meta.
//     Never point QA_BASE at production — it would pollute your leads DB and
//     Meta ad data. Local QA leads are cleanable; the e2e DB is separate.
import { chromium, devices } from "@playwright/test";

const BASE = process.env.QA_BASE || "http://localhost:3000";

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const context = await browser.newContext({ ...devices["iPhone 13"] });
const page = await context.newPage();

await page.addInitScript(() => {
  window.__fbqCalls = [];
  let inner;
  Object.defineProperty(window, "fbq", {
    configurable: true,
    get() { return inner; },
    set(v) {
      inner = new Proxy(v, {
        apply(fn, thisArg, args) {
          window.__fbqCalls.push(args);
          return Reflect.apply(fn, thisArg, args);
        },
      });
    },
  });
});

const net = [];
page.on("request", (req) => {
  const url = req.url();
  if (url.includes("facebook.com/tr") || url.includes("connect.facebook.net") ||
      url.includes("/ingest") || url.includes("/api/capture") || url.includes("/api/subscribe")) {
    net.push({ method: req.method(), url, body: req.postData() || undefined });
  }
});
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const calls = () => page.evaluate(() => window.__fbqCalls);

console.log(`\n▶ QA against ${BASE}\n`);
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1800); // TrackingProvider mounts + fires Launch
const afterLoad = (await calls()).length;

// Served zip → Harrison, AR
await page.getByLabel("Zip code").fill("72601");
await page.getByRole("button", { name: /Summon My Remix/i }).click();
await page.getByText(/Remix is in/i).waitFor({ timeout: 15000 });
await page.waitForTimeout(400);
const afterZip = (await calls()).length;

// Email (wait past 2s time-trap so /api/subscribe writes)
await page.waitForTimeout(2300);
const email = `qa-pixel-${Date.now()}@example.com`;
await page.getByLabel("Email address").fill(email);
await page.getByRole("checkbox").check();
await page.getByRole("button", { name: /I'm in/i }).click();
await page.getByText(/You're on the list/i).waitFor({ timeout: 15000 });
await page.waitForTimeout(1200);

const all = await calls();
const names = all.map((c) => `${c[0]}:${c[1]}`);

console.log("===== fbq() CALLS =====");
for (const c of all) console.log("  " + JSON.stringify(c));
console.log(`\n  (launch-phase: ${afterLoad}, after-zip: ${afterZip}, total: ${all.length})`);

console.log("\n===== NETWORK (facebook + internal) =====");
for (const n of net) {
  console.log(`  ${n.method} ${n.url.length > 110 ? n.url.slice(0, 110) + "…" : n.url}`);
  if (n.body) console.log(`      body: ${n.body}`);
}
console.log("\n===== CONSOLE ERRORS =====\n  " + (errors.join("\n  ") || "(none)"));

// ── Verdicts ────────────────────────────────────────────────────────────────
const has = (n) => names.includes(n);
const emInit = all.find((c) => c[0] === "init" && c[2] && typeof c[2] === "object" && "em" in c[2]);
const capture = net.find((n) => n.url.includes("/api/capture") && n.method === "POST");
const subscribe = net.find((n) => n.url.includes("/api/subscribe") && n.method === "POST");
const fbBeacon = net.some((n) => n.url.includes("facebook.com/tr"));
const fbScript = net.some((n) => n.url.includes("fbevents.js"));

const checks = [
  ["PageView fired", has("track:PageView")],
  ["Launch fired", has("trackCustom:Launch")],
  ["Submit zip code fired", has("trackCustom:Submit zip code")],
  ["Submit email fired", has("trackCustom:Submit email")],
  ["standard Lead fired", has("track:Lead")],
  ["Advanced Matching (em) on submit", !!emInit],
  ["/api/capture POST (zip_submit, 72601)", !!capture && capture.body?.includes("zip_submit") && capture.body?.includes("72601")],
  ["/api/subscribe POST carries sessionId+capturedZip", !!subscribe && subscribe.body?.includes("sessionId") && subscribe.body?.includes("capturedZip")],
  ["fbevents.js loaded from network", fbScript],
  ["beacon sent to facebook.com/tr", fbBeacon],
  ["PostHog /ingest event sent", net.some((n) => n.url.includes("/ingest"))],
];

console.log("\n===== VERDICT =====");
let fail = 0;
for (const [label, ok] of checks) {
  console.log(`  ${ok ? "✅" : "❌"} ${label}`);
  // network-to-facebook checks are informational (may be blocked in sandbox)
  if (!ok && !label.includes("facebook") && !label.includes("PostHog")) fail++;
}

await browser.close();
console.log(fail === 0 ? "\n✓ All dispatch checks passed.\n" : `\n✗ ${fail} dispatch check(s) failed.\n`);
process.exit(fail === 0 ? 0 : 1);
