import { useCallback, useEffect, useState } from 'react';
import { addActivity, clearActivities, deleteActivity, listActivities } from '../lib/activityStore.ts';
import { makeActivity, type ActivityDraft, type ActivityRecord } from '../lib/activity.ts';

export function useActivityHistory() {
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRecords(await listActivities());
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal membaca riwayat.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const record = useCallback(async (draft: ActivityDraft): Promise<boolean> => {
    try {
      await addActivity(makeActivity(draft));
      await refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan aktivitas.');
      return false;
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    try { await deleteActivity(id); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal menghapus aktivitas.'); }
  }, [refresh]);

  const clear = useCallback(async () => {
    try { await clearActivities(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal membersihkan riwayat.'); }
  }, [refresh]);

  return { records, loading, error, record, remove, clear, refresh };
}
