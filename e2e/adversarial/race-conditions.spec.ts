import { test, expect } from '@playwright/test';

test.describe('5. Rapid Interaction & Race Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `race_qa_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'Race Condition Tester');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('rapidly clicking Add Transaction submit 5 times creates exactly ONE transaction', async ({ page }) => {
    await page.goto('/transactions');
    await page.click('button:has-text("Add Transaction")');

    await page.fill('input[placeholder="e.g. Grocery Shopping"]', 'Rapid Submit Item');
    await page.fill('input[placeholder="0.00"]', '45.00');

    const submitBtn = page.locator('button:has-text("Add Transaction")').last();

    // Trigger 5 rapid clicks
    await Promise.all([
      submitBtn.click(),
      submitBtn.click({ force: true }).catch(() => {}),
      submitBtn.click({ force: true }).catch(() => {}),
      submitBtn.click({ force: true }).catch(() => {}),
      submitBtn.click({ force: true }).catch(() => {}),
    ]);

    // Give state time to settle
    await page.waitForTimeout(500);

    // Verify exactly ONE item was created in table
    const matchingRows = page.locator('tr', { hasText: 'Rapid Submit Item' });
    await expect(matchingRows).toHaveCount(1);
  });
});
