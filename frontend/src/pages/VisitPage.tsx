import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TRYST } from '@/config/tryst';
import { todayHours, usePageMeta, cafeJsonLd } from '@/lib/tryst';
import { ContactActions, StickyCta } from '@/components/tryst/parts';

export default function VisitPage() {
  usePageMeta('Visit TRYST | Dnyaneshwar Paduka Chowk, FC Road Pune', 'Address, hours, directions and contact for TRYST Cafe & Diner on Fergusson College Road, Pune.', cafeJsonLd);
  const [showMap, setShowMap] = useState(false);
  const t = todayHours();
  return (
    <div className="grid-wrap py-10">
      <h1 className="text-[clamp(40px,7vw,72px)]">Find us at Paduka Chowk.</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <address className="not-italic">{TRYST.address}</address>
          <p className="mt-3 text-sm text-muted-foreground">No parking on site. FC Road is easiest by auto or on foot. The cafe is wheelchair accessible.</p>
          <ContactActions className="mt-6" />
          <h2 className="mt-10 text-3xl">Hours</h2>
          <table className="mt-3 w-full text-left">
            <caption className="sr-only">Opening hours</caption>
            <tbody>
              {TRYST.hours.slice(1).concat(TRYST.hours[0]).map((h) => (
                <tr key={h.day} className={`border-b border-border ${h.day === t.day ? 'font-bold text-terra' : ''}`}>
                  <th scope="row" className="py-2 font-[inherit]">{h.day}{h.day === t.day ? ' (today)' : ''}</th>
                  <td className="py-2">{h.open} to {h.close}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="mt-10 text-3xl">Need help?</h2>
          <p className="mt-2">Write to us from <Link className="underline underline-offset-4" to="/support">Support</Link>. We reply in the same thread, usually the same day, and you can add photos. For anything urgent today, call us. You can also <Link className="underline underline-offset-4" to="/ideas">suggest an idea</Link>.</p>
        </div>
        <div className="md:col-span-7">
          {showMap ? (
            <iframe title="Map to TRYST Cafe & Diner" src={TRYST.mapEmbed} loading="lazy" className="aspect-[4/3] w-full border border-border" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <button type="button" onClick={() => setShowMap(true)} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border border-border bg-secondary">
              <span className="font-display text-3xl">Show the map</span>
              <span className="text-sm text-muted-foreground">Loads only when you tap, to save your data.</span>
            </button>
          )}
        </div>
      </div>
      <StickyCta />
    </div>
  );
}
