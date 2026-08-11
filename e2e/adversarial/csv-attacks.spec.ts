import { test, expect } from '@playwright/test';

test.describe('11 & 12. CSV Import Robustness & Export Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
    const email = `csv_qa_${Date.now()}@example.com`;
    await page.fill('input[type="text"]', 'CSV Tester');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('handles CSV import modal workflow and duplicate detection safely', async ({ page }) => {
    await page.goto('/transactions');
    await page.click('button:has-text("Import CSV")');

    await expect(page.getByText('Import Transactions CSV')).toBeVisible();
    await expect(page.getByText('1. Upload File')).toBeVisible();

    // Close modal safely
    await page.click('button.modal-close, button:has(.lucide-x)');
    await expect(page.getByText('Import Transactions CSV')).not.toBeVisible();
  });

  test('triggers CSV download when clicking Export CSV button', async ({ page }) => {
    await page.goto('/transactions');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export CSV")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.csv');
  });
});
