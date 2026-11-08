import test from 'node:test';
import assert from 'node:assert/strict';
import { activitySummary, makeActivity, activitiesToCsv } from '../src/lib/activity.ts';

const base = {
  kind: 'stopwatch', status: 'completed', title: 'Stopwatch (2 lap)',
  startedAt: '2026-11-07T09:00:00.000Z', endedAt: '2026-11-07T09:00:08.000Z',
  durationMs: 8000, plannedMs: null, lapCount: 2, preset: null,
};

test('activity records keep id, start/end, and lap count', () => {
  const record = makeActivity(base, 'test-one');
  assert.equal(record.id, 'test-one');
  assert.equal(record.durationMs, 8000);
  assert.equal(record.lapCount, 2);
});

test('activity records reject invalid durations and timestamps', () => {
  assert.throws(() => makeActivity({ ...base, durationMs: -1 }, 'bad'));
  assert.throws(() => makeActivity({ ...base, startedAt: 'bad' }, 'bad'));
  assert.throws(() => makeActivity({ ...base, startedAt: '2026-11-07T10:00:00Z' }, 'bad'));
});

test('activity summary includes completed focus but not breaks or interrupted focus', () => {
  const entries = [
    makeActivity(base, 'one'),
    makeActivity({ ...base, kind: 'focus', title: 'Fokus', preset: 'focus', durationMs: 1_500_000 }, 'two'),
    makeActivity({ ...base, kind: 'focus', title: 'Jeda', preset: 'short', durationMs: 300_000 }, 'three'),
    makeActivity({ ...base, kind: 'focus', title: 'Fokus putus', preset: 'focus', status: 'interrupted', durationMs: 100_000 }, 'four'),
  ];
  const stats = activitySummary(entries);
  assert.equal(stats.total, 4);
  assert.equal(stats.completed, 3);
  assert.equal(stats.focusedMs, 1_500_000);
});

test('CSV includes BOM and escapes formula-like user text', () => {
  const csv = activitiesToCsv([makeActivity({ ...base, title: '=2+2' }, 'id1')]);
  assert.ok(csv.startsWith('\uFEFF"ID"'));
  assert.match(csv, /"'=2\+2"/);
  assert.match(csv, /"8\.000"/);
});
