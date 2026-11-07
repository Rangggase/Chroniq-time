import { useCallback, useEffect, useState } from 'react';
import { useCountdown } from './useCountdown.ts';

export type FocusPreset = 'focus' | 'short' | 'long';
export const presets: Record<FocusPreset, { label: string; minutes: number; note: string }> = {
  focus: { label: 'Fokus', minutes: 25, note: 'Satu tugas, satu sesi. Mulai kerjakan hal yang paling penting.' },
  short: { label: 'Istirahat pendek', minutes: 5, note: 'Berdiri, peregangan, dan istirahatkan mata.' },
  long: { label: 'Istirahat panjang', minutes: 15, note: 'Ambil jeda lebih lama sebelum kembali fokus.' },
};
const COMPLETED_KEY = 'justsimple.focus-completed.v3';

function readCompleted(): number {
  try {
    const value = Number(localStorage.getItem(COMPLETED_KEY));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch { return 0; }
}

export function useFocusTimer() {
  const [preset, setPreset] = useState<FocusPreset>('focus');
  const [completed, setCompleted] = useState(readCompleted);
  const [finished, setFinished] = useState(false);
  const onComplete = useCallback(() => {
    setFinished(true);
    if (preset === 'focus') setCompleted(current => current + 1);
  }, [preset]);
  const timer = useCountdown(presets.focus.minutes * 60_000, onComplete);

  useEffect(() => {
    try { localStorage.setItem(COMPLETED_KEY, String(completed)); } catch { /* Browser storage is optional. */ }
  }, [completed]);

  const choose = useCallback((value: FocusPreset) => {
    setPreset(value);
    setFinished(false);
    timer.configure(presets[value].minutes * 60_000);
  }, [timer.configure]);

  const toggle = useCallback(() => { setFinished(false); timer.toggle(); }, [timer.toggle]);
  const reset = useCallback(() => { setFinished(false); timer.reset(); }, [timer.reset]);
  return { ...timer, preset, completed, finished, choose, toggle, reset };
}
