import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEarnRules, usePublicIdeas, useSuggest } from '@/hooks/trystHooks';
import { withToast } from '@/lib/apiToast';
import { usePageMeta } from '@/lib/tryst';
import { HankoStamp, StickyCta } from '@/components/tryst/parts';

const CATS = ['Menu', 'Music', 'Space', 'Other'];

export default function IdeasPage() {
  usePageMeta('Suggest an idea | TRYST Cafe & Diner', 'Tell TRYST what to cook, play or change. Ideas we act on are listed here.');
  const { isAuthenticated } = useAuth();
  const { data: rules } = useEarnRules();
  const { data: done } = usePublicIdeas();
  const suggest = useSuggest();
  const coins = rules?.find((r) => r.eventType === 'SUGGESTION')?.coins;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Menu');
  const errors: string[] = [];
  if (title.length > 80) errors.push('Title is limited to 80 characters.');
  if (body.length > 600) errors.push('Details are limited to 600 characters.');
  const canSave = title.trim().length > 0 && body.trim().length > 0 && errors.length === 0 && !suggest.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const msg = isAuthenticated && coins ? `Thank you! +${coins} coins for your idea` : 'Thank you, we read every idea';
    await withToast(suggest.mutateAsync({ title: title.trim(), body: body.trim(), category }), msg);
    setTitle(''); setBody('');
  };

  return (
    <div className="grid-wrap py-10">
      <h1 className="text-[clamp(40px,7vw,72px)]">Suggest an idea</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">A dish, a band, a corner of the room. {isAuthenticated ? (coins ? `Ideas earn ${coins} coins, whether or not we use them.` : 'Tell us what you would change.') : <>Guests can send ideas too; <Link className="underline" to="/login?redirect=%2Fideas">sign in</Link> to earn coins{coins ? ` (${coins} per idea)` : ''}.</>}</p>
      <div className="mt-10 grid gap-12 md:grid-cols-12">
        <form onSubmit={submit} className="space-y-5 md:col-span-6" noValidate>
          {errors.length > 0 && <div role="alert" className="border border-destructive bg-card p-3 text-destructive">{errors.join(' ')}</div>}
          <div>
            <label htmlFor="idea-title" className="mb-1 block font-medium">Title</label>
            <input id="idea-title" value={title} onChange={(e) => setTitle(e.target.value)} className={`min-h-[44px] w-full border bg-card px-3 ${title.length > 80 ? 'border-destructive' : 'border-input'}`} />
          </div>
          <div>
            <label htmlFor="idea-cat" className="mb-1 block font-medium">About</label>
            <select id="idea-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-[44px] w-full border border-input bg-card px-3">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label htmlFor="idea-body" className="mb-1 block font-medium">Details</label>
            <textarea id="idea-body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} className={`w-full border bg-card p-3 ${body.length > 600 ? 'border-destructive' : 'border-input'}`} />
            <p className="text-xs text-muted-foreground">{body.length}/600</p>
          </div>
          <button type="submit" disabled={!canSave} className="btn-terra disabled:cursor-not-allowed disabled:opacity-50">Send idea</button>
        </form>
        <section className="md:col-span-5 md:col-start-8" aria-labelledby="acted">
          <h2 id="acted" className="text-3xl">Ideas we acted on</h2>
          {(done ?? []).length === 0 ? <p className="mt-3 text-muted-foreground">Nothing here yet. Yours could be the first.</p> : (
            <ul className="mt-4 space-y-4">
              {(done ?? []).map((i) => (
                <li key={i.id} className="flex gap-4 border-b border-border pb-4">
                  <HankoStamp size={52}>{i.status === 'DONE' ? 'Done' : 'Soon'}</HankoStamp>
                  <div><p className="font-medium">{i.title}</p><p className="text-sm text-muted-foreground">{i.category}{i.publicNote ? `. ${i.publicNote}` : ''}</p></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <StickyCta />
    </div>
  );
}
