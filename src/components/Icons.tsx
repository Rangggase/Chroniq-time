import type { SVGProps } from 'react';

type IconName = 'stopwatch' | 'sun' | 'moon' | 'play' | 'pause' | 'flag' | 'reset' | 'chart' | 'export' | 'trash' | 'keyboard' | 'focus' | 'hourglass' | 'check' | 'sparkles';

export default function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const, ...props };
  switch (name) {
    case 'stopwatch': return <svg {...base}><circle cx="12" cy="13" r="8.5"/><path d="M12 4V1.5M8.5 1.5h7M18.4 6.4l2.1-2.1M12 8v5l3.2 2"/></svg>;
    case 'sun': return <svg {...base}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>;
    case 'moon': return <svg {...base}><path d="M20.5 13.4A8.5 8.5 0 0 1 10.6 3.5 8.5 8.5 0 1 0 20.5 13.4Z"/></svg>;
    case 'play': return <svg {...base} fill="currentColor" stroke="none"><path d="m8 5 11 7-11 7V5Z"/></svg>;
    case 'pause': return <svg {...base} fill="currentColor" stroke="none"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>;
    case 'flag': return <svg {...base}><path d="M6 3v18M6 5h12l-3.5 4L18 13H6"/></svg>;
    case 'reset': return <svg {...base}><path d="M3.5 11a8.5 8.5 0 1 1 2.5 6M3.5 5v6h6"/></svg>;
    case 'chart': return <svg {...base}><path d="M4 18v-7m5 7V5m5 13v-8m5 8V7"/></svg>;
    case 'export': return <svg {...base}><path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3"/></svg>;
    case 'trash': return <svg {...base}><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>;
    case 'keyboard': return <svg {...base}><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8"/></svg>;
    case 'focus': return <svg {...base}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/></svg>;
    case 'hourglass': return <svg {...base}><path d="M6 3h12M6 21h12M7 3c0 5 2 6 5 9-3 3-5 4-5 9m10-18c0 5-2 6-5 9 3 3 5 4 5 9"/></svg>;
    case 'check': return <svg {...base}><path d="m4 12 5 5L20 6"/></svg>;
    case 'sparkles': return <svg {...base}><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2ZM19 16l.75 2.25L22 19l-2.25.75L19 22l-.75-2.25L16 19l2.25-.75L19 16Z"/></svg>;
  }
}
