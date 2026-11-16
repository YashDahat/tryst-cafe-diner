import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/cart';
import { useProducts } from '@/hooks/productHooks';
import { useLoyaltyMe } from '@/hooks/loyaltyHooks';
import { useAvailability, useCombos, useEarnRules } from '@/hooks/trystHooks';
import { TRYST } from '@/config/tryst';
import { cafeJsonLd, fmtTime, inr, istDate, todayHours, usePageMeta } from '@/lib/tryst';
import { Reveal } from '@/components/tryst/Reveal';
import { ChapterHead, ContactActions, HankoStamp, HistogramBars, KattaLedge, SeatStrip, StickyCta, TwoStrokes, VegMark } from '@/components/tryst/parts';
import type { ProductDto } from '@/types/product';

const isVeg = (p: ProductDto) => !(p.features ?? []).includes('non-veg');

function WelcomeBack() {
  const { data } = useLoyaltyMe();
  return (
    <p className="mt-6 max-w-[46ch] border-l-2 border-terra pl-4" data-testid="welcome-back">
      Welcome back{data ? `. You have ${data.coinBalance} coins.` : '.'}{' '}
      <Link className="font-medium underline underline-offset-4" to="/account/hub">My account</Link>. Next up: <Link className="font-medium underline underline-offset-4" to="/reserve">save a table</Link> or <Link className="font-medium underline underline-offset-4" to="/menu">reorder from the menu</Link>.
    </p>
  );
}

function PlanATryst() {
  const [offset, setOffset] = useState(0);
  const [party, setParty] = useState(2);
  const date = istDate(offset);
  const { data, isLoading } = useAvailability(date, party);
  const slots = (data ?? []).filter((s) => s.fits).slice(0, 4);
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pick a day">
        {[0, 1, 2, 3, 4, 5, 6].map((o) => {
          const d = new Date(Date.now() + o * 86400000);
          const label = o === 0 ? 'Today' : new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric' }).format(d);
          return <button key={o} type="button" aria-pressed={offset === o} onClick={() => setOffset(o)} className={`min-h-[44px] rounded-full border px-4 text-sm ${offset === o ? 'border-moss bg-moss text-white' : 'border-border'}`}>{label}</button>;
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span id="party-lbl">Guests</span>
        <button type="button" aria-label="Fewer guests" className="h-11 w-11 border border-border" onClick={() => setParty((p) => Math.max(1, p - 1))}>-</button>
        <output aria-labelledby="party-lbl" className="w-6 text-center tabular-nums">{party}</output>
        <button type="button" aria-label="More guests" className="h-11 w-11 border border-border" onClick={() => setParty((p) => Math.min(10, p + 1))}>+</button>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3" aria-live="polite">
        {isLoading && <li className="col-span-2 text-sm text-muted-foreground">Checking seats...</li>}
        {!isLoading && slots.length === 0 && <li className="col-span-2 text-sm text-muted-foreground">No seats left for that day. Try another day or call us.</li>}
        {slots.map((s) => (
          <li key={s.slotId}>
            <Link to={`/reserve?date=${date}&party=${party}&slot=${s.slotId}`} className="block min-h-[44px] border border-border p-3 hover:border-terra">
              <span className="block font-medium">{fmtTime(s.startsAt)}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground"><SeatStrip left={s.left} /> {s.left} seats left</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/reserve" className="mt-5 inline-block font-medium underline underline-offset-4">See every time</Link>
    </div>
  );
}

export default function HomePage() {
  usePageMeta('TRYST Cafe & Diner | Cafe on FC Road, Pune', 'Ramen, pasta, pizza and iced tea at Dnyaneshwar Paduka Chowk on FC Road, Pune. Save a table with live seats, order takeaway, and send friends a Tryst card.', cafeJsonLd);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { data: products } = useProducts();
  const { data: combos } = useCombos();
  const { data: rules } = useEarnRules();
  const [photoOk, setPhotoOk] = useState(true);
  const t = todayHours();
  const signature = (products ?? []).filter((p) => (p.features ?? []).includes('signature')).slice(0, 3);

  const add = (p: { id: number; name: string; price: number; imageUrl?: string | null }) => {
    addItem({ id: `PRODUCT:${p.id}`, name: p.name, unitPrice: p.price, imageUrl: p.imageUrl, metadata: { itemType: 'PRODUCT', itemId: p.id } });
    toast.success('Added to cart');
  };

  return (
    <div>
      {/* 00 Hero: offset collage + katta ledge */}
      <section className="grid-wrap pb-16 pt-10 md:pt-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5 md:translate-y-12">
            {photoOk ? (
              <img src={TRYST.photo} alt="TRYST Cafe & Diner" width={408} height={506} loading="eager" onError={() => setPhotoOk(false)} className="aspect-[4/5] w-full max-w-sm object-cover md:max-w-none" />
            ) : (
              <div className="flex aspect-[4/5] w-full max-w-sm items-center justify-center border border-border bg-secondary md:max-w-none"><HankoStamp size={96}>TRYST</HankoStamp></div>
            )}
          </div>
          <div className="md:col-span-7 md:pl-6">
            <TwoStrokes className="mb-4 h-14 w-48" />
            <h1 className="text-[clamp(44px,9vw,96px)]">Meet me at TRYST.</h1>
            <p className="mt-2 font-display text-3xl text-terra" lang="mr">भेटूया?</p>
            {isAuthenticated ? <WelcomeBack /> : (
              <p className="mt-6 max-w-[46ch] text-lg">A little escape on FC Road: slow ramen, bright pastas, iced tea done right, and a table saved for you and your people.</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/reserve" className="btn-terra">Find your table</Link>
              <Link to="/menu" className="btn-ink">Taste at home</Link>
            </div>
            {!isAuthenticated && (
              <p className="mt-5 max-w-[46ch] text-sm text-muted-foreground">Browse as long as you like. <Link className="underline underline-offset-4" to="/signup">Join free</Link> for coins on every order and all your Tryst cards in one place.</p>
            )}
          </div>
        </div>
      </section>
      <div className="md:mt-12"><KattaLedge /></div>

      {/* 01 Who we are */}
      <section className="ma grid-wrap">
        <ChapterHead no="01" title="A place made for meeting." kicker="Who we are" />
        <Reveal className="grid gap-8 md:grid-cols-12">
          <p className="max-w-[60ch] text-lg md:col-span-7 md:col-start-2">Tryst means a meeting you have arranged. Ours happens at Dnyaneshwar Paduka Chowk on Fergusson College Road, where Pune has always met its friends: between lectures, after work, before the music starts. Inside, and out on the terrace seats, we keep it simple: good food, quick hands, and staff who check that your plate is just right.</p>
        </Reveal>
      </section>

      {/* 02 What we make */}
      <section className="ma grid-wrap rule">
        <ChapterHead no="02" title="The bowls people come back for." kicker="What we make" />
        <div className="grid gap-8 md:grid-cols-12">
          {signature.map((p, i) => (
            <Reveal key={p.id} delay={i * 80} className={i === 0 ? 'md:col-span-6' : i === 1 ? 'md:col-span-4 md:col-start-8 md:mt-16' : 'md:col-span-4 md:col-start-3'}>
              <article className="border border-border bg-card p-6">
                <VegMark veg={isVeg(p)} />
                <h3 className="mt-3 text-3xl">{p.name}</h3>
                <p className="mt-2 text-muted-foreground">{p.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-medium tabular-nums">{inr(p.price)}</span>
                  <button type="button" onClick={() => add(p)} className="btn-ink">Add</button>
                </div>
              </article>
            </Reveal>
          ))}
          {signature.length === 0 && <p className="text-muted-foreground md:col-span-12">Our menu is on its way. <Link className="underline" to="/menu">See the menu</Link>.</p>}
        </div>
        <Link to="/menu" className="mt-10 inline-block font-medium underline underline-offset-4">See the full menu</Link>
        <p className="mt-2 text-sm text-muted-foreground">Prices shown are being confirmed with the kitchen.</p>
      </section>

      {/* 03 Why people return */}
      <section className="on-night ma">
        <div className="grid-wrap">
          <ChapterHead no="03" title="In their words." kicker="Why people return" />
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-display text-6xl">{TRYST.rating}<span className="ml-2 text-xl text-[#B9B4A6]">from {TRYST.reviewCount} Google reviews</span></p>
              <div className="mt-6"><HistogramBars /></div>
              <a className="mt-6 inline-block underline underline-offset-4" href={TRYST.mapsUrl} target="_blank" rel="noopener noreferrer">Read them all on Google</a>
            </div>
            <ul className="space-y-8 md:col-span-6 md:col-start-7">
              {TRYST.reviews.map((r) => (
                <Reveal as="li" key={r.name}><blockquote className="border-l-2 border-ember pl-4"><p>{r.text}</p><footer className="mt-2 text-sm text-[#B9B4A6]">{r.name}, {r.stars} stars, Google review</footer></blockquote></Reveal>
              ))}
            </ul>
          </div>
          <p className="mt-10 text-sm text-[#B9B4A6]">Reviews here are from Google, unedited and not filtered by rating.</p>
        </div>
      </section>

      {/* 04 Plan a tryst */}
      <section className="ma grid-wrap">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <ChapterHead no="04" title="Save the katta." kicker="Plan a tryst" />
            <p className="max-w-[40ch]">Book, then send your friends one link with the time, the table and the way here. They tap "I am coming", no sign-in needed.</p>
          </div>
          <div className="md:col-span-6 md:col-start-7"><PlanATryst /></div>
        </div>
      </section>

      {/* 05 In-between hours */}
      <section className="ma grid-wrap rule">
        <ChapterHead no="05" title="Between lectures. Between meetings." kicker="For the in-between hours" />
        <div className="grid gap-6 md:grid-cols-2">
          {(combos ?? []).map((c) => (
            <Reveal key={c.id}>
              <article className="border border-border bg-card p-6">
                <p className="text-sm uppercase tracking-widest text-terra">{c.audience}</p>
                <h3 className="mt-2 text-3xl">{c.name.replace(' combo', '')}</h3>
                <p className="mt-2 text-muted-foreground">{c.days.replace('-', ' to ')}, {c.availableFrom} to {c.availableTo}</p>
                <p className="mt-4 text-xl tabular-nums">{inr(c.price)}</p>
                {c.availableNow ? (
                  <button type="button" className="btn-terra mt-4" onClick={() => add({ id: c.productId, name: c.name, price: c.price })}>Pre-order for pickup</button>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Back {c.days.replace('-', ' to ')} at {c.availableFrom}. Check the menu for everything else.</p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 06 Join and earn */}
      <section className="ma grid-wrap rule">
        <ChapterHead no="06" title="Coins for showing up." kicker="Join and earn" />
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(rules ?? []).map((r) => (
            <li key={r.eventType} className="flex items-center gap-4 border border-border bg-card p-4">
              <HankoStamp size={52}>{r.eventType === 'PURCHASE' ? '%' : String(r.coins)}</HankoStamp>
              <span><span className="block font-medium">{r.label}</span><span className="text-sm text-muted-foreground">{r.eventType === 'PURCHASE' ? 'Coins on every order' : `${r.coins} coins${r.onceOnly ? ', once' : r.perDayCap ? `, up to ${r.perDayCap} a day` : ''}`}</span></span>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[60ch] text-sm text-muted-foreground">Coins are for submitting, whatever you say. Reviews are rewarded whatever the rating. See the <Link className="underline" to="/loyalty-terms">loyalty terms</Link>.</p>
        <div className="mt-6">{isAuthenticated ? <Link to="/account/hub" className="btn-ink">Open your checklist</Link> : <Link to="/signup" className="btn-terra">Join free</Link>}</div>
      </section>

      {/* 07 Visit */}
      <section className="on-night ma">
        <div className="grid-wrap">
          <ChapterHead no="07" title="Find us at Paduka Chowk." kicker="Visit" />
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <p>{TRYST.address}</p>
              <p className="mt-3">Today: {t.open} to {t.close}</p>
              <p className="mt-3 text-sm text-[#B9B4A6]">No parking on site. FC Road is easiest by auto or on foot.</p>
              <ContactActions className="mt-6" />
            </div>
            <p className="md:col-span-5 md:col-start-8">Want to talk to us first? Write from <Link className="underline underline-offset-4" to="/support">Support</Link> and we reply in the same thread, usually the same day. For anything urgent today, call.</p>
          </div>
        </div>
      </section>
      <StickyCta />
    </div>
  );
}
