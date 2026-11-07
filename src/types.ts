export interface Lap {
  number: number;
  splitMs: number;
  totalMs: number;
  recordedAt: string;
}

export interface StopwatchState {
  elapsedBeforeRun: number;
  startedAtPerf: number | null;
  startedAtEpoch: number | null;
  running: boolean;
  lapAnchorMs: number;
  laps: Lap[];
}

export type Theme = 'dark' | 'light';
export type AppMode = 'stopwatch' | 'focus' | 'countdown';
