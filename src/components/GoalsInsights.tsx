import { useEffect, useMemo, useState } from 'react';
import type { ActivityRecord } from '../lib/activity.ts';
import {
  GOAL_STEP_MINUTES, MAX_GOAL_MINUTES, MIN_GOAL_MINUTES,
  buildGoalInsights, isValidGoalMinutes, persistDailyGoal, readDailyGoal,
} from '../lib/goals.ts';

interface Props { records: ActivityRecord[]; loading: boolean; error: string | null }
const format = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const asMinutes = (ms: number) => format.format(Math.round(ms / 6_000) / 10);
const suggestedTargets = [60, 120, 180];

export default function GoalsInsights({ records, loading, error }: Props) {
  const [goal, setGoal] = useState(readDailyGoal);
  const [draft, setDraft] = useState(String(goal));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [now, setNow] = useState(() => new Date());

  // Refresh date-based statistics when the user returns to a tab after midnight.
  useEffect(() => {
    const refreshDate = () => setNow(new Date());
    const onVisibility = () => { if (document.visibilityState === 'visible') refreshDate(); };
    window.addEventListener('focus', refreshDate);
    document.addEventListener('visibilitychange', onVisibility);
    const refreshInterval = window.setInterval(refreshDate, 60_000);
    return () => {
      window.removeEventListener('focus', refreshDate);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(refreshInterval);
    };
  }, []);

  const insights = useMemo(() => buildGoalInsights(records, goal, now), [records, goal, now]);
  const proposedGoal = Number(draft);
  const draftValid = /^\d+$/.test(draft.trim()) && isValidGoalMinutes(proposedGoal);

  function saveGoal() {
    if (!draftValid) {
      setSaveError(`Gunakan ${MIN_GOAL_MINUTES}–${MAX_GOAL_MINUTES} menit, kelipatan ${GOAL_STEP_MINUTES}.`);
      setSaveMessage('');
      return;
    }
    try {
      persistDailyGoal(proposedGoal);
      setGoal(proposedGoal);
      setNow(new Date());
      setSaveError(null);
      setSaveMessage('Target tersimpan di browser ini.');
    } catch {
      setSaveError('Pengaturan browser tidak dapat menyimpan target. Periksa izin penyimpanan.');
      setSaveMessage('');
    }
  }

  return <section className="card goals-dashboard" aria-labelledby="goals-title">
    <div className="goals-heading">
      <div>
        <p className="section-overline">06 — GOALS & INSIGHTS</p>
        <h2 id="goals-title">Target & konsistensi</h2>
        <p className="activity-description">Target personal dan progres dihitung secara lokal. Tanpa akun maupun sinkronisasi cloud.</p>
      </div>
      <div className="goals-setting">
        <label htmlFor="daily-goal-minutes">Target fokus harian (menit)</label>
        <div className="goals-setting-row">
          <input id="daily-goal-minutes" type="number" min={MIN_GOAL_MINUTES} max={MAX_GOAL_MINUTES} step={GOAL_STEP_MINUTES}
            inputMode="numeric" value={draft} onChange={event => { setDraft(event.target.value); setSaveError(null); setSaveMessage(''); }} />
          <button type="button" className="button button-primary goals-save" disabled={!draftValid} onClick={saveGoal}>Simpan target</button>
        </div>
        <div className="goals-suggestions" aria-label="Preset target fokus">
          {suggestedTargets.map(value => <button key={value} type="button" aria-pressed={draft === String(value)}
            onClick={() => { setDraft(String(value)); setSaveError(null); setSaveMessage(''); }}>{value} menit</button>)}
        </div>
        {saveError && <p role="alert" className="goals-setting-error">{saveError}</p>}
        {saveMessage && <p role="status" className="goals-setting-success">{saveMessage}</p>}
      </div>
    </div>

    {error && <p className="activity-error" role="alert">Riwayat tidak dapat dibaca. Statistik tujuan mungkin tidak lengkap.</p>}
    <div className="goals-today">
      <div className="goals-today-meta">
        <div><span className="goals-caption">TARGET HARI INI</span><h3>Fokus yang berarti, setiap hari.</h3></div>
        <span className={insights.achievedToday ? 'goals-status achieved' : 'goals-status'} data-testid="goals-status">
          {insights.achievedToday ? 'Target tercapai' : 'Dalam progres'}
        </span>
      </div>
      <div className="goals-progress-caption">
        <div><strong data-testid="goals-current-minutes">{asMinutes(insights.todayFocusedMs)}</strong> <span>/ <span data-testid="goals-target-minutes">{goal}</span> menit</span></div>
        <strong data-testid="goals-progress-percent">{insights.progressPercent}%</strong>
      </div>
      <div className="goals-progress-track" role="progressbar" aria-label="Progres target fokus hari ini"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={insights.progressPercent}>
        <div className="goals-progress-fill" style={{ width: `${insights.progressPercent}%` }} />
      </div>
      <p className="goals-footnote" data-testid="goals-remaining">
        {insights.achievedToday ? 'Target hari ini tercapai. Pertahankan konsistensimu!' :
          `Butuh ${asMinutes(insights.remainingMs)} menit fokus selesai untuk mencapai target.`}
      </p>
    </div>

    <div className="goals-metrics" aria-label="Ringkasan target dan konsistensi">
      <div><span>Streak aktif</span><strong data-testid="goals-current-streak">{insights.currentStreak} <small>hari</small></strong></div>
      <div><span>Streak terpanjang</span><strong data-testid="goals-longest-streak">{insights.longestStreak} <small>hari</small></strong></div>
      <div><span>Target tercapai minggu ini</span><strong data-testid="goals-week-achieved">{insights.weekAchievedDays} <small>/ 7 hari</small></strong></div>
      <div><span>Waktu fokus minggu ini</span><strong data-testid="goals-week-focus">{asMinutes(insights.weekFocusedMs)} <small>menit</small></strong></div>
    </div>

    <div className="goals-week-panel">
      <div className="goals-week-heading"><h3>Konsistensi minggu ini</h3><span>Senin – Minggu · hari lokal</span></div>
      <div className="goals-week-grid" aria-label="Aktivitas fokus per hari minggu ini">
        {insights.weekDays.map(day => <div key={day.date} className={`goals-day ${day.achieved ? 'goal-met' : day.active ? 'is-active' : ''} ${day.today ? 'is-today' : ''}`}
          aria-label={`${day.label}, ${day.date}: ${day.future ? 'Belum tiba' : `${asMinutes(day.focusedMs)} menit fokus, ${day.achieved ? 'target tercapai' : day.active ? 'aktif' : 'belum aktif'}`}`}>
          <span>{day.label}</span><strong>{day.future ? '–' : day.achieved ? '✓' : day.active ? '•' : '—'}</strong>
          <small>{day.future ? 'Nanti' : day.achieved ? 'Tercapai' : day.active ? 'Aktif' : 'Kosong'}</small>
        </div>)}
      </div>
      <p className="goals-footnote">Streak menghitung hari dengan minimal satu sesi <strong>Focus</strong> selesai; tidak bergantung pada target menit. Hari kemarin tetap dihitung jika hari ini belum ada sesi. Waktu istirahat dan sesi terhenti tidak dihitung. Mengubah target akan menghitung ulang pencapaian minggu ini.</p>
    </div>
    {loading && <p className="activity-empty">Memuat data target dari riwayat...</p>}
  </section>;
}

