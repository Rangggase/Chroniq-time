import { useEffect, useState } from 'react';
import type { AppMode } from './types.ts';
import { useTheme } from './hooks/useTheme.ts';
import { useStopwatch } from './hooks/useStopwatch.ts';
import { useCountdown } from './hooks/useCountdown.ts';
import { useFocusTimer } from './hooks/useFocusTimer.ts';
import { downloadLaps } from './lib/download.ts';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import ModeSwitcher from './components/ModeSwitcher.tsx';
import StopwatchPanel from './components/StopwatchPanel.tsx';
import SessionStats from './components/SessionStats.tsx';
import LapHistory from './components/LapHistory.tsx';
import FocusPanel from './components/FocusPanel.tsx';
import CountdownPanel from './components/CountdownPanel.tsx';
import Icon from './components/Icons.tsx';

export default function App() {
  const [mode, setMode] = useState<AppMode>('stopwatch');
  const { theme, toggleTheme } = useTheme();
  const stopwatch = useStopwatch();
  const focus = useFocusTimer();
  const countdown = useCountdown(5 * 60_000);
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const chooseCountdown = (value: number) => {
    if (!Number.isInteger(value) || value < 1 || value > 180) return;
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
            <StopwatchPanel state={stopwatch.state} elapsedMs={stopwatch.elapsedMs} onToggle={stopwatch.toggle} onLap={stopwatch.lap} onReset={stopwatch.reset}/>
            <SessionStats stats={stopwatch.stats} currentLapMs={stopwatch.currentLapMs}/>
          </div>
          <LapHistory laps={stopwatch.state.laps} onClear={stopwatch.clearLaps} onExport={() => downloadLaps(stopwatch.state.laps)}/>
          <div className="shortcuts-bar"><div className="shortcuts-title"><Icon name="keyboard"/>Keyboard shortcuts</div><div className="shortcuts-items"><span><kbd>Space</kbd> Mulai / Jeda</span><span><kbd>L</kbd> Catat lap</span><span><kbd>Shift</kbd> + <kbd>R</kbd> Reset</span></div></div>
        </div>}
        {mode === 'focus' && <FocusPanel focus={focus} />}
        {mode === 'countdown' && <CountdownPanel timer={countdown} minutes={countdownMinutes} onChangeMinutes={setCountdownMinutes} onChoose={chooseCountdown} />}
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} JustSimple <span className="footer-separator">/</span> Built with React + TypeScript.</span><span>Minimal by design. Precise by nature.</span></footer>
    </div>
  </>;
}
