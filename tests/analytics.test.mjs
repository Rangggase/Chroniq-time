import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProductivityAnalytics } from '../src/lib/analytics.ts';

const now = new Date(2026, 10, 7, 12, 0, 0);
function record({ daysAgo = 0, kind = 'focus', status = 'completed', preset = 'focus', minutes = 25, id = String(Math.random()) } = {}) {
  const ended = new Date(2026, 10, 7, 10, 0, 0);
  ended.setDate(ended.getDate() - daysAgo);
  return {
    id, kind, status, preset, title: kind, endedAt: ended.toISOString(),
    startedAt: new Date(ended.getTime() - minutes * 60000).toISOString(),
    durationMs: minutes * 60000, plannedMs: minutes * 60000, lapCount: null,
  };
}

test('analytics show a deterministic seven-day empty trend', () => {
  const data = buildProductivityAnalytics([], 7, now);
  assert.equal(data.trend.length, 7);
  assert.equal(data.focusedMs, 0);
  assert.equal(data.completedSessions, 0);
  assert.equal(data.activeFocusDays, 0);
  assert.equal(data.fromDate, '2026-11-01');
  assert.equal(data.toDate, '2026-11-07');
});

test('only completed Focus work counts toward focus minutes', () => {
  const entries = [
    record({ minutes: 25 }),
    record({ minutes: 5, preset: 'short' }),
    record({ minutes: 12, status: 'interrupted' }),
    record({ minutes: 7, kind: 'countdown', preset: null }),
    record({ minutes: 3, kind: 'stopwatch', preset: null }),
  ];
  const data = buildProductivityAnalytics(entries, 7, now);
  assert.equal(data.focusedMs, 25 * 60000);
  assert.equal(data.completedFocusSessions, 1);
  assert.equal(data.averageFocusMs, 25 * 60000);
  assert.equal(data.completedSessions, 4);
  assert.equal(data.interruptedSessions, 1);
  assert.equal(data.activeFocusDays, 1);
  assert.equal(data.durationByKind.focus, 25 * 60000);
  assert.equal(data.durationByKind.countdown, 7 * 60000);
  assert.equal(data.durationByKind.stopwatch, 3 * 60000);
});

test('7/30 days include local date at boundary and exclude older records', () => {
  const entries = [record({ daysAgo: 6 }), record({ daysAgo: 7 }), record({ daysAgo: 29 }), record({ daysAgo: 30 })];
  const seven = buildProductivityAnalytics(entries, 7, now);
  const thirty = buildProductivityAnalytics(entries, 30, now);
  assert.equal(seven.completedFocusSessions, 1);
  assert.equal(thirty.completedFocusSessions, 3);
  assert.equal(seven.trend[0].completedFocusSessions, 1);
});

test('analytics weekly aggregation for 30 and 90 days covers all days', () => {
  const entries = [record({ daysAgo: 0 }), record({ daysAgo: 29 }), record({ daysAgo: 89 })];
  const thirty = buildProductivityAnalytics(entries, 30, now);
  const ninety = buildProductivityAnalytics(entries, 90, now);
  assert.equal(thirty.trend.length, 5);
  assert.equal(ninety.trend.length, 13);
  assert.equal(thirty.trend.reduce((sum, bucket) => sum + bucket.completedFocusSessions, 0), 2);
  assert.equal(ninety.trend.reduce((sum, bucket) => sum + bucket.completedFocusSessions, 0), 3);
});

test('updates are local day based even when ISO strings use UTC', () => {
  const entry = record({ daysAgo: 0 });
  const data = buildProductivityAnalytics([entry], 7, now);
  assert.equal(data.trend.at(-1).completedFocusSessions, 1);
});

test('analytics reject invalid periods and invalid dates', () => {
  assert.throws(() => buildProductivityAnalytics([], 15, now));
  assert.throws(() => buildProductivityAnalytics([], 7, new Date(NaN)));
});
