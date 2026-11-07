import type { ActivityRecord } from './activity.ts';

const DB_NAME = 'justsimple.activity.v1';
const STORE_NAME = 'activities';

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB tidak tersedia pada browser ini.'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onerror = () => reject(request.error ?? new Error('Database gagal dibuka.'));
    request.onblocked = () => reject(new Error('Tutup tab JustSimple lain, lalu coba lagi.'));
    request.onsuccess = () => resolve(request.result);
  });
}

async function runTransaction<T>(mode: IDBTransactionMode, create: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const request = create(tx.objectStore(STORE_NAME));
      let result: T;
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error ?? new Error('Operasi database gagal.'));
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error ?? new Error('Transaksi database gagal.'));
      tx.onabort = () => reject(tx.error ?? new Error('Transaksi dibatalkan.'));
    });
  } finally {
    db.close();
  }
}

export async function listActivities(): Promise<ActivityRecord[]> {
  const records = await runTransaction<ActivityRecord[]>('readonly', store => store.getAll());
  return records.sort((a, b) => b.endedAt.localeCompare(a.endedAt) || b.id.localeCompare(a.id));
}

export async function addActivity(record: ActivityRecord): Promise<void> {
  await runTransaction<IDBValidKey>('readwrite', store => store.add(record));
}

export async function deleteActivity(id: string): Promise<void> {
  await runTransaction<undefined>('readwrite', store => store.delete(id));
}

export async function clearActivities(): Promise<void> {
  await runTransaction<undefined>('readwrite', store => store.clear());
}
