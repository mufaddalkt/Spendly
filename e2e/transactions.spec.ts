import { test, expect } from '@playwright/test';

test.describe('Transactions Management', () => {
  test.beforeEach(async ({ page }) => {
    // Register clean user
    await page.goto('/signup');
    const email = `txn_test_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Txn Tester');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Secret123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('can add a new expense transaction and view it in transactions list', async ({ page }) => {
    await page.goto('/transactions');
    await page.click('button:has-text("Add Transaction")');

    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Coffee & Croissant');
    await page.fill('input[placeholder="0.00"]', '12.50');
    await page.click('button:has-text("Add Transaction")');

    await expect(page.getByText('Coffee & Croissant')).toBeVisible();
    await expect(page.getByText('-$12.50')).toBeVisible();
  });

  test('opens CSV import wizard modal when clicking Import CSV', async ({ page }) => {
    await page.goto('/transactions');
    await page.click('button:has-text("Import CSV")');
    await expect(page.getByText('Import Transactions CSV')).toBeVisible();
    await expect(page.getByText('1. Upload File')).toBeVisible();
  });
});
