import type { AppMode } from '../types.ts';
import Icon from './Icons.tsx';

interface Props { mode: AppMode; onChange: (mode: AppMode) => void; }
const modes = [
  { id: 'stopwatch', label: 'Stopwatch', icon: 'stopwatch' },
  { id: 'focus', label: 'Focus / Pomodoro', icon: 'focus' },
  { id: 'countdown', label: 'Countdown', icon: 'hourglass' },
] as const;

export default function ModeSwitcher({ mode, onChange }: Props) {
  return <div className="mode-switch" role="tablist" aria-label="Pilih alat pengukur waktu">
    {modes.map(item => <button key={item.id} type="button" role="tab" id={`tab-${item.id}`} aria-controls={`panel-${item.id}`} aria-selected={mode === item.id} className={`mode-tab${mode === item.id ? ' active' : ''}`} onClick={() => onChange(item.id)}>
      <Icon name={item.icon}/><span>{item.label}</span>
    </button>)}
  </div>;
}
