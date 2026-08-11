import { test, expect } from '@playwright/test';

test.describe('9 & 10. Security & XSS Payload Injection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `sec_xss_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Security QA User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('sanitizes script payload in transaction description without executing script', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await page.goto('/transactions');
    await page.click('button:has-text("Add Transaction")');

    const xssPayload = "<script>alert('XSS_ATTACK')</script>";
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', xssPayload);
    await page.fill('input[placeholder="0.00"]', '99.00');
    await page.click('button:has-text("Add Transaction")');

    await expect(page.getByText(xssPayload)).toBeVisible();
    expect(dialogFired).toBe(false);
  });

  test('sanitizes HTML img onerror payload in category name without execution', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', () => { dialogFired = true; });

    await page.goto('/settings');
    await page.click('button:has-text("Add Category")');

    const imgPayload = "<img src=x onerror=alert('IMG_XSS')>";
    await page.fill('input.form-control', imgPayload);
    await page.click('div.modal-footer button:has-text("Save")');

    await expect(page.getByText(imgPayload)).toBeVisible();
    expect(dialogFired).toBe(false);
  });
});
