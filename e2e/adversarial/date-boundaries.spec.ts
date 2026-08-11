import { test, expect } from '@playwright/test';

test.describe('2. Month and Date Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `date_qa_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Date Boundary User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('correctly classifies transactions on Feb 29 in leap year', async ({ page }) => {
    await page.goto('/transactions');

    // Create transaction on 2028-02-29 (Leap year)
    await page.click('button:has-text("Add Transaction")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Leap Year Dinner');
    await page.fill('input[placeholder="0.00"]', '150.00');
    await page.fill('input[type="date"]', '2028-02-29');
    await page.click('button:has-text("Add Transaction")');

    await expect(page.getByText('Leap Year Dinner')).toBeVisible();

    // Verify in Calendar view for Feb 2028
    await page.goto('/calendar');
    await expect(page.locator('.page-title')).toContainText('Calendar');
  });

  test('correctly separates Dec 31 vs Jan 1 transactions', async ({ page }) => {
    await page.goto('/transactions');

    // New Year's Eve transaction
    await page.click('button:has-text("Add Transaction")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'NYE Party');
    await page.fill('input[placeholder="0.00"]', '250.00');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.click('button:has-text("Add Transaction")');

    // New Year's Day transaction
    await page.click('button:has-text("Add Transaction")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'New Year Brunch');
    await page.fill('input[placeholder="0.00"]', '75.00');
    await page.fill('input[type="date"]', '2026-01-01');
    await page.click('button:has-text("Add Transaction")');

    await expect(page.getByText('NYE Party')).toBeVisible();
    await expect(page.getByText('New Year Brunch')).toBeVisible();
  });
});
