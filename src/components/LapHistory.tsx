import type { Lap } from '../types.ts';
import { formatDuration, getLapStats } from '../lib/time.ts';
import Icon from './Icons.tsx';

interface Props { laps: Lap[]; onClear: () => void; onExport: () => void; }

export default function LapHistory({ laps, onClear, onExport }: Props) {
  const stats = getLapStats(laps);
  return <section className="card laps-card" aria-labelledby="laps-title">
    <div className="laps-header">
      <div><p className="section-overline">03 — LAP HISTORY</p><h2 id="laps-title">Riwayat putaran <span className="lap-counter">{laps.length}</span></h2><p className="section-subtitle">Progres putaran terbaru hingga yang pertama.</p></div>
      <div className="laps-actions">
        <button className="text-button" type="button" onClick={onClear} disabled={!laps.length}><Icon name="trash"/>Hapus lap</button>
        <button className="button button-export" type="button" onClick={onExport} disabled={!laps.length}><Icon name="export"/>Export CSV</button>
      </div>
    </div>
    {laps.length === 0 ? <div className="laps-empty">
      <div className="empty-illustration" aria-hidden="true"><Icon name="stopwatch" /></div>
      <p>Belum ada putaran</p><span>Mulai stopwatch dan tekan “Catat lap” untuk melihat hasilnya di sini.</span>
    </div> : <div className="laps-table-wrap">
      <table className="laps-table">
        <thead><tr><th scope="col">PUTARAN</th><th scope="col">DURASI LAP</th><th scope="col">TOTAL WAKTU</th><th scope="col">PERFORMA</th></tr></thead>
        <tbody>{[...laps].reverse().map(lap => {
          const best = laps.length > 1 && lap.splitMs === stats.fastest;
          const slowest = laps.length > 1 && lap.splitMs === stats.slowest;
          return <tr key={lap.number}>
            <td className="lap-number">#{String(lap.number).padStart(2, '0')}</td>
            <td className="lap-duration">{formatDuration(lap.splitMs, true)}</td>
            <td className="lap-total">{formatDuration(lap.totalMs, true)}</td>
            <td><span className={`lap-tag${best ? ' tag-best' : slowest ? ' tag-slowest' : ''}`}>{best ? 'Tercepat' : slowest ? 'Terlama' : 'Selesai'}</span></td>
          </tr>;
        })}</tbody>
      </table>
    </div>}
  </section>;
}
