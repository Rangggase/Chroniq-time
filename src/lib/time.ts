import type { Lap } from '../types.ts';

const safeMs = (value: number): number => Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
const pad2 = (value: number): string => String(value).padStart(2, '0');

export function formatDuration(value: number, compact = false): string {
  const ms = safeMs(value);
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  const milli = String(ms % 1_000).padStart(3, '0');
  if (compact && hours === 0) return `${pad2(minutes)}:${pad2(seconds)}.${milli}`;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${milli}`;
}

export function formatCountdown(value: number): string {
  const seconds = Math.ceil(safeMs(value) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  return hours > 0 ? `${pad2(hours)}:${pad2(minutes)}:${pad2(remaining)}` : `${pad2(minutes)}:${pad2(remaining)}`;
}

export function getLapStats(laps: readonly Lap[]): {count: number; fastest: number | null; slowest: number | null; average: number | null} {
  if (laps.length === 0) return { count: 0, fastest: null, slowest: null, average: null };
  const splits = laps.map(lap => lap.splitMs);
  return {
    count: splits.length,
    fastest: Math.min(...splits),
    slowest: Math.max(...splits),
    average: splits.reduce((sum, ms) => sum + ms, 0) / splits.length,
  };
}

export function toCsv(laps: readonly Lap[]): string {
  const rows: (string | number)[][] = [['Lap', 'Durasi Lap', 'Total Waktu', 'Waktu Dicatat']];
  for (const lap of laps) rows.push([lap.number, formatDuration(lap.splitMs), formatDuration(lap.totalMs), lap.recordedAt]);
  const escape = (value: string | number): string => `"${String(value).replaceAll('"', '""')}"`;
  return '\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n') + '\r\n';
}
