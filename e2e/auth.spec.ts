import { test, expect } from '@playwright/test';

test.describe('Authentication Flow — SP-0001 to SP-0800', () => {
  test('redirects unauthenticated user from protected route / to /login', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('sign up new user with valid credentials creates clean workspace', async ({ page }) => {
    await page.goto('/signup');
    const randomEmail = `testuser_${Date.now()}@example.com`;

    await page.fill('input[type="text"]', 'Jane Doe');
    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard /
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Jane');
    await expect(page.getByText('Total Balance')).toBeVisible();
  });

  test('sign in validation handles empty fields gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // HTML5 validation or error state prevents redirect
    await expect(page).toHaveURL(/\/login/);
  });

  test('password recovery page renders and accepts email submission', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText('Reset your password');

    await page.fill('input[type="email"]', 'user@example.com');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Check your inbox')).toBeVisible();
  });
});
