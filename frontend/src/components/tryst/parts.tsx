import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Navigation, Star } from 'lucide-react';
import { TRYST } from '@/config/tryst';
import { todayHours } from '@/lib/tryst';
import { Reveal } from './Reveal';

/** Veg / non-veg marker. Always carries a text label (never colour alone). */
export function VegMark({ veg, label = true }: { veg: boolean; label?: boolean }) {
  const c = veg ? 'hsl(var(--veg))' : 'hsl(var(--nonveg))';
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1" y="1" width="14" height="14" fill="none" stroke={c} strokeWidth="1.5" />
        {veg ? <circle cx="8" cy="8" r="4" fill={c} /> : <path d="M8 4 L12 11.5 H4 Z" fill={c} />}
      </svg>
      {label && <span>{veg ? 'Veg' : 'Non-veg'}</span>}
    </span>
  );
}

/** Hanko seal: a circle-in-square stamp used for coins, checklist ticks and RSVPs. */
export function HankoStamp({ children, size = 56, press = false, className = '' }: { children?: ReactNode; size?: number; press?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center text-terra ${press ? 'stamp-press' : ''} ${className}`} style={{ width: size, height: size, transform: 'rotate(-3deg)' }} role="img" aria-label={typeof children === 'string' ? children : 'stamp'}>
      <svg width={size} height={size} viewBox="0 0 56 56" className="absolute" aria-hidden="true">
        <rect x="3" y="3" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="28" cy="28" r="19" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="relative font-display text-sm leading-none">{children}</span>
    </span>
  );
}

export function ChapterHead({ no, title, kicker, className = '' }: { no: string; title: string; kicker?: string; className?: string }) {
  return (
    <Reveal className={`mb-10 ${className}`}>
      <div className="flex items-end gap-4">
        <span className="chapter-no" aria-hidden="true">{no}</span>
        <span className="rule mb-3 flex-1" aria-hidden="true" />
      </div>
      {kicker && <p className="mt-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">{kicker}</p>}
      <h2 className="mt-2 max-w-[18ch] text-[clamp(30px,5vw,48px)]">{title}</h2>
    </Reveal>
  );
}

/** Two brush strokes slide in and meet in a hanko seal. Decorative; static under reduced motion. */
export function TwoStrokes({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 70" className={className} aria-hidden="true" fill="none">
      <path className="stroke-l" d="M4 42 C 40 20, 78 56, 118 34" stroke="hsl(var(--moss))" strokeWidth="9" strokeLinecap="round" />
      <path className="stroke-r" d="M236 28 C 196 52, 160 14, 122 38" stroke="hsl(var(--terra))" strokeWidth="9" strokeLinecap="round" />
      <g className="hanko-land" style={{ transformOrigin: '120px 36px' }}>
        <rect x="104" y="20" width="32" height="32" stroke="hsl(var(--terra))" strokeWidth="2.5" />
        <circle cx="120" cy="36" r="8" fill="hsl(var(--terra))" />
      </g>
    </svg>
  );
}

/** Full-width info band: the katta ledge where friends sit. */
export function KattaLedge() {
  const t = todayHours();
  return (
    <div className="ledge">
      <ul className="grid-wrap flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
        <li className="flex items-center gap-1.5"><Star size={16} aria-hidden="true" fill="currentColor" /> <span><b>{TRYST.rating}</b> on Google, {TRYST.reviewCount} reviews</span></li>
        <li>Open today {t.open} to {t.close}</li>
        <li>Veg and non-veg</li>
        <li>Outdoor seating</li>
        <li>Live music evenings</li>
      </ul>
    </div>
  );
}

export function SeatStrip({ left, capacity = 24 }: { left: number; capacity?: number }) {
  const n = 8;
  const filled = Math.max(0, Math.min(n, Math.round((left / capacity) * n)));
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={`h-2.5 w-2.5 border ${i < filled ? 'border-moss bg-moss dark:border-ember dark:bg-ember' : 'border-border'}`} />
      ))}
    </span>
  );
}

export function HistogramBars() {
  const total = Object.values(TRYST.histogram).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-2" role="img" aria-label={`Rating spread: ${[5, 4, 3, 2, 1].map((s) => `${s} star ${TRYST.histogram[s]}`).join(', ')}`}>
      {[5, 4, 3, 2, 1].map((s) => (
        <div key={s} className="flex items-center gap-3 text-sm">
          <span className="w-12">{s} star</span>
          <span className="h-2 flex-1 bg-white/15"><span className="block h-2 bg-ember" style={{ width: `${(TRYST.histogram[s] / total) * 100}%` }} /></span>
          <span className="w-10 text-right tabular-nums">{TRYST.histogram[s]}</span>
        </div>
      ))}
    </div>
  );
}

/** Mobile sticky bar with the two conversion actions. Not used on checkout or admin pages. */
export function StickyCta() {
  return (
    <>
      <div className="h-16 md:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden">
        <Link to="/reserve" className="flex min-h-[56px] flex-1 items-center justify-center bg-terra font-medium text-white">Find your table</Link>
        <Link to="/menu" className="flex min-h-[56px] flex-1 items-center justify-center font-medium">Order takeaway</Link>
      </div>
    </>
  );
}

export function ContactActions({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a className="btn-terra" href={TRYST.directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={18} aria-hidden="true" /> Directions</a>
      <a className="btn-ink" href={TRYST.phoneTel}><Phone size={18} aria-hidden="true" /> Call {TRYST.phoneDisplay}</a>
      <a className="btn-ink" href={TRYST.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>
    </div>
  );
}
