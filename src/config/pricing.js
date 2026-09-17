// Single source of truth for pricing — used by PricingPage (full comparison) and
// LandingPage (compact teaser + inline expanded view). Prices are tax-exclusive, in INR.
// Restaurant-tier ladder (Starter/Growth/Pro), with annual pricing ranging ₹3,000–₹8,000/yr
// — priced affordably for small/medium Indian F&B businesses. Yearly price = 10x monthly
// (2 months free) for every active plan.
//
// The Hotel module is not yet built — it is represented as a single `comingSoon` plan so it
// still shows up in the pricing grid (clearly marked unavailable) without being purchasable
// or counted as an active feature of any current plan. Remove `comingSoon` here once the
// hotel module ships and give it its own monthly/yearly price + highlights at that point.

export const BILLING_CYCLES = { monthly: 'monthly', yearly: 'yearly' };

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For cafes, QSRs & coffee shops just getting started',
    monthlyPrice: 300,
    yearlyPrice: 3000,
    popular: false,
    ctaLabel: 'Start free trial',
    highlights: [
      'Up to 3 team accounts',
      'Table & floor management',
      'Kitchen Display System (KDS)',
      'GST-ready billing & payments',
      'Print bill & WhatsApp sharing',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For full-service restaurants running complete floor-to-bill operations',
    monthlyPrice: 550,
    yearlyPrice: 5500,
    popular: true,
    ctaLabel: 'Start free trial',
    highlights: [
      'Everything in Starter',
      'Up to 8 team accounts',
      'Staff attendance & check-in/out',
      'Customer capture for WhatsApp marketing',
      'Gram / by-weight menu pricing',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For high-volume restaurants that need every module unlocked',
    monthlyPrice: 800,
    yearlyPrice: 8000,
    popular: false,
    ctaLabel: 'Start free trial',
    highlights: [
      'Everything in Growth',
      'Up to 20 team accounts',
      'AI menu scanner & advanced analytics',
      'Ledger & accounting exports',
      'Priority phone & chat support',
    ],
  },
  // {
  //   id: 'hotel',
  //   name: 'Hotel',
  //   tagline: 'Rooms, reservations & housekeeping for guesthouses and small hotels',
  //   comingSoon: true,
  //   ctaLabel: 'Coming soon',
  //   highlights: [
  //     'Rooms, reservations & check-in/out',
  //     'Housekeeping status tracking',
  //     'Combined restaurant + hotel login',
  //     'Real-time analytics & reports',
  //   ],
  // },
];

// Only plans that are actually on sale today — used wherever "active feature" language
// or purchase flows (signup plan picker, comparison table columns) must exclude Hotel.
export const ACTIVE_PLANS = PLANS.filter((plan) => !plan.comingSoon);

export function planPriceLabel(plan, cycle) {
  if (plan.comingSoon) {
    return { amount: '', period: '', note: 'Hotel module is in development' };
  }
  if (cycle === BILLING_CYCLES.yearly) {
    const equivMonthly = Math.round(plan.yearlyPrice / 12);
    return { amount: `₹${equivMonthly.toLocaleString('en-IN')}`, period: '/mo', note: `₹${plan.yearlyPrice.toLocaleString('en-IN')} billed yearly · 2 months free` };
  }
  return { amount: `₹${plan.monthlyPrice.toLocaleString('en-IN')}`, period: '/mo', note: 'Billed monthly · cancel anytime' };
}

// Rows are traced to real modules/schema fields (see backend/prisma/schema.prisma and
// backend/routes/*) so the comparison table never promises a feature that doesn't exist.
// Keyed by plan id (starter/growth/pro) — ComparisonTable in PricingPage.jsx reads these
// dynamically off ACTIVE_PLANS, so a row only needs a value for the ids it applies to.
// Hotel is deliberately left out of this table — it has no shipped features to compare yet.
export const COMPARISON = [
  {
    category: 'Core operations',
    rows: [
      { label: 'Team member accounts', starter: 'Up to 3', growth: 'Up to 8', pro: 'Up to 20' },
      { label: 'Table & floor management', starter: true, growth: true, pro: true },
      { label: 'Multi-channel orders (dine-in, takeaway, delivery)', starter: true, growth: true, pro: true },
      { label: 'Kitchen Display System (KDS)', starter: true, growth: true, pro: true },
      { label: 'GST-ready billing & split payments', starter: true, growth: true, pro: true },
      { label: 'Print bill & WhatsApp bill sharing', starter: true, growth: true, pro: true },
    ],
  },
  {
    category: 'Inventory & menu',
    rows: [
      { label: 'Inventory stock tracking', starter: 'Basic', growth: 'Advanced + reorder alerts', pro: 'Advanced + reorder alerts' },
      { label: 'Gram / by-weight menu pricing', starter: false, growth: true, pro: true },
      { label: 'AI menu scanner (photo → menu items)', starter: false, growth: false, pro: true },
    ],
  },
  {
    category: 'Staff & customers',
    rows: [
      { label: 'Role-based staff access', starter: true, growth: true, pro: true },
      { label: 'Staff attendance & check-in/out reports', starter: false, growth: true, pro: true },
      { label: 'Customer capture for WhatsApp marketing', starter: false, growth: true, pro: true },
    ],
  },
  {
    category: 'Reporting',
    rows: [
      { label: 'Analytics dashboard', starter: 'Standard', growth: 'Real-time, advanced', pro: 'Real-time, advanced' },
      { label: 'Ledger & accounting exports', starter: false, growth: false, pro: true },
    ],
  },
  {
    category: 'Support',
    rows: [
      { label: 'Support channel', starter: 'Email (48h)', growth: 'Priority chat + email (12h)', pro: 'Priority phone + chat' },
      { label: 'Onboarding', starter: 'Self-serve setup wizard', growth: 'Self-serve + guided setup', pro: 'Guided onboarding' },
    ],
  },
];

export const PRICING_FAQS = [
  {
    q: 'Do I need a credit card to start the free trial?',
    a: 'No. Every plan starts with a 14-day free trial — create your account and set up your menu and tables first, without entering payment details.',
  },
  {
    q: "What's the difference between Starter, Growth, and Pro?",
    a: 'Starter covers the essentials for a small counter-service or quick-bite setup. Growth adds staff attendance tracking, customer capture for WhatsApp marketing, and gram-based weighed-item pricing for full-service dine-in operations. Pro unlocks the AI menu scanner, advanced analytics, accounting exports, and priority support for high-volume restaurants.',
  },
  {
    q: 'Is the Hotel module available yet?',
    a: "Not yet — Hotel management (rooms, reservations, check-in/out, housekeeping) is under active development and marked Coming Soon. It isn't included in any current plan. Join the waitlist from the pricing page and we'll notify you the moment it's ready.",
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can move between Starter, Growth, and Pro as your business grows — your tables, menu, orders, and history carry over with no re-setup.',
  },
  {
    q: 'Is GST included in the listed price?',
    a: 'Listed prices are exclusive of applicable taxes. GST is added at checkout based on your business location.',
  },
  {
    q: 'I run a multi-location chain — is there a plan for that?',
    a: "These plans are built for single-location small and medium businesses. If you're running multiple outlets or a larger group, contact sales for a custom quote.",
  },
];
