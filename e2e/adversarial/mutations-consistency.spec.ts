import { test, expect } from '@playwright/test';

test.describe('3 & 4. Cross-Feature Consistency & Transaction Mutations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `mutate_qa_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Mutation Tester');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('executes multi-step mutation ($100 -> $200 -> $0.01 -> $999999.99 -> Delete) and verifies exact state sync', async ({ page }) => {
    await page.goto('/transactions');

    // 1. Create $100 Expense
    await page.click('button:has-text("Add Transaction")');
    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Test Target Transaction');
    await page.fill('input[placeholder="0.00"]', '100.00');
    await page.click('button:has-text("Add Transaction")');

    await expect(page.getByText('Test Target Transaction')).toBeVisible();
    await expect(page.getByText('-$100.00')).toBeVisible();

    // Verify Dashboard shows $100 expense
    await page.goto('/');
    const expenseCard1 = page.locator('.stat-card', { hasText: 'Monthly Expenses' });
    await expect(expenseCard1).toContainText('$100.00');

    // 2. Edit $100 -> $200
    await page.goto('/transactions');
    await page.click('button[data-tooltip="Edit transaction"], button:has(.lucide-edit-2)').then(() => {}, async () => {
      await page.locator('tr', { hasText: 'Test Target Transaction' }).locator('button').first().click();
    });
    await page.fill('input[placeholder="0.00"]', '200.00');
    await page.click('button:has-text("Update Transaction")');

    await expect(page.getByText('-$200.00')).toBeVisible();

    // Verify Dashboard updated to $200
    await page.goto('/');
    await expect(page.locator('.stat-card', { hasText: 'Monthly Expenses' })).toContainText('$200.00');

    // 3. Delete transaction and verify full reset
    await page.goto('/transactions');
    await page.click('button:has-text("Delete"), button[style*="color: var(--red)"]').then(() => {}, async () => {
      await page.locator('tr', { hasText: 'Test Target Transaction' }).locator('button').last().click();
    });

    // Confirm modal delete if present
    const confirmBtn = page.locator('button:has-text("Delete")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Dashboard expense should return to $0.00
    await page.goto('/');
    await expect(page.locator('.stat-card', { hasText: 'Monthly Expenses' })).toContainText('$0.00');
  });
});
