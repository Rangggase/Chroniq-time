import { useMemo, useState } from 'react';
import type { ActivityRecord } from '../lib/activity.ts';
import { buildProductivityAnalytics, type AnalyticsPeriod } from '../lib/analytics.ts';

interface Props { records: ActivityRecord[]; loading: boolean; error: string | null }
const periods: AnalyticsPeriod[] = [7, 30, 90];
const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const minutes = (ms: number) => number.format(Math.round(ms / 6_000) / 10);

export default function ProductivityAnalytics({ records, loading, error }: Props) {
  const [period, setPeriod] = useState<AnalyticsPeriod>(7);
  const stats = useMemo(() => buildProductivityAnalytics(records, period), [records, period]);
  const maxTrend = Math.max(1, ...stats.trend.map(x => x.focusedMs));
  const modeRows = [
    { key: 'stopwatch' as const, name: 'Stopwatch' },
    { key: 'focus' as const, name: 'Focus' },
    { key: 'countdown' as const, name: 'Countdown' },
  ];
  const maxMode = Math.max(1, ...Object.values(stats.durationByKind));

  return <section className="card analytics-dashboard" aria-labelledby="analytics-title">
    <div className="analytics-heading">
      <div>
        <p className="section-overline">05 — PRODUCTIVITY ANALYTICS</p>
        <h2 id="analytics-title">Analisis produktivitas</h2>
        <p className="activity-description">Dihitung otomatis dari riwayat IndexedDB di browser ini.</p>
      </div>
      <div role="group" className="analytics-periods" aria-label="Periode analitik">
        {periods.map(days => <button key={days} type="button" aria-pressed={period === days} className={period === days ? 'selected' : ''} onClick={() => setPeriod(days)}>{days} hari</button>)}
      </div>
    </div>

    {error && <p className="activity-error" role="alert">Data riwayat tidak bisa dibaca. Statistik mungkin belum lengkap.</p>}
    <div className="analytics-metrics" aria-label="Statistik produktivitas">
      <div><span>Total waktu fokus</span><strong data-testid="analytics-focus-minutes">{minutes(stats.focusedMs)} <small>menit</small></strong></div>
      <div><span>Sesi fokus selesai</span><strong data-testid="analytics-focus-sessions">{stats.completedFocusSessions}</strong></div>
      <div><span>Rata-rata sesi fokus</span><strong>{minutes(stats.averageFocusMs)} <small>menit</small></strong></div>
      <div><span>Hari aktif fokus</span><strong data-testid="analytics-active-days">{stats.activeFocusDays} <small>hari</small></strong></div>
    </div>

    <div className="analytics-panels">
      <div className="analytics-main-panel">
        <div className="analytics-subheading"><h3>Tren fokus</h3><span>{period === 7 ? 'Per hari' : 'Per 7 hari'} · {stats.fromDate} s.d. {stats.toDate}</span></div>
        <div className="analytics-chart" role="img" aria-label={`Grafik waktu fokus selesai selama ${period} hari terakhir`}
             style={{ gridTemplateColumns: `repeat(${stats.trend.length}, minmax(0, 1fr))` }}>
          {stats.trend.map(bucket => <div className="analytics-chart-col" key={bucket.startDate}
            title={`${bucket.label}: ${minutes(bucket.focusedMs)} menit; ${bucket.completedFocusSessions} sesi`}>
            <span className="analytics-chart-value">{bucket.focusedMs ? minutes(bucket.focusedMs) : '0'}</span>
            <div className="analytics-bar-track"><div className="analytics-bar-fill" style={{ height: `${bucket.focusedMs ? Math.max(5, 100 * bucket.focusedMs / maxTrend) : 0}%` }} /></div>
            <span className="analytics-chart-label">{bucket.label}</span>
          </div>)}
        </div>
        <p className="analytics-note">Angka pada grafik dalam menit. Waktu fokus hanya menghitung preset Fokus yang selesai; sesi istirahat dan sesi terhenti tidak dihitung.</p>
        {loading ? <p className="activity-empty">Memuat statistik...</p> : !stats.completedFocusSessions && <p className="analytics-empty" data-testid="analytics-empty">Belum ada sesi fokus selesai dalam periode ini. Selesaikan satu sesi Focus untuk mulai melihat tren.</p>}
      </div>
      <aside className="analytics-side-panel" aria-label="Ringkasan aktivitas per mode">
        <h3>Durasi per mode</h3>
        <p className="analytics-note">Total durasi sesi selesai, tidak termasuk sesi terhenti atau istirahat Pomodoro.</p>
        {modeRows.map(mode => <div className="analytics-mode" key={mode.key}>
          <div className="analytics-mode-caption"><span>{mode.name}</span><strong>{minutes(stats.durationByKind[mode.key])} menit</strong></div>
          <div className="analytics-mode-track"><div style={{ width: `${100 * stats.durationByKind[mode.key] / maxMode}%` }}/></div>
        </div>)}
        <div className="analytics-footer-stats"><span>Sesi selesai <strong data-testid="analytics-completed-sessions">{stats.completedSessions}</strong></span><span>Sesi terhenti <strong>{stats.interruptedSessions}</strong></span></div>
      </aside>
    </div>
  </section>;
}
