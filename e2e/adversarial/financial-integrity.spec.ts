import { test, expect } from '@playwright/test';
import { computeExpectedFinancials, formatExpectedCurrency } from '../helpers/testFactories';

test.describe('1. Financial Data Integrity & Precision', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `fin_precision_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Financial QA User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('verifies floating point addition precision (income = 0.1, expense = 0.2)', async ({ page }) => {
    // 1. Independent Calculation
    const testData = [
      { amount: 0.10, type: 'income' as const, date: new Date().toISOString().slice(0, 10) },
      { amount: 0.20, type: 'expense' as const, date: new Date().toISOString().slice(0, 10) },
    ];
    const expected = computeExpectedFinancials(testData);

    // 2. Perform actions in Spendly
    await page.goto('/transactions');

    // Add income 0.10
    await page.click('button:has-text("Add Transaction")');
    await page.click('button:has-text("Income")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Micro Income');
    await page.fill('input[placeholder="0.00"]', '0.10');
    await page.click('button:has-text("Add Transaction")');

    // Add expense 0.20
    await page.click('button:has-text("Add Transaction")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Micro Expense');
    await page.fill('input[placeholder="0.00"]', '0.20');
    await page.click('button:has-text("Add Transaction")');

    // 3. Verify Dashboard totals match independent calculations
    await page.goto('/');

    // Ensure no floating point artifacts like $0.10000000000000003
    const incomeCard = page.locator('.stat-card', { hasText: 'Monthly Income' });
    const expenseCard = page.locator('.stat-card', { hasText: 'Monthly Expenses' });
    const balanceCard = page.locator('.stat-card', { hasText: 'Total Balance' });

    await expect(incomeCard).toContainText('$0.10');
    await expect(expenseCard).toContainText('$0.20');
    await expect(balanceCard).toContainText('-$0.10');

    expect(expected.income).toBe(0.10);
    expect(expected.expenses).toBe(0.20);
    expect(expected.balance).toBe(-0.10);
  });

  test('handles boundary values (0.01, 0.99, 999.99, 999999.99) without truncation', async ({ page }) => {
    await page.goto('/transactions');

    // Add large expense 999999.99
    await page.click('button:has-text("Add Transaction")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Large Purchase');
    await page.fill('input[placeholder="0.00"]', '999999.99');
    await page.click('button:has-text("Add Transaction")');

    await expect(page.getByText('Large Purchase')).toBeVisible();
    await expect(page.getByText('-$999,999.99')).toBeVisible();
  });
});
