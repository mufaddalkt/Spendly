import { test, expect } from '@playwright/test';

test.describe('13 & 14. Budget & Savings Goal Adversarial Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `bg_qa_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Budget Goal User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('creates budget and calculates spending speed velocity card', async ({ page }) => {
    await page.goto('/budgets');
    await expect(page.locator('.page-title')).toContainText('Budgets');

    await expect(page.getByText('Total Budget')).toBeVisible();
    await expect(page.getByText('Total Spent')).toBeVisible();
    await expect(page.getByText('Spending Speed')).toBeVisible();
  });

  test('creates savings goal, logs contribution, and opens Contribution History Modal', async ({ page }) => {
    await page.goto('/goals');
    await page.click('button:has-text("New Goal")');

    await page.fill('input[placeholder="e.g. Emergency Fund"]', 'Paris Vacation');
    await page.fill('input[placeholder="1000"]', '2000.00');
    await page.fill('input[placeholder="0"]', '500.00');
    await page.click('div.modal-footer button:has-text("Save")');

    await expect(page.getByText('Paris Vacation')).toBeVisible();
    await expect(page.getByText('$500.00 of $2,000.00')).toBeVisible();

    // Open Contribution History Modal
    await page.click('button[data-tooltip="History"], button:has(.lucide-history)');
    await expect(page.getByText('Contribution History — Paris Vacation')).toBeVisible();
    await expect(page.getByText('Target Goal')).toBeVisible();
    await expect(page.getByText('Saved Balance')).toBeVisible();
  });
});
