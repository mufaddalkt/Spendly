import { test, expect } from '@playwright/test';

test.describe('Dashboard & Financial Overview — SP-0801 to SP-1000', () => {
  test.beforeEach(async ({ page }) => {
    // Register clean user
    await page.goto('/signup');
    const email = `dash_test_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Tester User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Secret123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('displays Financial Health Score card and 4 summary cards', async ({ page }) => {
    await expect(page.getByText('Financial Health Score')).toBeVisible();
    await expect(page.getByText('Total Balance')).toBeVisible();
    await expect(page.getByText('Monthly Income')).toBeVisible();
    await expect(page.getByText('Monthly Expenses')).toBeVisible();
    await expect(page.getByText('Monthly Savings')).toBeVisible();
  });

  test('renders clean zero-data state when no transactions exist', async ({ page }) => {
    await expect(page.getByText('No transactions recorded yet.')).toBeVisible();
  });
});
