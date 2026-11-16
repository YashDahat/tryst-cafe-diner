import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import { useCard, useRsvp } from '@/hooks/trystHooks';
import { TRYST } from '@/config/tryst';
import { fmtDay, fmtTime, usePageMeta } from '@/lib/tryst';
import { HankoStamp } from '@/components/tryst/parts';

export default function TrystCardPage() {
  usePageMeta('You are invited | TRYST Cafe & Diner', 'A table is saved at TRYST on FC Road, Pune. Tap to say you are coming.');
  const { code = '' } = useParams();
  const { data, isLoading, isError } = useCard(code);
  const rsvp = useRsvp(code);
  const [name, setName] = useState('');
  const valid = name.trim().length > 0 && name.trim().length <= 30;

  if (isLoading) return <p className="grid-wrap py-16 text-muted-foreground">Opening the card...</p>;
  if (isError || !data) return <div className="grid-wrap py-16"><h1 className="text-4xl">We could not find that card.</h1><p className="mt-3">Check the link, or <Link className="underline" to="/reserve">save a table of your own</Link>.</p></div>;

  return (
    <div className="grid-wrap py-12">
      <article className="perforated mx-auto max-w-md border border-border bg-card px-8 py-10" aria-label="Tryst card">
        <p className="text-sm uppercase tracking-[0.2em] text-terra">A tryst is arranged</p>
        <h1 className="mt-3 text-4xl">{data.hostFirstName} saved a table at TRYST</h1>
        <dl className="mt-6 space-y-1 text-lg">
          <div className="flex gap-2"><dt className="w-24 text-muted-foreground">When</dt><dd>{fmtDay(data.startsAt)}, {fmtTime(data.startsAt)}</dd></div>
          <div className="flex gap-2"><dt className="w-24 text-muted-foreground">Party</dt><dd>{data.partySize}</dd></div>
          {data.occasion && <div className="flex gap-2"><dt className="w-24 text-muted-foreground">Occasion</dt><dd>{data.occasion}</dd></div>}
          <div className="flex gap-2"><dt className="w-24 text-muted-foreground">Where</dt><dd>Dnyaneshwar Paduka Chowk, FC Road</dd></div>
        </dl>
        <a className="btn-ink mt-6" href={TRYST.directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={18} aria-hidden="true" /> Get directions</a>

        {data.past ? (
          <p className="mt-8">This meet-up has happened. <Link className="underline" to="/reserve">Plan the next one?</Link></p>
        ) : (
          <form className="mt-8" onSubmit={(e) => { e.preventDefault(); if (valid) rsvp.mutate(name.trim(), { onSuccess: () => setName('') }); }}>
            <label htmlFor="rsvp-name" className="mb-2 block font-medium">Your first name</label>
            <div className="flex gap-2">
              <input id="rsvp-name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} className="min-h-[44px] flex-1 border border-input bg-background px-3" autoComplete="given-name" />
              <button type="submit" disabled={!valid || rsvp.isPending} className="btn-terra disabled:opacity-50">I am coming</button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Only your first name is shared with the group. No sign-in needed.</p>
          </form>
        )}

        {data.coming.length > 0 && (
          <section className="mt-8" aria-label="Who is coming">
            <h2 className="text-2xl">Coming</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {data.coming.map((n, i) => <li key={`${n}-${i}`}><HankoStamp size={64} press={i === data.coming.length - 1}>{n.slice(0, 6)}</HankoStamp></li>)}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
