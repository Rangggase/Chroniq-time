import { test, expect } from '@playwright/test';

test('TC11 - dashboard analitik menampilkan keadaan kosong dan filter periode', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Analisis produktivitas' })).toBeVisible();
  await expect(page.getByTestId('analytics-focus-minutes')).toContainText('0');
  await expect(page.getByTestId('analytics-focus-sessions')).toHaveText('0');
  await expect(page.getByTestId('analytics-empty')).toBeVisible();
  await page.getByRole('button', { name: '30 hari' }).click();
  await expect(page.getByRole('button', { name: '30 hari' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '90 hari' }).click();
  await expect(page.getByRole('button', { name: '90 hari' })).toHaveAttribute('aria-pressed', 'true');
});

test('TC12 - durasi fokus dihitung dari IndexedDB dan mengikuti filter periode', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('justsimple.activity.v1', 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('activities')) request.result.createObjectStore('activities', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const today = new Date();
      const older = new Date(today);
      older.setDate(older.getDate() - 10);
      const make = (id: string, date: Date, kind: string, preset: string | null, mins: number) => ({
        id, kind, preset, status: 'completed', title: id,
        endedAt: date.toISOString(), startedAt: new Date(date.getTime() - mins * 60_000).toISOString(),
        durationMs: mins * 60_000, plannedMs: mins * 60_000, lapCount: null,
      });
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('activities', 'readwrite');
        const store = tx.objectStore('activities');
        store.put(make('focus-new', today, 'focus', 'focus', 25));
        store.put(make('focus-old', older, 'focus', 'focus', 25));
        store.put(make('break', today, 'focus', 'short', 5));
        store.put(make('stopwatch', today, 'stopwatch', null, 1));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally { db.close(); }
  });
  await page.reload();
  await expect(page.getByTestId('activity-total')).toHaveText('4');
  await expect(page.getByTestId('analytics-focus-minutes')).toContainText('25');
  await expect(page.getByTestId('analytics-focus-sessions')).toHaveText('1');
  await expect(page.getByTestId('analytics-active-days')).toContainText('1');
  await expect(page.getByTestId('analytics-completed-sessions')).toHaveText('3');
  await page.getByRole('button', { name: '30 hari' }).click();
  await expect(page.getByTestId('analytics-focus-minutes')).toContainText('50');
  await expect(page.getByTestId('analytics-focus-sessions')).toHaveText('2');
  await page.getByRole('button', { name: '7 hari' }).click();
  await expect(page.getByTestId('analytics-focus-minutes')).toContainText('25');
});
