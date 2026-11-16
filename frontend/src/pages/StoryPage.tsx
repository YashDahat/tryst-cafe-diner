import { Link } from 'react-router-dom';
import { TRYST } from '@/config/tryst';
import { usePageMeta } from '@/lib/tryst';
import { Reveal } from '@/components/tryst/Reveal';
import { StickyCta } from '@/components/tryst/parts';

const BEATS = [
  { t: 'The name', b: 'Tryst is an old word for a meeting you have arranged: a time, a place, a person you are looking forward to seeing. We took it literally.' },
  { t: 'The corner', b: 'We are at Dnyaneshwar Paduka Chowk on Fergusson College Road, in Sud Nagar, Shivajinagar. This stretch has always been where Pune sits and talks: students between lectures, friends who have not made a plan yet, colleagues out for lunch. In Pune that is the katta, a ledge where people stay far longer than they meant to.' },
  { t: 'The kitchen', b: 'Ramen bowls, Italian pastas and pizzas, desserts, iced teas, mocktails and coffee. Vegetarian and non-vegetarian, on one menu.' },
  { t: 'The room', b: 'Indoor tables, seats outside, and live music evenings. It is wheelchair accessible. There is no parking on site, so FC Road is easiest by auto or on foot.' },
  { t: 'The people', b: `${TRYST.reviewCount} people have reviewed us on Google and the average is ${TRYST.rating}. What they mention most is the quick, attentive service and the ramen. The honest notes are there too, including that portions can feel small for the price. We read all of them.` },
];

export default function StoryPage() {
  usePageMeta('Our Story | TRYST Cafe & Diner, FC Road Pune', 'The story of TRYST: an arranged meeting, a corner on FC Road, and a kitchen of ramen, pasta and pizza.');
  return (
    <div className="grid-wrap py-10">
      <h1 className="text-[clamp(40px,7vw,72px)]">Our story</h1>
      <p className="mt-2 max-w-[56ch] text-muted-foreground">We keep this to what we can stand behind: the idea, the corner and the kitchen.</p>
      <ol className="relative mt-14 ml-3 max-w-2xl pl-10">
        <span className="timeline-line absolute bottom-0 left-0 top-0 w-px bg-terra" aria-hidden="true" />
        {BEATS.map((b, i) => (
          <Reveal as="li" key={b.t} className="relative pb-14">
            <span className="absolute -left-[46px] top-1 flex h-3 w-3 items-center justify-center bg-terra" aria-hidden="true" />
            <span className="chapter-no text-3xl">{String(i + 1).padStart(2, '0')}</span>
            <h2 className="mt-1 text-3xl">{b.t}</h2>
            <p className="mt-2 text-lg">{b.b}</p>
          </Reveal>
        ))}
        <Reveal as="li" className="relative">
          <span className="absolute -left-[46px] top-1 h-3 w-3 border-2 border-terra bg-background" aria-hidden="true" />
          <span className="chapter-no text-3xl">06</span>
          <h2 className="mt-1 text-3xl">Next</h2>
          <p className="mt-2 text-lg">Your idea could be here. <Link className="underline underline-offset-4" to="/ideas">Suggest one</Link>, and when we act on it, it goes on the list.</p>
        </Reveal>
      </ol>
      <StickyCta />
    </div>
  );
}
