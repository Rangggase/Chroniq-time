import { useMemo, useState } from 'react';
import type { ActivityKind, ActivityRecord } from '../lib/activity.ts';
import { activitiesToCsv, activitySummary } from '../lib/activity.ts';
import { formatDuration } from '../lib/time.ts';
import Icon from './Icons.tsx';

type Filter = 'all' | ActivityKind;
interface Props {
  records: ActivityRecord[];
  loading: boolean;
  error: string | null;
  onRemove: (id: string) => Promise<void>;
  onClear: () => Promise<void>;
}
const types: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Semua' }, { value: 'stopwatch', label: 'Stopwatch' },
  { value: 'focus', label: 'Focus' }, { value: 'countdown', label: 'Countdown' },
];
const labels: Record<ActivityKind, string> = { stopwatch: 'Stopwatch', focus: 'Focus / Pomodoro', countdown: 'Countdown' };

function downloadHistory(records: ActivityRecord[]) {
  if (!records.length) return;
  const url = URL.createObjectURL(new Blob([activitiesToCsv(records)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `JustSimple-Activity-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export default function ActivityHistory({ records, loading, error, onRemove, onClear }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState(false);
  const stats = useMemo(() => activitySummary(records), [records]);
  const filtered = useMemo(() => filter === 'all' ? records : records.filter(r => r.kind === filter), [records, filter]);
  const fmtDate = (date: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

  return <section className="card activity-history" aria-labelledby="activity-title">
    <div className="activity-heading">
      <div>
        <p className="section-overline">04 — ACTIVITY ARCHIVE</p>
        <h2 id="activity-title">Riwayat aktivitas</h2>
        <p className="activity-description">Tersimpan di browser ini melalui IndexedDB. Tidak ada data yang dikirim ke server.</p>
      </div>
      <button type="button" className="button button-secondary" aria-expanded={open} aria-controls="activity-content" onClick={() => setOpen(v => !v)}>{open ? 'Tutup riwayat' : 'Lihat riwayat'}</button>
    </div>
    <div className="activity-stats" aria-label="Ringkasan riwayat aktivitas">
      <div><span>Total sesi</span><strong data-testid="activity-total">{stats.total}</strong></div>
      <div><span>Sesi selesai</span><strong>{stats.completed}</strong></div>
      <div><span>Total fokus selesai</span><strong>{Math.round(stats.focusedMs / 60_000)} <small>menit</small></strong></div>
    </div>
    {error && <p role="alert" className="activity-error">Penyimpanan tidak tersedia: {error}</p>}
    {open && <div id="activity-content" className="activity-content">
      <div className="activity-toolbar">
        <div className="activity-filters" aria-label="Filter jenis aktivitas">{types.map(t =>
          <button key={t.value} type="button" className={filter === t.value ? 'selected' : ''} aria-pressed={filter === t.value} onClick={() => setFilter(t.value)}>{t.label}</button>
        )}</div>
        <div className="activity-actions">
          <button type="button" className="button button-export" disabled={!records.length} onClick={() => downloadHistory(records)}><Icon name="export"/>Ekspor riwayat CSV</button>
          <button type="button" className="button button-ghost" disabled={!records.length} onClick={() => { if (window.confirm('Hapus SELURUH riwayat aktivitas di browser ini?')) void onClear(); }}><Icon name="trash"/>Hapus semua</button>
        </div>
      </div>
      {loading ? <p className="activity-empty">Memuat riwayat...</p> : !filtered.length ? <p className="activity-empty">Belum ada sesi tersimpan untuk filter ini. Simpan stopwatch, atau selesaikan sesi Focus/Countdown.</p> :
        <div className="activity-list" role="list">{filtered.slice(0, 100).map(rec => <div className="activity-entry" role="listitem" key={rec.id}>
          <div className="activity-entry-main"><span className="activity-kind">{labels[rec.kind]}</span><strong>{rec.title}</strong><span>{fmtDate(rec.endedAt)} · {rec.status === 'completed' ? 'Selesai' : 'Dihentikan'}</span></div>
          <div className="activity-entry-side"><strong>{formatDuration(rec.durationMs, true)}</strong><button type="button" className="activity-remove" aria-label={`Hapus aktivitas ${rec.title} ${rec.id}`} onClick={() => void onRemove(rec.id)}><Icon name="trash"/></button></div>
        </div>)}</div>}
      {filtered.length > 100 && <p className="activity-description">Menampilkan 100 dari {filtered.length} sesi. Ekspor CSV mencakup seluruh riwayat.</p>}
    </div>}
  </section>;
}
