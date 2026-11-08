import type { ActivityRecord } from './activity.ts';

export const GOAL_STORAGE_KEY = 'justsimple.daily-focus-goal.v1';
export const DEFAULT_GOAL_MINUTES = 120;
export const MIN_GOAL_MINUTES = 15;
export const MAX_GOAL_MINUTES = 480;
export const GOAL_STEP_MINUTES = 15;

export function isValidGoalMinutes(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) &&
    value >= MIN_GOAL_MINUTES && value <= MAX_GOAL_MINUTES && value % GOAL_STEP_MINUTES === 0;
}

export function parseGoalMinutes(raw: string | null): number {
  if (raw === null || !/^\d+$/.test(raw)) return DEFAULT_GOAL_MINUTES;
  const parsed = Number(raw);
  return isValidGoalMinutes(parsed) ? parsed : DEFAULT_GOAL_MINUTES;
}

export function readDailyGoal(): number {
  try { return parseGoalMinutes(localStorage.getItem(GOAL_STORAGE_KEY)); }
  catch { return DEFAULT_GOAL_MINUTES; }
}

export function persistDailyGoal(minutes: number): void {
  if (!isValidGoalMinutes(minutes)) throw new Error('Target harus 15–480 menit dan kelipatan 15.');
  localStorage.setItem(GOAL_STORAGE_KEY, String(minutes));
}

function atNoon(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12); }
function shiftDay(date: Date, offset: number) {
  const next = atNoon(date);
  next.setDate(next.getDate() + offset);
  return next;
}
const pad = (n: number) => String(n).padStart(2, '0');
export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface GoalWeekDay {
  date: string;
  label: string;
  focusedMs: number;
  active: boolean;
  achieved: boolean;
  future: boolean;
  today: boolean;
}

export interface GoalInsights {
  goalMinutes: number;
  todayFocusedMs: number;
  todayFocusSessions: number;
  remainingMs: number;
  progressPercent: number;
  achievedToday: boolean;
  weekFocusedMs: number;
  weekActiveDays: number;
  weekAchievedDays: number;
  currentStreak: number;
  longestStreak: number;
  weekDays: GoalWeekDay[];
}

/**
 * Daily focus counts only completed 'focus' preset sessions, attributed to the
 * LOCAL calendar day when they ended (same rule as Productivity Analytics).
 * Streak = consecutive days with >=1 completed focus work session, independent
 * of the configurable goal. If today has no focus, yesterday can still carry it.
 */
export function buildGoalInsights(
  records: readonly ActivityRecord[],
  goalMinutes: number = DEFAULT_GOAL_MINUTES,
  now: Date = new Date(),
): GoalInsights {
  if (!isValidGoalMinutes(goalMinutes)) throw new Error('Target fokus tidak valid');
  if (Number.isNaN(now.getTime())) throw new Error('Tanggal acuan tidak valid');

  const today = atNoon(now);
  const todayKey = localDayKey(today);
  const durationByDay = new Map<string, number>();
  const sessionsByDay = new Map<string, number>();

  for (const record of records) {
    if (record.kind !== 'focus' || record.preset !== 'focus' || record.status !== 'completed') continue;
    if (!Number.isFinite(record.durationMs) || record.durationMs <= 0) continue;
    const ended = new Date(record.endedAt);
    if (Number.isNaN(ended.getTime()) || ended.getTime() > now.getTime()) continue;
    const key = localDayKey(ended);
    durationByDay.set(key, (durationByDay.get(key) ?? 0) + record.durationMs);
    sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
  }

  const todayFocusedMs = durationByDay.get(todayKey) ?? 0;
  const targetMs = goalMinutes * 60_000;
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = shiftDay(today, -mondayOffset);
  const weekdayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weekDays: GoalWeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDay(monday, i);
    const key = localDayKey(date);
    const focusedMs = durationByDay.get(key) ?? 0;
    return {
      date: key,
      label: weekdayLabels[i]!,
      focusedMs,
      active: focusedMs > 0,
      achieved: focusedMs >= targetMs,
      future: key > todayKey,
      today: key === todayKey,
    };
  });

  const activeDays = new Set(durationByDay.keys());
  let currentStreak = 0;
  // A streak remains active until the end of the next day without a session.
  let cursor = activeDays.has(todayKey) ? today : shiftDay(today, -1);
  while (activeDays.has(localDayKey(cursor))) {
    currentStreak++;
    cursor = shiftDay(cursor, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of [...activeDays].sort()) {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year!, month! - 1, day!, 12);
    run = previous && localDayKey(shiftDay(previous, 1)) === key ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = date;
  }

  return {
    goalMinutes,
    todayFocusedMs,
    todayFocusSessions: sessionsByDay.get(todayKey) ?? 0,
    remainingMs: Math.max(0, targetMs - todayFocusedMs),
    progressPercent: Math.min(100, Math.round((todayFocusedMs / targetMs) * 100)),
    achievedToday: todayFocusedMs >= targetMs,
    weekFocusedMs: weekDays.reduce((sum, day) => sum + day.focusedMs, 0),
    weekActiveDays: weekDays.filter(day => day.active).length,
    weekAchievedDays: weekDays.filter(day => day.achieved).length,
    currentStreak,
    longestStreak,
    weekDays,
  };
}
