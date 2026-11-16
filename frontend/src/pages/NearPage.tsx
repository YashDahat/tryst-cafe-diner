import { Link, useParams } from 'react-router-dom';
import { AREAS, TRYST } from '@/config/tryst';
import { cafeJsonLd, todayHours, usePageMeta } from '@/lib/tryst';
import { ContactActions, StickyCta } from '@/components/tryst/parts';

export default function NearPage() {
  const { area = '' } = useParams();
  const a = AREAS[area];
  usePageMeta(a ? `${a.title} | TRYST` : 'TRYST Cafe & Diner', a ? a.copy.slice(0, 155) : 'TRYST on FC Road, Pune', a ? cafeJsonLd : undefined);
  const t = todayHours();
  if (!a) return <div className="grid-wrap py-16"><h1 className="text-4xl">We could not find that page.</h1><p className="mt-3"><Link className="underline" to="/">Back to TRYST</Link></p></div>;
  return (
    <div className="grid-wrap py-10">
      <h1 className="max-w-[20ch] text-[clamp(36px,6vw,64px)]">{a.h1}</h1>
      <p className="mt-6 max-w-[62ch] text-lg">{a.copy}</p>
      <p className="mt-6">Signature plates: chicken or veg ramen, aglio e olio, mexican and pesto pizza, and a classic iced tea. Open today {t.open} to {t.close}.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link to="/reserve" className="btn-terra">Find your table</Link><Link to="/menu" className="btn-ink">See the menu</Link></div>
      <ContactActions className="mt-6" />
      <p className="mt-8 text-sm text-muted-foreground">{TRYST.address}</p>
      <StickyCta />
    </div>
  );
}
