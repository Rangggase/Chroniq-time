import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGoalInsights, DEFAULT_GOAL_MINUTES, isValidGoalMinutes, parseGoalMinutes,
} from '../src/lib/goals.ts';

const today = new Date(2026, 10, 8, 16, 0, 0); // Sunday, in the test machine's local timezone.
function entry({ daysAgo = 0, duration = 25, kind = 'focus', status = 'completed', preset = 'focus', id = '' } = {}) {
  const ended = new Date(today);
  ended.setDate(ended.getDate() - daysAgo);
  ended.setHours(12, 0, 0, 0);
  return {
    id: id || `${daysAgo}-${duration}-${kind}-${status}-${preset}`,
    kind, status, preset, title: 'session', endedAt: ended.toISOString(),
    startedAt: new Date(ended.getTime() - duration * 60_000).toISOString(),
    durationMs: duration * 60_000, plannedMs: duration * 60_000, lapCount: null,
  };
}

test('goal settings default to 120 minutes; only validated 15-minute steps allowed', () => {
  assert.equal(parseGoalMinutes(null), DEFAULT_GOAL_MINUTES);
  assert.equal(parseGoalMinutes('garbage'), DEFAULT_GOAL_MINUTES);
  assert.equal(parseGoalMinutes('999999'), DEFAULT_GOAL_MINUTES);
  assert.equal(parseGoalMinutes('60'), 60);
  assert.equal(parseGoalMinutes('060'), 60);
  for (const invalid of [0, 14, 16, 481, Infinity, -15, NaN, 60.5, '60']) assert.equal(isValidGoalMinutes(invalid), false);
  assert.equal(isValidGoalMinutes(15), true);
  assert.equal(isValidGoalMinutes(480), true);
});

test('today progress counts only completed work-focus sessions, not breaks or interrupted focus', () => {
  const records = [
    entry({ duration: 25 }),
    entry({ duration: 10, id: 'second' }),
    entry({ duration: 15, preset: 'short' }),
    entry({ duration: 35, status: 'interrupted' }),
    entry({ duration: 30, kind: 'countdown', preset: null }),
    entry({ duration: 15, kind: 'stopwatch', preset: null }),
  ];
  const data = buildGoalInsights(records, 60, today);
  assert.equal(data.todayFocusedMs, 35 * 60_000);
  assert.equal(data.todayFocusSessions, 2);
  assert.equal(data.progressPercent, 58);
  assert.equal(data.remainingMs, 25 * 60_000);
  assert.equal(data.achievedToday, false);
});

test('daily progress caps at 100% while retaining total actual minutes', () => {
  const data = buildGoalInsights([entry({ duration: 65 })], 60, today);
  assert.equal(data.progressPercent, 100);
  assert.equal(data.todayFocusedMs, 65 * 60_000);
  assert.equal(data.remainingMs, 0);
  assert.equal(data.achievedToday, true);
});

test('weekly Monday–Sunday boundaries exclude the preceding Sunday', () => {
  const records = [entry({ daysAgo: 0, duration: 60 }), entry({ daysAgo: 6, duration: 75 }), entry({ daysAgo: 7, duration: 60 })];
  const result = buildGoalInsights(records, 60, today);
  assert.equal(result.weekDays.length, 7);
  assert.equal(result.weekDays[0]?.date, '2026-11-02');
  assert.equal(result.weekDays[6]?.date, '2026-11-08');
  assert.equal(result.weekFocusedMs, 135 * 60_000);
  assert.equal(result.weekAchievedDays, 2);
  assert.equal(result.weekActiveDays, 2);
});

test('active streak is consecutive days with completed focus work, irrespective of goal amount', () => {
  const records = [entry({ daysAgo: 0, duration: 15 }), entry({ daysAgo: 1, duration: 15 }), entry({ daysAgo: 2, duration: 15 }), entry({ daysAgo: 4, duration: 15 })];
  const data = buildGoalInsights(records, 180, today);
  assert.equal(data.currentStreak, 3);
  assert.equal(data.longestStreak, 3);
  assert.equal(data.weekAchievedDays, 0);
});

test('yesterday streak is retained without today; gap of two days breaks active streak', () => {
  const records = [entry({ daysAgo: 1 }), entry({ daysAgo: 2 }), entry({ daysAgo: 4 })];
  assert.equal(buildGoalInsights(records, 60, today).currentStreak, 2);
  const withGap = [entry({ daysAgo: 2 }), entry({ daysAgo: 3 }), entry({ daysAgo: 4 })];
  const result = buildGoalInsights(withGap, 60, today);
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 3);
});

test('multiple sessions on one local day do not inflate active-day streak', () => {
  const records = [entry({ duration: 15, id: 'a' }), entry({ duration: 45, id: 'b' }), entry({ daysAgo: 1, id: 'c' })];
  const result = buildGoalInsights(records, 60, today);
  assert.equal(result.currentStreak, 2);
  assert.equal(result.weekAchievedDays, 1);
  assert.equal(result.todayFocusSessions, 2);
});

test('year boundary, future dates, malformed durations and invalid configuration are handled safely', () => {
  const jan = new Date(2027, 0, 2, 16);
  const dec31 = { ...entry(), endedAt: new Date(2026, 11, 31, 12).toISOString() };
  const jan1 = { ...entry(), id: 'jan1', endedAt: new Date(2027, 0, 1, 12).toISOString() };
  const jan2 = { ...entry(), id: 'jan2', endedAt: new Date(2027, 0, 2, 12).toISOString() };
  const future = { ...entry(), id: 'future', endedAt: new Date(2027, 0, 3, 12).toISOString() };
  const malformed = { ...entry(), id: 'bad', durationMs: -1 };
  const result = buildGoalInsights([dec31, jan1, jan2, future, malformed], 60, jan);
  assert.equal(result.currentStreak, 3);
  assert.equal(result.todayFocusSessions, 1);
  assert.throws(() => buildGoalInsights([], 17, jan));
  assert.throws(() => buildGoalInsights([], 60, new Date(NaN)));
});
