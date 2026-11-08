import type { StopwatchState, Lap } from '../types.ts';

export const STORAGE_KEY = 'justsimple.session.v3';
export const LEGACY_STORAGE_KEY = 'justsimple.session.v1';

export function emptySession(): StopwatchState {
  return { elapsedBeforeRun: 0, startedAtPerf: null, startedAtEpoch: null, sessionStartedAtEpoch: null, running: false, lapAnchorMs: 0, laps: [] };
}

const validMs = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

interface StoredSession {
  version: 1 | 3;
  elapsedBeforeRun: number;
  startedAtEpoch: number | null;
  sessionStartedAtEpoch?: number | null;
  running: boolean;
  lapAnchorMs: number;
  laps: Lap[];
}

export function parseSession(raw: unknown, epochNow: number, perfNow: number): StopwatchState | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<StoredSession>;
  if (data.version !== 1 && data.version !== 3) return null;
  if (!validMs(data.elapsedBeforeRun) || !validMs(data.lapAnchorMs)) return null;
  if (typeof data.running !== 'boolean') return null;
  if (!Array.isArray(data.laps) || data.laps.length > 2000) return null;
  const validLaps = data.laps.every((lap, index) => lap !== null && typeof lap === 'object' &&
    lap.number === index + 1 && validMs(lap.splitMs) && validMs(lap.totalMs) &&
    typeof lap.recordedAt === 'string');
  if (!validLaps) return null;
  if (data.running && (!validMs(data.startedAtEpoch) || data.startedAtEpoch === 0)) return null;
  if (data.sessionStartedAtEpoch != null && !validMs(data.sessionStartedAtEpoch)) return null;
  const elapsedBeforeRun = data.elapsedBeforeRun + (data.running ? Math.max(0, epochNow - (data.startedAtEpoch ?? epochNow)) : 0);
  return {
    elapsedBeforeRun,
    startedAtPerf: data.running ? perfNow : null,
    startedAtEpoch: data.running ? epochNow : null,
    sessionStartedAtEpoch: data.sessionStartedAtEpoch ?? null,
    running: data.running,
    lapAnchorMs: data.lapAnchorMs,
    laps: data.laps.map(lap => ({ ...lap })),
  };
}

export function getElapsed(state: StopwatchState, perfNow: number): number {
  return state.running && state.startedAtPerf !== null
    ? state.elapsedBeforeRun + Math.max(0, perfNow - state.startedAtPerf)
    : state.elapsedBeforeRun;
}

export function toStoredSession(state: StopwatchState): StoredSession {
  return {
    version: 3,
    elapsedBeforeRun: state.elapsedBeforeRun,
    startedAtEpoch: state.running ? state.startedAtEpoch : null,
    sessionStartedAtEpoch: state.sessionStartedAtEpoch,
    running: state.running,
    lapAnchorMs: state.lapAnchorMs,
    laps: state.laps,
  };
}

export function restoreSession(): StopwatchState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw !== null) return parseSession(JSON.parse(raw), Date.now(), performance.now()) ?? emptySession();
  } catch { /* Private browsing or invalid saved data must not break the timer. */ }
  return emptySession();
}

export function saveSession(state: StopwatchState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toStoredSession(state))); }
  catch { /* Storage can be unavailable. */ }
}
