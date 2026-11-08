import { test, expect } from '@playwright/test';

test('TC09 - simpan stopwatch ke IndexedDB lalu refresh', async ({ page }) => {
  await page.goto('/');
  const stopwatch = page.getByRole('tabpanel', { name: 'Stopwatch' });
  await stopwatch.getByRole('button', { name: 'Mulai', exact: true }).click();
  await stopwatch.getByRole('button', { name: 'Catat lap' }).click();
  await expect.poll(async () => (await stopwatch.getByRole('timer').getAttribute('aria-label')) !== 'Waktu stopwatch 00:00:00.000').toBe(true);
  await stopwatch.getByRole('button', { name: 'Simpan sesi' }).click();
  await expect(page.getByTestId('activity-total')).toHaveText('1');
  await page.getByRole('button', { name: 'Lihat riwayat' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Stopwatch (1 lap)' })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('activity-total')).toHaveText('1');
  await page.getByRole('button', { name: 'Lihat riwayat' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Stopwatch (1 lap)' })).toBeVisible();
});

test('TC10 - riwayat bisa diekspor dan dihapus', async ({ page }) => {
  await page.goto('/');
  const stopwatch = page.getByRole('tabpanel', { name: 'Stopwatch' });
  await stopwatch.getByRole('button', { name: 'Mulai', exact: true }).click();
  await expect.poll(async () => (await stopwatch.getByRole('timer').getAttribute('aria-label')) !== 'Waktu stopwatch 00:00:00.000').toBe(true);
  await stopwatch.getByRole('button', { name: 'Simpan sesi' }).click();
  await expect(page.getByTestId('activity-total')).toHaveText('1');
  await page.getByRole('button', { name: 'Lihat riwayat' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Ekspor riwayat CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/^Chroniq-Activity-.*\.csv$/);
  await page.getByRole('button', { name: /^Hapus aktivitas/ }).click();
  await expect(page.getByTestId('activity-total')).toHaveText('0');
});
