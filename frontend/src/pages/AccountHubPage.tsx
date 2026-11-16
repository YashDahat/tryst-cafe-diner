import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/cart';
import { useMyOrders } from '@/hooks/orderHooks';
import { useProducts } from '@/hooks/productHooks';
import { useLoyaltyMe } from '@/hooks/loyaltyHooks';
import { useEarnRules, useMyBookings, useMyIdeas } from '@/hooks/trystHooks';
import { favourites, fmtDay, fmtTime, inr, store, usePageMeta } from '@/lib/tryst';
import { HankoStamp } from '@/components/tryst/parts';

export default function AccountHubPage() {
  usePageMeta('My account | TRYST Cafe & Diner', 'Your tables, orders, ideas, coins and checklist at TRYST.');
  const { addItem } = useCart();
  const { data: me } = useLoyaltyMe();
  const { data: orders } = useMyOrders();
  const { data: bookings } = useMyBookings(true);
  const { data: ideas } = useMyIdeas(true);
  const { data: rules } = useEarnRules();
  const { data: products } = useProducts();
  const [hidden, setHidden] = useState(store.get('tryst.checklist.hidden') === '1');

  const takeaways = (orders ?? []).filter((o) => o.workflowCode === 'takeaway');
  const lastTakeaway = takeaways[0];
  const upcoming = (bookings ?? []).filter((b) => new Date(b.startsAt).getTime() > Date.now());
  const favs = (products ?? []).filter((p) => favourites.all().includes(p.id));
  const items = [
    { label: 'Save a table', done: (bookings ?? []).length > 0, to: '/reserve' },
    { label: 'Share a Tryst card', done: store.get('tryst.shared') === '1', to: (bookings ?? [])[0] ? `/t/${(bookings ?? [])[0].shareCode}` : '/reserve' },
    { label: 'Order takeaway', done: takeaways.length > 0, to: '/menu' },
    { label: 'Rate a dish', done: store.get('tryst.rated') === '1', to: '/menu', manual: 'tryst.rated' },
    { label: 'Suggest an idea', done: (ideas ?? []).length > 0, to: '/ideas' },
    { label: 'Complete your profile', done: store.get('tryst.profile') === '1', to: '/account', manual: 'tryst.profile' },
  ];
  const doneCount = items.filter((i) => i.done).length;

  const reorder = () => {
    if (!lastTakeaway) return;
    lastTakeaway.items.filter((i) => i.itemType === 'PRODUCT').forEach((i) =>
      addItem({ id: `PRODUCT:${i.itemId}`, name: i.name, unitPrice: i.unitPrice, imageUrl: i.imageUrl, metadata: { itemType: 'PRODUCT', itemId: i.itemId } }, i.quantity));
    toast.success('Your last takeaway is in the cart');
  };

  return (
    <div className="grid-wrap py-10">
      <h1 className="text-[clamp(40px,7vw,72px)]">My account</h1>
      <p className="mt-2 text-muted-foreground">Your tables, orders, ideas and coins in one place. Profile, password, addresses and coin history are in <Link className="underline" to="/account">Profile &amp; loyalty</Link>.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-12">
        <section className="border border-border bg-card p-6 md:col-span-4" aria-labelledby="coins">
          <h2 id="coins" className="text-3xl">Coins</h2>
          <p className="mt-3 font-display text-6xl" data-testid="coin-balance">{me ? me.coinBalance : '...'}</p>
          <p className="text-sm text-muted-foreground">{me?.tierName ? `${me.tierName} member. ` : ''}Redeem coins at checkout with the use-coins toggle.</p>
          <Link to="/loyalty-terms" className="mt-3 inline-block text-sm underline">Loyalty terms</Link>
        </section>

        {!hidden && (
          <section className="border border-border bg-card p-6 md:col-span-8" aria-labelledby="start">
            <div className="flex items-center justify-between"><h2 id="start" className="text-3xl">Get started</h2><span className="text-sm">{doneCount} of {items.length}</span></div>
            <div className="mt-3 h-1.5 bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={doneCount} aria-label="Checklist progress"><div className="h-1.5 bg-terra" style={{ width: `${(doneCount / items.length) * 100}%` }} /></div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((i) => (
                <li key={i.label} className="flex items-center gap-3">
                  {i.done ? <HankoStamp size={36} press>OK</HankoStamp> : <span className="h-9 w-9 border border-border" aria-hidden="true" />}
                  <span className={i.done ? 'text-muted-foreground line-through' : ''}>{i.done ? i.label : <Link className="underline underline-offset-4" to={i.to}>{i.label}</Link>}</span>
                  {!i.done && i.manual && <button type="button" className="ml-auto min-h-[44px] px-2 text-xs underline" onClick={() => { store.set(i.manual!, '1'); window.location.reload(); }}>I did this</button>}
                </li>
              ))}
            </ul>
            <button type="button" className="mt-4 min-h-[44px] text-sm underline" onClick={() => { store.set('tryst.checklist.hidden', '1'); setHidden(true); }}>Hide this checklist</button>
          </section>
        )}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="tables">
          <h2 id="tables" className="text-3xl">Upcoming tables</h2>
          {upcoming.length === 0 ? <p className="mt-3 text-muted-foreground">No table saved. <Link className="underline" to="/reserve">Find your table</Link>.</p> : (
            <ul className="mt-3 space-y-3">{upcoming.map((b) => (
              <li key={b.bookingId} className="border border-border bg-card p-4"><p className="font-medium">{fmtDay(b.startsAt)}, {fmtTime(b.startsAt)}, party of {b.partySize}</p><p className="mt-1 text-sm"><Link className="underline" to={`/t/${b.shareCode}`}>Tryst card</Link> · <Link className="underline" to={`/orders/${b.orderId}`}>Booking</Link></p></li>
            ))}</ul>
          )}
        </section>

        <section aria-labelledby="orders">
          <h2 id="orders" className="text-3xl">Orders and bookings</h2>
          {(orders ?? []).length === 0 ? <p className="mt-3 text-muted-foreground">Nothing yet. <Link className="underline" to="/menu">Order takeaway</Link> or <Link className="underline" to="/reserve">save a table</Link>.</p> : (
            <ul className="mt-3 space-y-2">{(orders ?? []).slice(0, 4).map((o) => <li key={o.id}><Link className="underline" to={`/orders/${o.id}`}>{o.orderNumber}</Link> · {o.workflowCode === 'table' ? 'Table' : 'Takeaway'} · {o.currentStageCode?.replace(/_/g, ' ').toLowerCase()}</li>)}</ul>
          )}
          <p className="mt-3 flex flex-wrap gap-4"><Link className="underline" to="/orders">All orders</Link>{lastTakeaway && <button type="button" className="min-h-[44px] underline" onClick={reorder}>Reorder last takeaway ({inr(lastTakeaway.total)})</button>}</p>
        </section>

        <section aria-labelledby="favs">
          <h2 id="favs" className="text-3xl">Favourites</h2>
          {favs.length === 0 ? <p className="mt-3 text-muted-foreground">Tap the heart on any dish in the <Link className="underline" to="/menu">menu</Link> to keep it here.</p> : <ul className="mt-3 space-y-1">{favs.map((p) => <li key={p.id}><Link className="underline" to={`/products/${p.slug}`}>{p.name}</Link> · {inr(p.price)}</li>)}</ul>}
        </section>

        <section aria-labelledby="ideas">
          <h2 id="ideas" className="text-3xl">My ideas</h2>
          {(ideas ?? []).length === 0 ? <p className="mt-3 text-muted-foreground">No ideas yet. <Link className="underline" to="/ideas">Suggest one</Link>.</p> : <ul className="mt-3 space-y-1">{(ideas ?? []).map((i) => <li key={i.id}>{i.title} <span className="text-sm text-muted-foreground">({i.status.toLowerCase()})</span></li>)}</ul>}
        </section>
      </div>

      <section className="mt-10 rule pt-8" aria-labelledby="earn">
        <h2 id="earn" className="text-3xl">Ways to earn</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(rules ?? []).map((r) => <li key={r.eventType} className="border border-border bg-card p-3"><span className="font-medium">{r.label}</span><br /><span className="text-sm text-muted-foreground">{r.eventType === 'PURCHASE' ? 'Coins on every order' : `${r.coins} coins`}</span></li>)}
        </ul>
      </section>
      <p className="mt-8">Need help? <Link className="underline underline-offset-4" to="/support">Support</Link></p>
    </div>
  );
}
