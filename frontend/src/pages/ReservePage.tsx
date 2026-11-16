import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarPlus, Copy, MessageCircle, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAvailability, useBook } from '@/hooks/trystHooks';
import { loyaltyService } from '@/services/loyaltyService';
import type { BookingView } from '@/services/trystService';
import { TRYST } from '@/config/tryst';
import { downloadIcs, fmtDay, fmtTime, istDate, store, usePageMeta } from '@/lib/tryst';
import { HankoStamp, SeatStrip } from '@/components/tryst/parts';

const OCCASIONS = ['Catch-up', 'Birthday', 'Date', 'Team lunch', 'Other'];

function Success({ b }: { b: BookingView }) {
  const link = `${window.location.origin}/t/${b.shareCode}`;
  const text = `Meet me at TRYST on ${fmtDay(b.startsAt)} at ${fmtTime(b.startsAt)}. Say you are coming: ${link}`;
  const shared = () => { store.set('tryst.shared', '1'); loyaltyService.recordActivity({ type: 'SHARE_CLICK' }); };
  return (
    <div className="grid-wrap py-14" data-testid="booking-success">
      <div className="max-w-xl border border-border bg-card p-8">
        <HankoStamp size={72} press>Saved</HankoStamp>
        <h1 className="mt-4 text-4xl">Table saved.</h1>
        <p className="mt-2 text-lg">{fmtDay(b.startsAt)} at {fmtTime(b.startsAt)}, party of {b.partySize}{b.occasion ? `, ${b.occasion}` : ''}.</p>
        <p className="mt-4">Now send your friends the card: one link with the time and the way here. They tap "I am coming", no sign-in.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn-terra" onClick={shared} href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Share on WhatsApp</a>
          <button type="button" className="btn-ink" onClick={async () => { try { await navigator.clipboard.writeText(link); toast.success('Link copied'); shared(); } catch { toast.message(link); } }}><Copy size={18} aria-hidden="true" /> Copy link</button>
          <button type="button" className="btn-ink" onClick={() => downloadIcs(b.startsAt, b.partySize)}><CalendarPlus size={18} aria-hidden="true" /> Add to calendar</button>
          <a className="btn-ink" href={TRYST.directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={18} aria-hidden="true" /> Directions</a>
        </div>
        <p className="mt-6 text-sm">See live progress, change or cancel in <Link className="underline" to={`/orders/${b.orderId}`}>your booking</Link>. <Link className="underline" to="/account/hub">My account</Link> keeps every Tryst card. Need help? <Link className="underline" to="/support">Support</Link> or call <a className="underline" href={TRYST.phoneTel}>{TRYST.phoneDisplay}</a>.</p>
      </div>
    </div>
  );
}

export default function ReservePage() {
  usePageMeta('Reserve a table | TRYST Cafe & Diner, FC Road Pune', 'Save a table at TRYST on FC Road, Pune. See live seats per slot, pick indoor or outdoor, and send friends a Tryst card.');
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const book = useBook();
  const initialDate = params.get('date');
  const [date, setDate] = useState(initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : istDate(0));
  const [party, setParty] = useState(Math.min(10, Math.max(1, Number(params.get('party')) || 2)));
  const [slotId, setSlotId] = useState<number | null>(Number(params.get('slot')) || null);
  const [seating, setSeating] = useState('ANY');
  const [occasion, setOccasion] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState<BookingView | null>(null);
  const { data, isLoading, isError } = useAvailability(date, party);
  const days = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((o) => istDate(o)), []);
  const chosen = (data ?? []).find((s) => s.slotId === slotId);
  const noteTooLong = note.length > 200;
  const canSave = !!chosen && chosen.fits && !noteTooLong && !book.isPending;

  if (done) return <Success b={done} />;

  const confirm = async () => {
    if (!isAuthenticated) {
      const back = `${location.pathname}?date=${date}&party=${party}&slot=${slotId ?? ''}`;
      navigate(`/login?redirect=${encodeURIComponent(back)}`);
      return;
    }
    if (!slotId) return;
    const res = await book.mutateAsync({ slotId, partySize: party, seating, occasion: occasion || undefined, note: note.trim() || undefined });
    setDone(res);
  };

  return (
    <div className="grid-wrap py-10">
      <h1 className="text-[clamp(40px,7vw,72px)]">Save the katta.</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">Pick a day, your party size and a time. The seat strip shows how many seats are left right now. No charge to save a table.</p>

      {(noteTooLong || isError) && <div role="alert" className="mt-6 border border-destructive bg-card p-3 text-destructive">{noteTooLong ? 'Keep the note under 200 characters.' : 'We could not load times. Please try again or call us.'}</div>}

      <div className="mt-8 grid gap-10 md:grid-cols-12">
        <div className="space-y-8 md:col-span-7">
          <fieldset>
            <legend className="mb-2 font-medium">1. Day</legend>
            <div className="flex flex-wrap gap-2">
              {days.map((d, i) => (
                <button key={d} type="button" aria-pressed={date === d} onClick={() => { setDate(d); setSlotId(null); }} className={`min-h-[44px] rounded-full border px-4 text-sm ${date === d ? 'border-moss bg-moss text-white' : 'border-border'}`}>{i === 0 ? 'Today' : fmtDay(`${d}T12:00:00+05:30`)}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-medium">2. Guests</legend>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Fewer guests" className="h-11 w-11 border border-border" onClick={() => { setParty((p) => Math.max(1, p - 1)); setSlotId(null); }}>-</button>
              <output className="w-8 text-center text-xl tabular-nums">{party}</output>
              <button type="button" aria-label="More guests" className="h-11 w-11 border border-border" onClick={() => { setParty((p) => Math.min(10, p + 1)); setSlotId(null); }}>+</button>
              <span className="text-sm text-muted-foreground">Bigger group? <a className="underline" href={TRYST.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.</span>
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-medium">3. Time</legend>
            {isLoading && <p className="text-muted-foreground">Checking seats...</p>}
            {!isLoading && (data ?? []).length === 0 && <p>No more times today. Pick another day.</p>}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-live="polite">
              {(data ?? []).map((s) => (
                <li key={s.slotId}>
                  <button type="button" disabled={!s.fits} aria-pressed={slotId === s.slotId} onClick={() => setSlotId(s.slotId)} className={`block min-h-[44px] w-full border p-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${slotId === s.slotId ? 'border-terra ring-2 ring-terra' : 'border-border'}`}>
                    <span className="block font-medium">{fmtTime(s.startsAt)}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground"><SeatStrip left={s.left} />{s.fits ? `${s.left} seats left` : s.left > 0 ? `Only ${s.left} left` : 'Full'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>

        <div className="space-y-6 md:col-span-5">
          <fieldset>
            <legend className="mb-2 font-medium">4. Seating</legend>
            <div className="flex gap-2">
              {[['ANY', 'No preference'], ['INDOOR', 'Indoor'], ['OUTDOOR', 'Outdoor']].map(([v, l]) => (
                <button key={v} type="button" aria-pressed={seating === v} onClick={() => setSeating(v)} className={`min-h-[44px] flex-1 border px-3 text-sm ${seating === v ? 'border-moss bg-moss text-white' : 'border-border'}`}>{l}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Indoor or outdoor is a request; we confirm on the day.</p>
          </fieldset>
          <div>
            <label htmlFor="occ" className="mb-2 block font-medium">Occasion (optional)</label>
            <select id="occ" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="min-h-[44px] w-full border border-input bg-card px-3">
              <option value="">None</option>
              {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="note" className="mb-2 block font-medium">Anything we should know? (optional)</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} aria-invalid={noteTooLong} className={`w-full border bg-card p-3 ${noteTooLong ? 'border-destructive' : 'border-input'}`} />
            <p className="text-xs text-muted-foreground">{note.length}/200</p>
          </div>
          <div className="border-t border-border pt-4">
            {chosen && <p className="mb-3">{fmtDay(chosen.startsAt)}, {fmtTime(chosen.startsAt)}, {party} {party === 1 ? 'guest' : 'guests'}</p>}
            <button type="button" disabled={!canSave} onClick={confirm} className="btn-terra w-full disabled:cursor-not-allowed disabled:opacity-50">{isAuthenticated ? 'Save my table' : 'Sign in to save my table'}</button>
            <p className="mt-3 text-xs text-muted-foreground">Free to save. Running late or need to change? Call <a className="underline" href={TRYST.phoneTel}>{TRYST.phoneDisplay}</a> or write from <Link className="underline" to="/support">Support</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
