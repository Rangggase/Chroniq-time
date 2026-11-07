import { formatDuration } from '../lib/time.ts';
import Icon from './Icons.tsx';

interface Props {
  stats: {count: number; fastest: number | null; slowest: number | null; average: number | null};
  currentLapMs: number;
}

export default function SessionStats({ stats, currentLapMs }: Props) {
  return <aside className="card insight-card" aria-labelledby="insight-title">
    <div className="section-header">
      <div><p className="section-overline">02 — SESSION OVERVIEW</p><h2 id="insight-title">Ringkasan sesi</h2></div>
      <Icon className="insight-header-icon" name="chart"/>
    </div>
    <div className="stats-grid">
      <div className="stat-box stat-laps"><p className="stat-label">Total lap</p><p className="stat-value large">{String(stats.count).padStart(2, '0')}</p><span className="stat-detail">putaran tercatat</span></div>
      <div className="stat-box"><p className="stat-label">Lap tercepat</p><p className="stat-value">{stats.fastest === null ? '--:--.---' : formatDuration(stats.fastest, true)}</p><span className="stat-detail">personal best sesi ini</span></div>
      <div className="stat-box"><p className="stat-label">Rata-rata lap</p><p className="stat-value">{stats.average === null ? '--:--.---' : formatDuration(stats.average, true)}</p><span className="stat-detail">durasi tiap putaran</span></div>
      <div className="stat-box"><p className="stat-label">Lap berjalan</p><p className="stat-value">{formatDuration(currentLapMs, true)}</p><span className="stat-detail">sejak lap terakhir</span></div>
    </div>
    <div className="insight-note"><span className="sparkle" aria-hidden="true">✳</span><p><strong>Stay in your flow.</strong><br/>Data stopwatch tersimpan otomatis di browser. Sesi v2 juga dapat dibaca saat pertama kali membuka v3.</p></div>
  </aside>;
}
