import { useCallback, useEffect, useState } from 'react';

interface CountdownState { durationMs: number; remainingMs: number; endsAt: number | null; running: boolean; }

export function useCountdown(initialMs: number, onComplete?: () => void) {
  const [timer, setTimer] = useState<CountdownState>({ durationMs: initialMs, remainingMs: initialMs, endsAt: null, running: false });
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = timer.running && timer.endsAt !== null ? Math.max(0, timer.endsAt - now) : timer.remainingMs;

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [timer.running]);

  useEffect(() => {
    if (timer.running && remainingMs === 0) {
      setTimer(current => current.running ? { ...current, running: false, endsAt: null, remainingMs: 0 } : current);
      onComplete?.();
    }
  }, [timer.running, remainingMs, onComplete]);

  const toggle = useCallback(() => {
    const date = Date.now();
    setNow(date);
    setTimer(current => current.running
      ? { ...current, remainingMs: Math.max(0, (current.endsAt ?? date) - date), endsAt: null, running: false }
      : { ...current, remainingMs: current.remainingMs === 0 ? current.durationMs : current.remainingMs, endsAt: date + (current.remainingMs === 0 ? current.durationMs : current.remainingMs), running: true });
  }, []);

  const reset = useCallback(() => {
    setNow(Date.now());
    setTimer(current => ({ ...current, running: false, endsAt: null, remainingMs: current.durationMs }));
  }, []);

  const configure = useCallback((durationMs: number) => {
    const safe = Math.min(180 * 60_000, Math.max(1_000, Math.round(durationMs)));
    setNow(Date.now());
    setTimer({ durationMs: safe, remainingMs: safe, endsAt: null, running: false });
  }, []);

  return { remainingMs, durationMs: timer.durationMs, running: timer.running, toggle, reset, configure };
}
