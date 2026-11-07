import type { CSSProperties } from 'react';
import type { useCountdown } from '../hooks/useCountdown.ts';
import { formatCountdown } from '../lib/time.ts';
import Icon from './Icons.tsx';

const defaults = [1, 5, 10, 30];
interface Props {
  timer: ReturnType<typeof useCountdown>;
  minutes: number;
  onChangeMinutes: (minutes: number) => void;
  onChoose: (minutes: number) => void;
  onToggle?: () => void;
  onReset?: () => void;
}

export default function CountdownPanel({ timer, minutes, onChangeMinutes, onChoose, onToggle = timer.toggle, onReset = timer.reset }: Props) {
  const done = timer.remainingMs === 0 && !timer.running;
  const progress = Math.min(100, Math.max(0, (1 - timer.remainingMs / timer.durationMs) * 100));

  return <div className="dashboard-grid secondary-grid" role="tabpanel" id="panel-countdown" aria-labelledby="tab-countdown">
    <section className="card productivity-card" aria-labelledby="countdown-title">
      <div className="section-header"><div><p className="section-overline">01 — COUNTDOWN TOOL</p><h2 id="countdown-title">Countdown timer</h2></div><span className="tool-badge"><Icon name="hourglass"/> COUNTDOWN</span></div>
      <div className="preset-row" aria-label="Preset durasi">{defaults.map(value => <button type="button" key={value} className={`preset${minutes === value ? ' selected' : ''}`} aria-pressed={minutes === value} onClick={() => onChoose(value)}>{value} menit</button>)}</div>
      <div className="countdown-stage">
        <div className="progress-halo" style={{ '--progress': `${progress}%` } as CSSProperties}><Icon name="hourglass"/></div>
        <p className="timer-caption">CUSTOM COUNTDOWN</p>
        <p className="countdown-display" role="timer" aria-live="off">{formatCountdown(timer.remainingMs)}</p>
        <p className="time-hint">{done ? 'Waktu telah habis!' : 'Atur durasi, lalu mulai hitung mundur.'}</p>
      </div>
      <div className="productivity-controls">
        <button className={`button button-primary${timer.running ? ' is-running' : ''}`} onClick={onToggle} type="button"><Icon name={timer.running ? 'pause' : 'play'}/>{timer.running ? 'Jeda' : timer.remainingMs < timer.durationMs && timer.remainingMs > 0 ? 'Lanjutkan' : 'Mulai'}</button>
        <button className="button button-ghost" onClick={onReset} type="button"><Icon name="reset"/>Reset</button>
      </div>
    </section>
    <aside className="card productivity-info" aria-labelledby="countdown-settings-title">
      <p className="section-overline">02 — TIME SETTINGS</p><h2 id="countdown-settings-title">Atur waktumu</h2>
      <label className="input-label" htmlFor="custom-minutes">Durasi khusus (menit)</label>
      <div className="custom-input-row"><input id="custom-minutes" type="number" min="1" max="180" value={minutes} onChange={event => onChangeMinutes(Number(event.target.value))}/><button className="button button-secondary" type="button" onClick={() => onChoose(minutes)} disabled={!Number.isInteger(minutes) || minutes < 1 || minutes > 180}>Terapkan</button></div>
      <p className="helper-copy">Masukkan 1 hingga 180 menit. Mengganti durasi akan mengatur ulang countdown.</p>
      <div className="productivity-tip"><Icon name="check"/><div><strong>Ringkas dan akurat.</strong><p>Countdown menggunakan waktu sistem sehingga tidak bergantung pada jumlah pembaruan tampilan.</p></div></div>
      <p className="privacy-note">Countdown ini berjalan selama halaman masih terbuka; belum menyimpan status setelah refresh.</p>
    </aside>
  </div>;
}
