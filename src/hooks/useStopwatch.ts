import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StopwatchState } from '../types.ts';
import { getElapsed, restoreSession, saveSession, emptySession } from '../lib/session.ts';
import { getLapStats } from '../lib/time.ts';

export function useStopwatch() {
  const [state, setState] = useState<StopwatchState>(restoreSession);
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => { saveSession(state); }, [state]);

  useEffect(() => {
    if (!state.running) return;
    let id = 0;
    const frame = () => {
      setNow(performance.now());
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [state.running]);

  const elapsedMs = getElapsed(state, now);
  const stats = useMemo(() => getLapStats(state.laps), [state.laps]);
  const currentLapMs = Math.max(0, elapsedMs - (state.laps.at(-1)?.totalMs ?? state.lapAnchorMs));

  const toggle = useCallback(() => {
    const time = performance.now();
    const epoch = Date.now();
    setNow(time);
    setState(current => current.running
      ? { ...current, elapsedBeforeRun: getElapsed(current, time), startedAtPerf: null, startedAtEpoch: null, running: false }
      : { ...current, startedAtPerf: time, startedAtEpoch: epoch, running: true });
  }, []);

  const lap = useCallback(() => {
    const time = performance.now();
    setNow(time);
    setState(current => {
      if (!current.running || current.laps.length >= 2000) return current;
      const totalMs = getElapsed(current, time);
      const previous = current.laps.at(-1)?.totalMs ?? current.lapAnchorMs;
      const newLap = { number: current.laps.length + 1, splitMs: Math.max(0, totalMs - previous), totalMs, recordedAt: new Date().toISOString() };
      return { ...current, laps: [...current.laps, newLap] };
    });
  }, []);

  const reset = useCallback(() => { setNow(performance.now()); setState(emptySession()); }, []);

  const clearLaps = useCallback(() => {
    const time = performance.now();
    setNow(time);
    setState(current => current.laps.length === 0 ? current : { ...current, lapAnchorMs: getElapsed(current, time), laps: [] });
  }, []);

  return { state, elapsedMs, currentLapMs, stats, toggle, lap, reset, clearLaps };
}
