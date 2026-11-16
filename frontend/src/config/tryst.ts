// Real, sourced facts about TRYST Cafe & Diner (Google listing, EazyDiner). Never add invented history or reviews here.
export const TRYST = {
  name: 'TRYST Cafe & Diner',
  phoneDisplay: '+91 98225 23069',
  phoneTel: 'tel:+919822523069',
  // Confirm this number takes WhatsApp before launch; see the build summary.
  whatsapp: 'https://wa.me/919822523069',
  address: 'Dnyaneshwar Paduka Chowk, Ferguson College Rd, Sud Nagar, Shivajinagar, Pune, Maharashtra 411005',
  lat: 18.526713,
  lng: 73.84239,
  mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJk8P-WQC_wjsRfXk7P14TKu0',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.526713,73.84239&destination_place_id=ChIJk8P-WQC_wjsRfXk7P14TKu0',
  mapEmbed: 'https://maps.google.com/maps?q=18.526713,73.84239&z=17&output=embed',
  districtUrl: 'https://www.district.in/dining/pune/tryst-caf%C3%A9-diner-shivaji-nagar/book',
  photo: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeRv3l0fZ7MtM2O6UNmYX7gcmFJXtuF5ApRy_5FGYfdyrlPr85aieeaEYaP2zT8GW7U8-Q1hG5tbTYtWKVG6K0GnQ8JGMWKi0TbKtYpzJkuojAm1G2GcLaQQ5-Dc0H2wGMcJbAwRR-rCiKn=w408-h506-k-no',
  rating: 4.7,
  reviewCount: 976,
  histogram: { 5: 793, 4: 144, 3: 21, 2: 4, 1: 14 } as Record<number, number>,
  // index 0 = Sunday (JS getDay)
  hours: [
    { day: 'Sunday', open: '10:30 am', close: '11:00 pm' },
    { day: 'Monday', open: '10:30 am', close: '10:30 pm' },
    { day: 'Tuesday', open: '10:30 am', close: '10:30 pm' },
    { day: 'Wednesday', open: '10:30 am', close: '10:30 pm' },
    { day: 'Thursday', open: '10:30 am', close: '10:30 pm' },
    { day: 'Friday', open: '10:30 am', close: '11:00 pm' },
    { day: 'Saturday', open: '10:30 am', close: '11:00 pm' },
  ],
  // Verbatim Google reviews (first name only), shown unedited and unfiltered by rating.
  reviews: [
    { name: 'Akhil', stars: 5, text: 'Hands down, the best ramen I’ve ever had — the broth was insanely flavorful and comforting.' },
    { name: 'Taneshaa', stars: 5, text: 'They were asking how the food/drinks are after serving… The ice tea were top notch, not too much sweet.' },
    { name: 'Aarti', stars: 5, text: 'Staff is also very supportive. Best place for celebration.' },
    { name: 'Parth', stars: 4, text: 'Great vibe and the service was quick and efficient. However, the portion sizes were disappointingly small for the sky-high prices.' },
  ],
  categories: ['Ramen & Bowls', 'Pasta', 'Pizza', 'Iced Teas & Mocktails', 'Coffee', 'Desserts', 'Combos'],
};

export const AREAS: Record<string, { title: string; h1: string; copy: string }> = {
  'fergusson-college': {
    title: 'Cafe near Fergusson College, Pune',
    h1: 'A cafe near Fergusson College for long catch-ups',
    copy: 'TRYST sits at Dnyaneshwar Paduka Chowk on Fergusson College Road, right where students and friends already meet. Slip in between lectures for a bowl of ramen, a plate of aglio e olio or an iced tea that is not too sweet. Save a table for your group and send everyone one link with the time and the way here.',
  },
  'jm-road': {
    title: 'Cafe and restaurant near JM Road, Pune',
    h1: 'A table near JM Road, one turn from FC Road',
    copy: 'Working around JM Road and want a proper sit-down lunch or an after-work meet-up? TRYST is on Fergusson College Road at Dnyaneshwar Paduka Chowk. Pasta, pizza and ramen, veg and non-veg, with outdoor seating and live music evenings. Save your table online so the group walks straight in.',
  },
  'deccan-gymkhana': {
    title: 'Cafe near Deccan Gymkhana, Pune',
    h1: 'Brunch and long evenings near Deccan Gymkhana',
    copy: 'If your plans are around Deccan Gymkhana, TRYST on FC Road is a short hop away. We open at 10:30 am for brunch and stay open into the night. Bowls, pastas, pizzas, mocktails and coffee, with a terrace to sit out on. Reserve a table and share a Tryst card so friends know where and when.',
  },
  'model-colony': {
    title: 'Cafe near Model Colony, Pune',
    h1: 'A neighbourhood meeting place for Model Colony',
    copy: 'Model Colony friends and families: TRYST is on Fergusson College Road at Dnyaneshwar Paduka Chowk. Celebrate a birthday, plan a date or take a bowl of ramen home. Book online, tell us the occasion, and share the card with everyone coming.',
  },
  shivajinagar: {
    title: 'Best cafe in Shivajinagar, Pune',
    h1: 'A cafe in Shivajinagar worth arranging to meet at',
    copy: 'TRYST Cafe & Diner is in Sud Nagar, Shivajinagar, on Fergusson College Road. Italian and continental plates, ramen, desserts and drinks, vegetarian and non-vegetarian, with seating indoors and outside. Order takeaway or save a table for later today.',
  },
  'prabhat-road': {
    title: 'Cafe near Prabhat Road, Pune',
    h1: 'From Prabhat Road to Paduka Chowk',
    copy: 'Coming from the Prabhat Road side? TRYST is on Fergusson College Road at Dnyaneshwar Paduka Chowk. There is no parking on site, so FC Road is easiest by auto or on foot. Save a table, send the card, and walk in together.',
  },
};
