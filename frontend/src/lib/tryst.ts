import { useEffect } from 'react';
import { TRYST } from '@/config/tryst';

/** Indian rupee grouping, e.g. 125000 -> ₹1,25,000. */
export const inr = (n: number) => '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const IST = 'Asia/Kolkata';
export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: IST, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));
export const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: IST, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));

/** Date in IST as YYYY-MM-DD, offset by n days from today. */
export function istDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(d);
}

export function todayHours() {
  const dow = new Date(new Date().toLocaleString('en-US', { timeZone: IST })).getDay();
  return { index: dow, ...TRYST.hours[dow] };
}

/** Safe localStorage helpers (storage can be blocked). */
export const store = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
};

export const favourites = {
  all(): number[] {
    try { return JSON.parse(store.get('tryst.favs') ?? '[]') as number[]; } catch { return []; }
  },
  toggle(id: number): number[] {
    const cur = favourites.all();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    store.set('tryst.favs', JSON.stringify(next));
    return next;
  },
};

/** Sets the page title, description and optional JSON-LD for SEO. */
export function usePageMeta(title: string, description: string, jsonLd?: object) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => { script?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);
}

export const cafeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  name: TRYST.name,
  telephone: '+919822523069',
  servesCuisine: ['Cafe', 'Italian', 'Continental', 'Pasta', 'Desserts'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Dnyaneshwar Paduka Chowk, Ferguson College Rd, Sud Nagar, Shivajinagar',
    addressLocality: 'Pune', addressRegion: 'Maharashtra', postalCode: '411005', addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: TRYST.lat, longitude: TRYST.lng },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: TRYST.rating, reviewCount: TRYST.reviewCount },
};

export function downloadIcs(startIso: string, party: number) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + 90 * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TRYST//EN', 'BEGIN:VEVENT', `UID:${f(start)}-tryst@tryst`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:Table at TRYST (${party})`, `LOCATION:${TRYST.address.replace(/,/g, '\\,')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'tryst-table.ics'; a.click();
  URL.revokeObjectURL(url);
}
