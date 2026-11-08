import { test, expect } from '@playwright/test';

test('TC13 - target fokus dapat diubah dan tetap tersimpan setelah refresh', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Target & konsistensi' })).toBeVisible();
  const input = page.getByRole('spinbutton', { name: 'Target fokus harian (menit)' });
  await expect(input).toHaveValue('120');
  await expect(page.getByTestId('goals-progress-percent')).toHaveText('0%');
  await page.getByRole('button', { name: '60 menit' }).click();
  await page.getByRole('button', { name: 'Simpan target' }).click();
  await expect(page.getByRole('status')).toContainText('Target tersimpan');
  await expect(page.getByTestId('goals-target-minutes')).toHaveText('60');
  await page.reload();
  await expect(input).toHaveValue('60');
  await expect(page.getByTestId('goals-target-minutes')).toHaveText('60');
  await input.fill('17');
  await expect(page.getByRole('button', { name: 'Simpan target' })).toBeDisabled();
  await input.fill('120');
  await page.getByRole('button', { name: 'Simpan target' }).click();
  await expect(page.getByTestId('goals-target-minutes')).toHaveText('120');
});

test('TC14 - progres target dan streak mengikuti IndexedDB tanpa menghitung istirahat', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
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
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const make = (id: string, date: Date, kind: string, preset: string | null, status: string, mins: number) => ({
        id, kind, preset, status, title: id, endedAt: date.toISOString(),
        startedAt: new Date(date.getTime() - mins * 60_000).toISOString(),
        durationMs: mins * 60_000, plannedMs: mins * 60_000, lapCount: null,
      });
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('activities', 'readwrite');
        const store = tx.objectStore('activities');
        store.put(make('focus-a', today, 'focus', 'focus', 'completed', 30));
        store.put(make('focus-b', today, 'focus', 'focus', 'completed', 30));
        store.put(make('focus-prev', yesterday, 'focus', 'focus', 'completed', 15));
        store.put(make('break', today, 'focus', 'short', 'completed', 60));
        store.put(make('interrupted', today, 'focus', 'focus', 'interrupted', 60));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally { db.close(); }
  });
  await page.reload();
  await expect(page.getByTestId('activity-total')).toHaveText('5');
  await expect(page.getByTestId('goals-current-minutes')).toHaveText('60');
  await expect(page.getByTestId('goals-progress-percent')).toHaveText('50%');
  await expect(page.getByTestId('goals-current-streak')).toContainText('2');
  await page.getByRole('button', { name: '60 menit' }).click();
  await page.getByRole('button', { name: 'Simpan target' }).click();
  await expect(page.getByTestId('goals-progress-percent')).toHaveText('100%');
  await expect(page.getByTestId('goals-status')).toContainText('Target tercapai');
  await page.reload();
  await expect(page.getByTestId('goals-progress-percent')).toHaveText('100%');
  await expect(page.getByTestId('goals-current-streak')).toContainText('2');
});
