import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppMode } from './types.ts';
import type { ActivityDraft } from './lib/activity.ts';
import { useTheme } from './hooks/useTheme.ts';
import { useStopwatch } from './hooks/useStopwatch.ts';
import { useCountdown } from './hooks/useCountdown.ts';
import { presets, useFocusTimer, type FocusPreset } from './hooks/useFocusTimer.ts';
import { useActivityHistory } from './hooks/useActivityHistory.ts';
import { downloadLaps } from './lib/download.ts';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import ModeSwitcher from './components/ModeSwitcher.tsx';
import StopwatchPanel from './components/StopwatchPanel.tsx';
import SessionStats from './components/SessionStats.tsx';
import LapHistory from './components/LapHistory.tsx';
import FocusPanel from './components/FocusPanel.tsx';
import CountdownPanel from './components/CountdownPanel.tsx';
import ActivityHistory from './components/ActivityHistory.tsx';
import ProductivityAnalytics from './components/ProductivityAnalytics.tsx';
import GoalsInsights from './components/GoalsInsights.tsx';
import Icon from './components/Icons.tsx';

function startedAtForTimer(startedAt: string | null, durationMs: number, endEpoch: number) {
  return startedAt ?? new Date(endEpoch - durationMs).toISOString();
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('stopwatch');
  const { theme, toggleTheme } = useTheme();
  const activity = useActivityHistory();
  const stopwatch = useStopwatch();
  const [savingStopwatch, setSavingStopwatch] = useState(false);

  const focusStartedAt = useRef<string | null>(null);
  const countdownStartedAt = useRef<string | null>(null);

  const onFocusComplete = useCallback((preset: FocusPreset, durationMs: number) => {
    const ended = Date.now();
    const draft: ActivityDraft = {
      kind: 'focus', status: 'completed', title: `${presets[preset].label} (${presets[preset].minutes} menit)`,
      startedAt: startedAtForTimer(focusStartedAt.current, durationMs, ended),
      endedAt: new Date(ended).toISOString(), durationMs, plannedMs: durationMs, lapCount: null, preset,
    };
    focusStartedAt.current = null;
    void activity.record(draft);
  }, [activity.record]);
  const focus = useFocusTimer(onFocusComplete);

  const onCountdownComplete = useCallback(() => {
    const ended = Date.now();
    const durationMs = countdownDurationRef.current;
    const draft: ActivityDraft = {
      kind: 'countdown', status: 'completed', title: `Countdown (${Math.round(durationMs / 60_000)} menit)`,
      startedAt: startedAtForTimer(countdownStartedAt.current, durationMs, ended),
      endedAt: new Date(ended).toISOString(), durationMs, plannedMs: durationMs, lapCount: null, preset: null,
    };
    countdownStartedAt.current = null;
    void activity.record(draft);
  }, [activity.record]);

  const countdown = useCountdown(5 * 60_000, onCountdownComplete);
  const countdownDurationRef = useRef(countdown.durationMs);
  countdownDurationRef.current = countdown.durationMs;
  const [countdownMinutes, setCountdownMinutes] = useState(5);

  const saveStopwatch = useCallback(async () => {
    if (savingStopwatch || stopwatch.elapsedMs <= 0) return;
    const ended = Date.now();
    const draft: ActivityDraft = {
      kind: 'stopwatch', status: 'completed', title: `Stopwatch (${stopwatch.state.laps.length} lap)`,
      // Existing v3.0 sessions have no initial start timestamp; use active duration as fallback.
      startedAt: new Date(stopwatch.state.sessionStartedAtEpoch ?? (ended - stopwatch.elapsedMs)).toISOString(),
      endedAt: new Date(ended).toISOString(), durationMs: stopwatch.elapsedMs,
      plannedMs: null, lapCount: stopwatch.state.laps.length, preset: null,
    };
    setSavingStopwatch(true);
    try {
      if (await activity.record(draft)) stopwatch.reset();
    } finally { setSavingStopwatch(false); }
  }, [activity.record, savingStopwatch, stopwatch]);

  const handleFocusToggle = () => {
    if (!focus.running && focus.remainingMs >= focus.durationMs) focusStartedAt.current = new Date().toISOString();
    focus.toggle();
  };
  const archiveInterruptedFocus = () => {
    const activeMs = focus.durationMs - focus.remainingMs;
    if (focusStartedAt.current && activeMs >= 1_000) {
      const now = Date.now();
      void activity.record({
        kind: 'focus', status: 'interrupted', title: `${presets[focus.preset].label} (dihentikan)`,
        startedAt: focusStartedAt.current, endedAt: new Date(now).toISOString(),
        durationMs: activeMs, plannedMs: focus.durationMs, lapCount: null, preset: focus.preset,
      });
    }
    focusStartedAt.current = null;
  };
  const handleFocusReset = () => { archiveInterruptedFocus(); focus.reset(); };
  const handleFocusChoose = (value: FocusPreset) => { archiveInterruptedFocus(); focus.choose(value); };

  const handleCountdownToggle = () => {
    if (!countdown.running && countdown.remainingMs >= countdown.durationMs) countdownStartedAt.current = new Date().toISOString();
    countdown.toggle();
  };
  const archiveInterruptedCountdown = () => {
    const activeMs = countdown.durationMs - countdown.remainingMs;
    if (countdownStartedAt.current && activeMs >= 1_000) {
      void activity.record({
        kind: 'countdown', status: 'interrupted', title: 'Countdown (dihentikan)',
        startedAt: countdownStartedAt.current, endedAt: new Date().toISOString(),
        durationMs: activeMs, plannedMs: countdown.durationMs, lapCount: null, preset: null,
      });
    }
    countdownStartedAt.current = null;
  };
  const handleCountdownReset = () => { archiveInterruptedCountdown(); countdown.reset(); };
  const chooseCountdown = (value: number) => {
    if (!Number.isInteger(value) || value < 1 || value > 180) return;
    archiveInterruptedCountdown();
    setCountdownMinutes(value);
    countdown.configure(value * 60_000);
  };

  const { toggle, lap, reset } = stopwatch;
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (mode !== 'stopwatch' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))) return;
      if (event.code === 'Space' && !event.shiftKey) { event.preventDefault(); toggle(); }
      else if (event.key.toLowerCase() === 'l' && !event.shiftKey) { lap(); }
      else if (event.key.toLowerCase() === 'r' && event.shiftKey) { reset(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, toggle, lap, reset]);

  return <>
    <div className="ambient ambient-one" aria-hidden="true"/><div className="ambient ambient-two" aria-hidden="true"/>
    <div className="page-shell">
      <Header theme={theme} onToggleTheme={toggleTheme}/>
      <main>
        <Hero />
        <ModeSwitcher mode={mode} onChange={setMode}/>
        {mode === 'stopwatch' && <div role="tabpanel" id="panel-stopwatch" aria-labelledby="tab-stopwatch">
          <div className="dashboard-grid">
            <StopwatchPanel state={stopwatch.state} elapsedMs={stopwatch.elapsedMs} onToggle={stopwatch.toggle} onLap={stopwatch.lap} onReset={stopwatch.reset} onSave={() => { void saveStopwatch(); }} saving={savingStopwatch}/>
            <SessionStats stats={stopwatch.stats} currentLapMs={stopwatch.currentLapMs}/>
          </div>
          <LapHistory laps={stopwatch.state.laps} onClear={stopwatch.clearLaps} onExport={() => downloadLaps(stopwatch.state.laps)}/>
          <div className="shortcuts-bar"><div className="shortcuts-title"><Icon name="keyboard"/>Keyboard shortcuts</div><div className="shortcuts-items"><span><kbd>Space</kbd> Mulai / Jeda</span><span><kbd>L</kbd> Catat lap</span><span><kbd>Shift</kbd> + <kbd>R</kbd> Reset</span></div></div>
        </div>}
        {mode === 'focus' && <FocusPanel focus={focus} onToggle={handleFocusToggle} onReset={handleFocusReset} onChoose={handleFocusChoose} />}
        {mode === 'countdown' && <CountdownPanel timer={countdown} minutes={countdownMinutes} onChangeMinutes={setCountdownMinutes} onChoose={chooseCountdown} onToggle={handleCountdownToggle} onReset={handleCountdownReset} />}
        <ActivityHistory records={activity.records} loading={activity.loading} error={activity.error} onRemove={activity.remove} onClear={activity.clear} />
        <ProductivityAnalytics records={activity.records} loading={activity.loading} error={activity.error} />
        <GoalsInsights records={activity.records} loading={activity.loading} error={activity.error} />
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} Chroniq <span className="footer-separator">/</span> Built with React + TypeScript.</span><span>Minimal by design. Precise by nature.</span></footer>
    </div>
  </>;
}
