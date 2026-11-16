// TRYST Cafe & Diner site configuration. Facts come from the business listing; nothing here is invented.
import type { SiteConfig } from '@/shell';

const siteConfig: SiteConfig = {
  header: {
    brandName: 'TRYST',
    logoUrl: null,
    navLinks: [
      { label: 'Menu', href: '/menu' },
      { label: 'Reserve', href: '/reserve' },
      { label: 'Our Story', href: '/story' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Visit', href: '/visit' },
      { label: 'Support', href: '/support' },
    ],
    ctaButton: { label: 'Find your table', href: '/reserve' },
    showAuth: true,
    bgClass: 'bg-background',
    textClass: 'text-foreground',
    hoverClass: 'hover:text-terra',
    ctaClass: 'bg-terra text-white hover:bg-terra/90',
  },
  footer: {
    brandName: 'TRYST Cafe & Diner',
    tagline: 'The meeting place on FC Road. Ramen, pasta, pizza and iced tea, with a table saved for you and your people.',
    address: 'Dnyaneshwar Paduka Chowk, Ferguson College Rd, Sud Nagar, Shivajinagar, Pune 411005',
    phone: '+91 98225 23069',
    email: null,
    openingHours: 'Mon to Thu 10:30 am to 10:30 pm. Fri to Sun 10:30 am to 11:00 pm.',
    quickLinks: [
      { label: 'Menu', href: '/menu' },
      { label: 'Reserve a table', href: '/reserve' },
      { label: 'Our Story', href: '/story' },
      { label: 'Suggest an idea', href: '/ideas' },
      { label: 'My account', href: '/account/hub' },
      { label: 'Support', href: '/support' },
      { label: 'Loyalty terms', href: '/loyalty-terms' },
      { label: 'Also on District', href: 'https://www.district.in/dining/pune/tryst-caf%C3%A9-diner-shivaji-nagar/book', external: true } as never,
    ],
    socialLinks: [],
    bgClass: 'bg-night',
    textClass: 'text-[#B9B4A6]',
    accentClass: 'hover:text-ember',
  },
};

export default siteConfig;
