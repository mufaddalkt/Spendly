import { test, expect } from '@playwright/test';

test.describe('6 & 7. Multi-Tab Sync & Multi-User Data Isolation', () => {
  test('multi-user data isolation: User B cannot access User A private data', async ({ browser }) => {
    const userAContext = await browser.newContext();
    const userBContext = await browser.newContext();

    const pageA = await userAContext.newPage();
    const pageB = await userBContext.newPage();

    // 1. Sign up User A and create secret data
    const emailA = `usera_${Date.now()}@example.com`;
    await pageA.goto('/signup');
    await pageA.fill('input[type="text"]', 'User A Secret');
    await pageA.fill('input[type="email"]', emailA);
    await pageA.fill('input[type="password"]', 'Password123!');
    await pageA.click('button[type="submit"]');

    await pageA.goto('/transactions');
    await pageA.click('button:has-text("Add Transaction")');
    await pageA.fill('input[placeholder="e.g. Grocery Shopping"]', 'CONFIDENTIAL-PAYROLL-A');
    await pageA.fill('input[placeholder="0.00"]', '5000.00');
    await pageA.click('button:has-text("Add Transaction")');
    await expect(pageA.getByText('CONFIDENTIAL-PAYROLL-A')).toBeVisible();

    // 2. Sign up User B
    const emailB = `userb_${Date.now()}@example.com`;
    await pageB.goto('/signup');
    await pageB.fill('input[type="text"]', 'User B Clean');
    await pageB.fill('input[type="email"]', emailB);
    await pageB.fill('input[type="password"]', 'Password123!');
    await pageB.click('button[type="submit"]');

    // 3. Verify User B sees clean zero-state and NO User A confidential data
    await pageB.goto('/transactions');
    await expect(pageB.getByText('CONFIDENTIAL-PAYROLL-A')).not.toBeVisible();
    await expect(pageB.getByText('No transactions recorded yet.')).toBeVisible();

    await pageB.goto('/');
    await expect(pageB.locator('.stat-card', { hasText: 'Monthly Income' })).toContainText('$0.00');

    await userAContext.close();
    await userBContext.close();
  });
});
