import type { CSSProperties } from 'react';
import { presets, type FocusPreset, useFocusTimer } from '../hooks/useFocusTimer.ts';
import { formatCountdown } from '../lib/time.ts';
import Icon from './Icons.tsx';

interface Props { focus: ReturnType<typeof useFocusTimer>; }

export default function FocusPanel({ focus }: Props) {
  const progress = Math.min(100, Math.max(0, (1 - focus.remainingMs / focus.durationMs) * 100));
  return <div className="dashboard-grid secondary-grid" role="tabpanel" id="panel-focus" aria-labelledby="tab-focus">
    <section className="card productivity-card" aria-labelledby="focus-title">
      <div className="section-header"><div><p className="section-overline">01 — FOCUS STUDIO</p><h2 id="focus-title">Focus timer</h2></div><span className="tool-badge"><Icon name="focus"/> POMODORO</span></div>
      <div className="preset-row" aria-label="Jenis sesi">
        {(Object.keys(presets) as FocusPreset[]).map(key => <button type="button" key={key} aria-pressed={focus.preset === key} className={`preset${focus.preset === key ? ' selected' : ''}`} onClick={() => focus.choose(key)}>{presets[key].label}</button>)}
      </div>
      <div className="countdown-stage">
        <div className="progress-halo" style={{ '--progress': `${progress}%` } as CSSProperties}><Icon name="focus" /></div>
        <p className="timer-caption">{presets[focus.preset].minutes} MINUTES • {focus.preset.toUpperCase()}</p>
        <p className="countdown-display" role="timer" aria-live="off">{formatCountdown(focus.remainingMs)}</p>
        <p className="time-hint">{focus.finished ? 'Sesi selesai. Kerja bagus!' : presets[focus.preset].note}</p>
      </div>
      <div className="productivity-controls">
        <button className={`button button-primary${focus.running ? ' is-running' : ''}`} type="button" onClick={focus.toggle}><Icon name={focus.running ? 'pause' : 'play'}/>{focus.running ? 'Jeda' : focus.remainingMs < focus.durationMs && focus.remainingMs > 0 ? 'Lanjutkan' : 'Mulai fokus'}</button>
        <button className="button button-ghost" type="button" onClick={focus.reset}><Icon name="reset"/>Reset</button>
      </div>
    </section>
    <aside className="card productivity-info" aria-labelledby="focus-stats-title">
      <p className="section-overline">02 — FOCUS OVERVIEW</p><h2 id="focus-stats-title">Progres fokusmu</h2>
      <div className="featured-stat"><span>Total sesi fokus selesai</span><strong>{String(focus.completed).padStart(2, '0')}</strong><p>Jumlah sesi fokus 25 menit yang selesai di browser ini.</p></div>
      <div className="productivity-tip"><Icon name="sparkles"/><div><strong>Deep work, made simple.</strong><p>Mulai dengan 25 menit fokus, kemudian istirahat selama 5 menit. Tidak perlu multitasking.</p></div></div>
      <p className="privacy-note">Penghitungan sesi fokus tersimpan secara lokal, tanpa akun dan tanpa server.</p>
    </aside>
  </div>;
}
