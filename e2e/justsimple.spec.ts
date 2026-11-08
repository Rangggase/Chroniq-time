import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Test ini dibuat untuk source code JustSimple v3 (React + TypeScript + Vite).
// playwright.config.ts mengatur baseURL dan menyalakan Vite otomatis.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Every second counts.' })).toBeVisible();
});

test('TC01 - navigasi Stopwatch, Focus, Countdown', async ({ page }) => {
  await expect(page.getByRole('tab', { name: 'Stopwatch' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Ringkasan sesi' })).toBeVisible();

  await page.getByRole('tab', { name: 'Focus / Pomodoro' }).click();
  await expect(page.getByRole('heading', { name: 'Focus timer' })).toBeVisible();

  await page.getByRole('tab', { name: 'Countdown' }).click();
  await expect(page.getByRole('heading', { name: 'Countdown timer' })).toBeVisible();

  await page.getByRole('tab', { name: 'Stopwatch' }).click();
  await expect(page.getByRole('heading', { name: 'Stopwatch', exact: true })).toBeVisible();
});

test('TC02 - stopwatch Mulai, Jeda, Lanjutkan, Reset', async ({ page }) => {
  const panel = page.getByRole('tabpanel', { name: 'Stopwatch' });
  await expect(panel.getByText('Siap dimulai')).toBeVisible();

  await panel.getByRole('button', { name: 'Mulai', exact: true }).click();
  await expect(panel.getByText('Sedang berjalan')).toBeVisible();

  await panel.getByRole('button', { name: 'Jeda', exact: true }).click();
  await expect(panel.getByText('Sedang dijeda')).toBeVisible();

  await panel.getByRole('button', { name: 'Lanjutkan', exact: true }).click();
  await expect(panel.getByText('Sedang berjalan')).toBeVisible();

  await panel.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(panel.getByText('Siap dimulai')).toBeVisible();
  await expect(panel.getByRole('timer')).toHaveAttribute('aria-label', 'Waktu stopwatch 00:00:00.000');
});

test('TC03 - catat lap, statistik, dan pemulihan data setelah refresh', async ({ page }) => {
  const panel = page.getByRole('tabpanel', { name: 'Stopwatch' });
  await panel.getByRole('button', { name: 'Mulai', exact: true }).click();
  await panel.getByRole('button', { name: 'Catat lap' }).click();
  await panel.getByRole('button', { name: 'Catat lap' }).click();

  await expect(page.locator('.laps-table tbody tr')).toHaveCount(2);
  await expect(page.locator('.stat-laps .stat-value')).toHaveText('02');

  await panel.getByRole('button', { name: 'Jeda', exact: true }).click();
  await expect.poll(async () => page.evaluate(() => {
    const raw = localStorage.getItem('justsimple.session.v3');
    return raw ? JSON.parse(raw).laps.length : 0;
  })).toBe(2);

  await page.reload();
  await expect(page.getByRole('tabpanel', { name: 'Stopwatch' }).getByRole('button', { name: 'Lanjutkan' })).toBeVisible();
  await expect(page.locator('.laps-table tbody tr')).toHaveCount(2);
  await expect(page.locator('.stat-laps .stat-value')).toHaveText('02');

  await page.getByRole('button', { name: 'Hapus lap' }).click();
  await expect(page.getByText('Belum ada putaran')).toBeVisible();
});

test('TC04 - ekspor data lap ke CSV', async ({ page }) => {
  const panel = page.getByRole('tabpanel', { name: 'Stopwatch' });
  await panel.getByRole('button', { name: 'Mulai', exact: true }).click();
  await panel.getByRole('button', { name: 'Catat lap' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Chroniq-Laps-\d{4}-\d{2}-\d{2}\.csv$/);
  const data = await readFile(await download.path(), 'utf8');
  expect(data).toContain('Durasi Lap');
  expect(data).toContain('Total Waktu');
});

test('TC05 - Focus/Pomodoro: preset, mulai, jeda, reset', async ({ page }) => {
  await page.getByRole('tab', { name: 'Focus / Pomodoro' }).click();
  const panel = page.getByRole('tabpanel', { name: 'Focus / Pomodoro' });
  await expect(panel.getByRole('timer')).toHaveText('25:00');

  await panel.getByRole('button', { name: 'Istirahat pendek' }).click();
  await expect(panel.getByRole('timer')).toHaveText('05:00');

  await panel.getByRole('button', { name: 'Mulai fokus' }).click();
  await expect(panel.getByRole('button', { name: 'Jeda' })).toBeVisible();
  await panel.getByRole('button', { name: 'Jeda' }).click();
  await expect(panel.getByRole('button', { name: 'Lanjutkan' })).toBeVisible();
  await panel.getByRole('button', { name: 'Reset' }).click();
  await expect(panel.getByRole('timer')).toHaveText('05:00');
});

test('TC06 - Countdown: preset dan durasi khusus', async ({ page }) => {
  await page.getByRole('tab', { name: 'Countdown' }).click();
  const panel = page.getByRole('tabpanel', { name: 'Countdown' });
  await panel.getByRole('button', { name: '1 menit' }).click();
  await expect(panel.getByRole('timer')).toHaveText('01:00');

  await panel.getByLabel('Durasi khusus (menit)').fill('3');
  await panel.getByRole('button', { name: 'Terapkan' }).click();
  await expect(panel.getByRole('timer')).toHaveText('03:00');

  await panel.getByRole('button', { name: 'Mulai', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Jeda' })).toBeVisible();
  await panel.getByRole('button', { name: 'Jeda' }).click();
  await panel.getByRole('button', { name: 'Reset' }).click();
  await expect(panel.getByRole('timer')).toHaveText('03:00');
});

test('TC07 - tema gelap/terang tersimpan sesudah refresh', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Ganti ke tema terang' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Ganti ke tema gelap' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('TC08 - layout mobile tanpa overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('tab', { name: 'Stopwatch' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Focus / Pomodoro' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Countdown' })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole('tab', { name: 'Countdown' }).click();
  await expect(page.getByRole('heading', { name: 'Countdown timer' })).toBeVisible();
});
