import type { ActivityKind, ActivityRecord } from './activity.ts';

export type AnalyticsPeriod = 7 | 30 | 90;
export interface TrendBucket {
  label: string;
  startDate: string;
  endDate: string;
  focusedMs: number;
  completedFocusSessions: number;
}
export interface ProductivityAnalytics {
  days: AnalyticsPeriod;
  fromDate: string;
  toDate: string;
  focusedMs: number;
  completedFocusSessions: number;
  averageFocusMs: number;
  activeFocusDays: number;
  completedSessions: number;
  interruptedSessions: number;
  durationByKind: Record<ActivityKind, number>;
  trend: TrendBucket[];
}

const two = (n: number) => String(n).padStart(2, '0');
const dayKey = (date: Date) => `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
const dateAtNoon = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
const addLocalDays = (date: Date, offset: number) => {
  const result = dateAtNoon(date);
  result.setDate(result.getDate() + offset);
  return result;
};
const shortDate = (date: Date) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date);

/**
 * Recorded durations are attributed to the LOCAL calendar date when a session ends.
 * Only completed Focus work presets count as focused time; Pomodoro breaks and
 * interrupted sessions are not included. No data is uploaded or modified here.
 */
export function buildProductivityAnalytics(
  records: readonly ActivityRecord[],
  days: AnalyticsPeriod = 7,
  now: Date = new Date(),
): ProductivityAnalytics {
  if (![7, 30, 90].includes(days)) throw new Error('Periode tidak tersedia');
  if (Number.isNaN(now.getTime())) throw new Error('Tanggal acuan tidak valid');

  const today = dateAtNoon(now);
  const from = addLocalDays(today, -(days - 1));
  const startKey = dayKey(from);
  const endKey = dayKey(today);
  const durationByKind: Record<ActivityKind, number> = { stopwatch: 0, focus: 0, countdown: 0 };
  const focusByDay = new Map<string, { durationMs: number; count: number }>();
  let focusedMs = 0;
  let completedFocusSessions = 0;
  let completedSessions = 0;
  let interruptedSessions = 0;

  for (const record of records) {
    const date = new Date(record.endedAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (key < startKey || key > endKey || !Number.isFinite(record.durationMs) || record.durationMs <= 0) continue;
    if (record.status === 'interrupted') {
      interruptedSessions++;
      continue;
    }
    if (record.status !== 'completed') continue;
    completedSessions++;

    // A short/long Pomodoro break is a finished session, but not focus work.
    if (record.kind === 'focus' && record.preset !== 'focus') continue;
    durationByKind[record.kind] += record.durationMs;
    if (record.kind === 'focus') {
      focusedMs += record.durationMs;
      completedFocusSessions++;
      const current = focusByDay.get(key) ?? { durationMs: 0, count: 0 };
      current.durationMs += record.durationMs;
      current.count++;
      focusByDay.set(key, current);
    }
  }

  // 7 days = daily bars; 30/90 days = consecutive 7-day groups from period start.
  const groupSize = days === 7 ? 1 : 7;
  const trend: TrendBucket[] = [];
  for (let offset = 0; offset < days; offset += groupSize) {
    const start = addLocalDays(from, offset);
    const end = addLocalDays(from, Math.min(days - 1, offset + groupSize - 1));
    let bucketMs = 0;
    let bucketCount = 0;
    for (let i = offset; i <= Math.min(days - 1, offset + groupSize - 1); i++) {
      const data = focusByDay.get(dayKey(addLocalDays(from, i)));
      if (data) {
        bucketMs += data.durationMs;
        bucketCount += data.count;
      }
    }
    trend.push({
      label: days === 7 ? shortDate(start) : `${shortDate(start)}–${shortDate(end)}`,
      startDate: dayKey(start), endDate: dayKey(end), focusedMs: bucketMs, completedFocusSessions: bucketCount,
    });
  }

  return {
    days, fromDate: startKey, toDate: endKey, focusedMs, completedFocusSessions,
    averageFocusMs: completedFocusSessions ? focusedMs / completedFocusSessions : 0,
    activeFocusDays: focusByDay.size, completedSessions, interruptedSessions,
    durationByKind, trend,
  };
}
