// Capture reference screenshots of the live drinkremix.co site for the design-fidelity pass.
// Usage: node scripts/qa-reference.mjs
import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const OUT = 'qa-screenshots/reference';
const PAGES = [
  ['home', 'https://drinkremix.co'],
  ['paloma', 'https://drinkremix.co/products/remix-perfect-paloma'],
  ['mojito', 'https://drinkremix.co/products/remix-muddled-berry-mojito-single-can'],
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });

for (const [name, url] of PAGES) {
  // Mobile capture
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await mobile.newPage();
  try {
    await mp.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await mp.waitForTimeout(1500);
    await mp.screenshot({ path: `${OUT}/${name}-mobile.png`, fullPage: true });
    console.log('captured', `${name}-mobile`);
  } catch (e) { console.log('FAIL', name, 'mobile:', e.message.split('\n')[0]); }
  await mobile.close();

  // Desktop capture
  const desk = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dp = await desk.newPage();
  try {
    await dp.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await dp.waitForTimeout(1500);
    await dp.screenshot({ path: `${OUT}/${name}-desktop.png`, fullPage: true });
    console.log('captured', `${name}-desktop`);
  } catch (e) { console.log('FAIL', name, 'desktop:', e.message.split('\n')[0]); }
  await desk.close();
}

await browser.close();
console.log('done ->', OUT);
