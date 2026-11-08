import type { Lap } from '../types.ts';
import { toCsv } from './time.ts';

export function downloadLaps(laps: readonly Lap[]): void {
  if (!laps.length) return;
  const blob = new Blob([toCsv(laps)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Chroniq-Laps-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
