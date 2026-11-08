import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatCountdown, getLapStats, toCsv } from '../src/lib/time.ts';
import { emptySession, getElapsed, parseSession, toStoredSession } from '../src/lib/session.ts';

const laps = [
  { number: 1, splitMs: 2550, totalMs: 2550, recordedAt: '2026-11-06T00:00:00.000Z' },
  { number: 2, splitMs: 1235, totalMs: 3785, recordedAt: '2026-11-06T00:00:02.000Z' },
  { number: 3, splitMs: 4215, totalMs: 8000, recordedAt: '2026-11-06T00:00:03.000Z' },
];

test('formatDuration supports milliseconds, hours and compact display', () => {
  assert.equal(formatDuration(0), '00:00:00.000');
  assert.equal(formatDuration(72_534), '00:01:12.534');
  assert.equal(formatDuration(3_723_009), '01:02:03.009');
  assert.equal(formatDuration(72_534, true), '01:12.534');
  assert.equal(formatDuration(-12), '00:00:00.000');
});

test('countdown rounds remaining partial seconds upwards', () => {
  assert.equal(formatCountdown(60_001), '01:01');
  assert.equal(formatCountdown(1), '00:01');
  assert.equal(formatCountdown(0), '00:00');
  assert.equal(formatCountdown(3_601_000), '01:00:01');
});

test('lap stats find fastest, slowest and mean', () => {
  assert.deepEqual(getLapStats([]), { count: 0, fastest: null, slowest: null, average: null });
  assert.deepEqual(getLapStats(laps), { count: 3, fastest: 1235, slowest: 4215, average: 8000 / 3 });
});

test('CSV exports header, numbers and UTC timestamps', () => {
  const csv = toCsv(laps);
  assert.ok(csv.startsWith('\uFEFF"Lap","Durasi Lap","Total Waktu","Waktu Dicatat"'));
  assert.match(csv, /"2","00:00:01\.235","00:00:03\.785","2026-11-06T00:00:02\.000Z"/);
  assert.ok(csv.endsWith('\r\n'));
});

test('empty session is paused and 0', () => {
  const s = emptySession();
  assert.equal(s.running, false);
  assert.equal(getElapsed(s, 5000), 0);
});

test('running session uses monotonic elapsed timing', () => {
  const s = { ...emptySession(), running: true, elapsedBeforeRun: 1400, startedAtPerf: 1000, startedAtEpoch: 2000 };
  assert.equal(getElapsed(s, 2400), 2800);
  assert.equal(getElapsed(s, 500), 1400);
});

test('running v2 session survives refresh using wall-clock interval', () => {
  const legacy = { version: 1, elapsedBeforeRun: 4000, startedAtEpoch: 200_000, running: true, lapAnchorMs: 0, laps };
  const restored = parseSession(legacy, 206_000, 800);
  assert.ok(restored);
  assert.equal(restored.elapsedBeforeRun, 10_000);
  assert.equal(restored.startedAtPerf, 800);
  assert.equal(getElapsed(restored, 1300), 10_500);
  assert.deepEqual(restored.laps, laps);
});

test('paused v3 roundtrip holds elapsed time and laps', () => {
  const stored = toStoredSession({ ...emptySession(), elapsedBeforeRun: 90_000, laps });
  assert.equal(stored.version, 3);
  const loaded = parseSession(stored, 900_000, 5000);
  assert.deepEqual(loaded?.laps, laps);
  assert.equal(loaded?.elapsedBeforeRun, 90_000);
  assert.equal(loaded?.running, false);
});

test('invalid sessions are rejected safely', () => {
  assert.equal(parseSession(null, 1, 1), null);
  assert.equal(parseSession({ version: 8 }, 1, 1), null);
  assert.equal(parseSession({ version: 1, elapsedBeforeRun: -4, lapAnchorMs: 0, running: false, laps: [] }, 1, 1), null);
  assert.equal(parseSession({ version: 1, elapsedBeforeRun: 1, lapAnchorMs: 0, running: true, startedAtEpoch: null, laps: [] }, 1, 1), null);
  assert.equal(parseSession({ version: 3, elapsedBeforeRun: 1, lapAnchorMs: 0, running: false, laps: [{ number: 9, splitMs: 10, totalMs: 10, recordedAt: 'x' }] }, 1, 1), null);
});


test('v3.1 session stores first start time through pause/refresh', () => {
  const firstStart = 1762506000000;
  const stored = toStoredSession({ ...emptySession(), elapsedBeforeRun: 5000, sessionStartedAtEpoch: firstStart });
  const restored = parseSession(stored, firstStart + 7000, 100);
  assert.equal(restored?.sessionStartedAtEpoch, firstStart);
});
