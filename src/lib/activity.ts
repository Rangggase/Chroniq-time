export type ActivityKind = 'stopwatch' | 'focus' | 'countdown';
export type ActivityStatus = 'completed' | 'interrupted';

export interface ActivityRecord {
  id: string;
  kind: ActivityKind;
  status: ActivityStatus;
  title: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  plannedMs: number | null;
  lapCount: number | null;
  preset: 'focus' | 'short' | 'long' | null;
}

export type ActivityDraft = Omit<ActivityRecord, 'id'>;

export function makeActivity(draft: ActivityDraft, id = crypto.randomUUID()): ActivityRecord {
  if (!['stopwatch', 'focus', 'countdown'].includes(draft.kind)) throw new Error('Jenis aktivitas tidak valid');
  if (!['completed', 'interrupted'].includes(draft.status)) throw new Error('Status aktivitas tidak valid');
  if (!Number.isFinite(draft.durationMs) || draft.durationMs <= 0) throw new Error('Durasi aktivitas harus positif');
  if (!Number.isFinite(Date.parse(draft.startedAt)) || !Number.isFinite(Date.parse(draft.endedAt))) throw new Error('Tanggal aktivitas tidak valid');
  if (Date.parse(draft.startedAt) > Date.parse(draft.endedAt)) throw new Error('Tanggal mulai tidak boleh setelah selesai');
  if (!draft.title.trim() || draft.title.length > 120) throw new Error('Judul tidak valid');
  return { ...draft, id, durationMs: Math.round(draft.durationMs) };
}

export function activitySummary(records: readonly ActivityRecord[]) {
  const completed = records.filter(r => r.status === 'completed');
  const focus = completed.filter(r => r.kind === 'focus' && r.preset === 'focus');
  return {
    total: records.length,
    completed: completed.length,
    focusedMs: focus.reduce((sum, r) => sum + r.durationMs, 0),
    recordedMs: records.reduce((sum, r) => sum + r.durationMs, 0),
  };
}

function csvCell(value: string | number): string {
  const text = String(value);
  // Prevent spreadsheet formula execution when a CSV is opened in spreadsheet software.
  const safe = /^[\s]*[=+@\-\t\r]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export function activitiesToCsv(records: readonly ActivityRecord[]): string {
  const lines = [['ID', 'Jenis', 'Status', 'Judul', 'Mulai (UTC)', 'Selesai (UTC)', 'Durasi (detik)', 'Target (detik)', 'Lap', 'Preset'].map(csvCell).join(',')];
  for (const r of records) {
    const row = [r.id, r.kind, r.status, r.title, r.startedAt, r.endedAt, (r.durationMs / 1000).toFixed(3), r.plannedMs === null ? '' : (r.plannedMs / 1000).toFixed(3), r.lapCount ?? '', r.preset ?? ''];
    lines.push(row.map(csvCell).join(','));
  }
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}
