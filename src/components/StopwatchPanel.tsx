import type { CSSProperties } from 'react';
import type { StopwatchState } from '../types.ts';
import { formatDuration } from '../lib/time.ts';
import Icon from './Icons.tsx';

interface Props {
  state: StopwatchState;
  elapsedMs: number;
  onToggle: () => void;
  onLap: () => void;
  onReset: () => void;
}

export default function StopwatchPanel({ state, elapsedMs, onToggle, onLap, onReset }: Props) {
  const display = formatDuration(elapsedMs);
  const dot = display.lastIndexOf('.');
  const started = state.running || elapsedMs > 0;
  const status = state.running ? 'Sedang berjalan' : started ? 'Sedang dijeda' : 'Siap dimulai';
  const orbitStyle = { '--orbit-degrees': `${((elapsedMs % 60_000) / 60_000) * 360}deg` } as CSSProperties;

  return <section className="card timer-card" aria-labelledby="stopwatch-title">
    <div className="section-header">
      <div><p className="section-overline">01 — MAIN TIMER</p><h2 id="stopwatch-title">Stopwatch</h2></div>
      <div className={`status${state.running ? ' is-running' : started ? ' is-paused' : ''}`}><span className="status-light"/><span>{status}</span></div>
    </div>
    <div className="time-stage">
      <div className="timer-orbit" style={orbitStyle} aria-hidden="true"><span className="timer-orbit-core"><Icon name="stopwatch" /></span></div>
      <p className="timer-caption">TOTAL ELAPSED TIME</p>
      <div className="time-display" role="timer" aria-label={`Waktu stopwatch ${display}`} aria-live="off">
        <span className="time-main">{display.slice(0, dot)}</span><span className="time-milliseconds">{display.slice(dot)}</span>
      </div>
      <div className="timer-units"><span>HOURS</span><span>MINUTES</span><span>SECONDS</span><span>MILLISECONDS</span></div>
      <p className="time-hint">{state.running ? 'Waktu terus berjalan. Catat lap kapan pun kamu mau.' : started ? 'Sesi dijeda. Lanjutkan saat kamu siap.' : 'Tekan mulai untuk mencatat waktu.'}</p>
    </div>
    <div className="timer-controls">
      <button className={`button button-primary${state.running ? ' is-running' : ''}`} type="button" aria-keyshortcuts="Space" onClick={onToggle}>
        <Icon name={state.running ? 'pause' : 'play'}/>{state.running ? 'Jeda' : started ? 'Lanjutkan' : 'Mulai'}
      </button>
      <button className="button button-secondary" type="button" aria-keyshortcuts="L" onClick={onLap} disabled={!state.running || state.laps.length >= 2000}>
        <Icon name="flag"/>Catat lap
      </button>
      <button className="button button-ghost" type="button" aria-keyshortcuts="Shift+R" title="Reset timer dan seluruh lap" onClick={onReset} disabled={!started && state.laps.length === 0}>
        <Icon name="reset"/>Reset
      </button>
    </div>
    <div className="timer-footnote"><span className="live-dot"/> Presisi waktu berbasis jam monotonic browser</div>
  </section>;
}
