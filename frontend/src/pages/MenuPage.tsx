import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/cart';
import { useProducts } from '@/hooks/productHooks';
import { useBranch } from '@/context/BranchContext';
import { useCombos, useEarnRules } from '@/hooks/trystHooks';
import { loyaltyService } from '@/services/loyaltyService';
import { TRYST } from '@/config/tryst';
import { favourites, inr, store, usePageMeta } from '@/lib/tryst';
import { Reveal } from '@/components/tryst/Reveal';
import { StickyCta, VegMark } from '@/components/tryst/parts';
import type { ProductDto } from '@/types/product';

const isVeg = (p: ProductDto) => !(p.features ?? []).includes('non-veg');
const soldOut = (p: ProductDto) => p.variants.length === 0 && p.stockTracked && p.available != null && p.available <= 0;

export default function MenuPage() {
  usePageMeta('Menu | TRYST Cafe & Diner, FC Road Pune', 'Ramen, pasta, pizza, iced teas, coffee and desserts at TRYST on FC Road, Pune. Veg and non-veg. Order takeaway online.');
  const { selectedBranchId } = useBranch();
  const { data: products, isLoading } = useProducts({ branchId: selectedBranchId ?? undefined });
  const { data: combos } = useCombos();
  const { data: rules } = useEarnRules();
  const { addItem } = useCart();
  const [vegOnly, setVegOnly] = useState(store.get('tryst.vegOnly') === '1');
  const [availableNow, setAvailableNow] = useState(false);
  const [favs, setFavs] = useState<number[]>(favourites.all());
  const [hintGone, setHintGone] = useState(store.get('tryst.hint.veg') === '1');
  const reviewCoins = rules?.find((r) => r.eventType === 'REVIEW')?.coins;

  const comboIds = useMemo(() => new Set((combos ?? []).map((c) => c.productId)), [combos]);
  const nowIds = useMemo(() => new Set((combos ?? []).filter((c) => c.availableNow).map((c) => c.productId)), [combos]);

  const groups = useMemo(() => {
    const list = (products ?? []).filter((p) => (!vegOnly || isVeg(p)) && (!availableNow || (!soldOut(p) && (!comboIds.has(p.id) || nowIds.has(p.id)))));
    const cats = [...TRYST.categories, ...Array.from(new Set(list.map((p) => p.category ?? 'More'))).filter((c) => !TRYST.categories.includes(c))];
    return cats.map((c) => ({ cat: c, items: list.filter((p) => (p.category ?? 'More') === c) })).filter((g) => g.items.length > 0);
  }, [products, vegOnly, availableNow, comboIds, nowIds]);

  const add = (p: ProductDto) => {
    addItem({ id: `PRODUCT:${p.id}`, name: p.name, unitPrice: p.price, imageUrl: p.imageUrl, metadata: { itemType: 'PRODUCT', itemId: p.id } });
    toast.success(`${p.name} added`);
  };
  const toggleFav = (p: ProductDto) => {
    const next = favourites.toggle(p.id);
    setFavs(next);
    if (next.includes(p.id)) loyaltyService.recordActivity({ type: 'WISHLIST', itemType: 'PRODUCT', itemId: p.id });
  };
  const setVeg = (v: boolean) => { setVegOnly(v); store.set('tryst.vegOnly', v ? '1' : '0'); };

  return (
    <div className="grid-wrap py-10">
      <h1 className="text-[clamp(40px,7vw,72px)]">The menu</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">Order for pickup at the counter, or <Link className="underline" to="/reserve">save a table</Link> and order when you get here. Prices are being confirmed with the kitchen.</p>

      <div className="sticky top-[64px] z-30 -mx-4 mt-6 border-y border-border bg-background px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex min-h-[44px] items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[hsl(var(--moss))]" checked={vegOnly} onChange={(e) => setVeg(e.target.checked)} /> Veg only</label>
          <label className="flex min-h-[44px] items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[hsl(var(--moss))]" checked={availableNow} onChange={(e) => setAvailableNow(e.target.checked)} /> Available now</label>
          <nav aria-label="Menu sections" className="flex gap-4 overflow-x-auto">
            {groups.map((g) => <a key={g.cat} href={`#${g.cat.replace(/\W+/g, '-')}`} className="min-h-[44px] whitespace-nowrap py-2.5 text-sm underline-offset-4 hover:underline">{g.cat}</a>)}
          </nav>
        </div>
      </div>

      {!hintGone && (
        <p className="mt-4 flex items-center justify-between gap-3 border border-border bg-card p-3 text-sm" role="note">
          <span>Tip: the Veg only switch above hides everything non-veg, and we remember it for next time.</span>
          <button type="button" className="min-h-[44px] px-3 underline" onClick={() => { store.set('tryst.hint.veg', '1'); setHintGone(true); }}>Got it</button>
        </p>
      )}

      {isLoading && <p className="mt-10 text-muted-foreground">Loading the menu...</p>}
      {!isLoading && groups.length === 0 && <p className="mt-10">Nothing here right now. Try switching off a filter, or <Link className="underline" to="/menu">see everything</Link>.</p>}

      {groups.map((g, gi) => (
        <section key={g.cat} id={g.cat.replace(/\W+/g, '-')} className="mt-14 scroll-mt-32">
          <Reveal className="flex items-end gap-4"><span className="chapter-no" aria-hidden="true">{String(gi + 1).padStart(2, '0')}</span><h2 className="text-4xl">{g.cat}</h2><span className="rule mb-2 flex-1" aria-hidden="true" /></Reveal>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((p) => {
              const so = soldOut(p);
              const combo = (combos ?? []).find((c) => c.productId === p.id);
              const off = combo && !combo.availableNow;
              return (
                <li key={p.id} className="flex flex-col border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <VegMark veg={isVeg(p)} />
                    <button type="button" aria-pressed={favs.includes(p.id)} aria-label={`Favourite ${p.name}`} onClick={() => toggleFav(p)} className="flex h-11 w-11 items-center justify-center"><Heart size={20} fill={favs.includes(p.id) ? 'currentColor' : 'none'} className="text-terra" /></button>
                  </div>
                  <h3 className="mt-2 text-2xl"><Link to={`/products/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
                  <p className="mt-1 flex-1 text-muted-foreground">{p.description}</p>
                  {combo && <p className="mt-2 text-sm">{combo.days.replace('-', ' to ')}, {combo.availableFrom} to {combo.availableTo}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-medium tabular-nums">{inr(p.price)}</span>
                    <button type="button" disabled={so || !!off} onClick={() => add(p)} className="btn-ink disabled:cursor-not-allowed disabled:opacity-50">{so ? 'Finished for today' : off ? 'Not on right now' : 'Add'}</button>
                  </div>
                  <Link to={`/products/${p.slug}`} className="mt-3 min-h-[44px] pt-2 text-sm underline underline-offset-4">Rate it{reviewCoins ? ` · earns ${reviewCoins} coins` : ''}</Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="mt-14 text-sm text-muted-foreground">Ratings you leave earn coins whatever you rate. See the <Link className="underline" to="/loyalty-terms">loyalty terms</Link>. Need help with an order? <Link className="underline" to="/support">Support</Link>.</p>
      <StickyCta />
    </div>
  );
}
