import type { Theme } from '../types.ts';
import Icon from './Icons.tsx';

interface Props { theme: Theme; onToggleTheme: () => void; }

export default function Header({ theme, onToggleTheme }: Props) {
  return <header className="site-header">
    <a className="brand" href="#beranda" aria-label="JustSimple — Beranda">
      <span className="brand-icon"><Icon name="stopwatch" /></span>
      <span className="brand-name">Just<span>Simple</span><small>TIME, REFINED. / V3</small></span>
    </a>
    <div className="header-actions">
      <span className="header-label"><span className="tiny-dot"/> FOCUS ON WHAT MATTERS</span>
      <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'} title="Ganti tema">
        <Icon name={theme === 'dark' ? 'moon' : 'sun'} />
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </div>
  </header>;
}
