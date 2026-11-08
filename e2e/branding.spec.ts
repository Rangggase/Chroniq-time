import { test, expect } from '@playwright/test';

// v3.1.1: branding publik tidak boleh mengubah perilaku stopwatch/data historis.
test('Chroniq branding, metadata, dan favicon konsisten', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Chroniq — Every Second Counts');
  await expect(page.getByRole('link', { name: 'Chroniq — Beranda' })).toBeVisible();
  await expect(page.locator('.brand-name')).toContainText('Chroniq');
  await expect(page.locator('.brand-name small')).toHaveText('TIME, REFINED.');
  await expect(page.locator('.site-footer')).toContainText('Chroniq');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Chroniq/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg$/);
});
