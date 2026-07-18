#!/usr/bin/env node
import { chromium } from '@playwright/test';

const baseUrl = (process.env.SMOKE_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const browserChannel = process.env.SMOKE_BROWSER_CHANNEL ?? 'chrome';
const publicRoutes = (process.env.SMOKE_PUBLIC_ROUTES ?? '/auth/login,/auth/forgot-password')
  .split(',').map((route) => route.trim()).filter(Boolean);
const authenticatedRoutes = (process.env.SMOKE_AUTH_ROUTES ?? '/,/accounts,/stocks,/warehouses,/goods-receipts,/transfer-orders,/shipments,/purchase-orders,/sales-orders,/pricing,/inventory-counts,/inventory/transactions,/e-documents,/accounting/accounts')
  .split(',').map((route) => route.trim()).filter(Boolean);
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;
const issues = [];

let browser;
try {
  browser = await chromium.launch({ channel: browserChannel, headless: true });
} catch (error) {
  console.error(`UI smoke test could not start ${browserChannel}. Set SMOKE_BROWSER_CHANNEL or run: npx playwright install chromium`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let activeRoute = '';
page.on('pageerror', (error) => issues.push(`${activeRoute}: pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') issues.push(`${activeRoute}: console.error: ${message.text()}`);
});
page.on('response', (response) => {
  if (response.status() >= 400) {
    issues.push(`${activeRoute}: resource HTTP ${response.status()}: ${response.url()}`);
  }
});

async function visit(route) {
  activeRoute = route;
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  if (!response || response.status() >= 400) issues.push(`${route}: HTTP ${response?.status() ?? 'no response'}`);
  const bodyText = await page.locator('body').innerText();
  if (/Tooltip.*must be used within.*TooltipProvider/i.test(bodyText)) issues.push(`${route}: TooltipProvider runtime error is visible.`);
  if (/translation missing|missing translation/i.test(bodyText)) issues.push(`${route}: missing translation marker is visible.`);
}

try {
  for (const route of publicRoutes) await visit(route);

  if (email && password) {
    activeRoute = '/auth/login';
    await page.goto(`${baseUrl}/auth/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('form [role="combobox"]').click();
    const branchOptions = page.getByRole('option');
    if (await branchOptions.count()) await branchOptions.first().click();
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith('/auth/'), { timeout: 15_000 }),
      page.locator('button[type="submit"]').click(),
    ]);
    for (const route of authenticatedRoutes) await visit(route);
  } else {
    console.log('Authenticated route sweep skipped. Set SMOKE_EMAIL and SMOKE_PASSWORD to enable it.');
  }
} finally {
  await browser.close();
}

if (issues.length) {
  console.error(`UI smoke test failed: ${issues.length} issue(s).`);
  console.error([...new Set(issues)].join('\n'));
  process.exit(1);
}

console.log(`UI smoke test: OK — ${publicRoutes.length + (email && password ? authenticatedRoutes.length : 0)} route(s).`);
