// Single source of truth for pricing — used by PricingPage (full comparison) and
// LandingPage (compact teaser). Prices are tax-exclusive, in INR, per tenant/month.
// Structured by BUSINESS CATEGORY (not a generic tier ladder) — Cafe, Restaurant, Hotel,
// and Restaurant + Hotel — priced for small/medium Indian F&B and hospitality businesses,
// benchmarked against typical Indian POS/PMS SaaS pricing (roughly ₹500–2,500/mo per
// outlet for single-business tools). Yearly price = 10x monthly (2 months free) for every plan.

export const BILLING_CYCLES = { monthly: 'monthly', yearly: 'yearly' };

export const PLANS = [
  {
    id: 'cafe',
    name: 'Cafe',
    tagline: 'For cafes, QSRs & coffee shops just getting started',
    monthlyPrice: 799,
    yearlyPrice: 7990,
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
    id: 'restaurant',
    name: 'Restaurant',
    tagline: 'For full-service restaurants running complete floor-to-bill operations',
    monthlyPrice: 1499,
    yearlyPrice: 14990,
    popular: true,
    ctaLabel: 'Start free trial',
    highlights: [
      'Everything in Cafe',
      'Up to 8 team accounts',
      'Staff attendance & check-in/out',
      'Customer capture for WhatsApp marketing',
      'AI menu scanner & advanced analytics',
    ],
  },
  {
    id: 'hotel',
    name: 'Hotel',
    tagline: 'For guesthouses & small hotels managing rooms and stays',
    monthlyPrice: 1499,
    yearlyPrice: 14990,
    popular: false,
    ctaLabel: 'Start free trial',
    highlights: [
      'Up to 8 team accounts',
      'Rooms, reservations & check-in/out',
      'Housekeeping status tracking',
      'Staff attendance & check-in/out',
      'Real-time analytics & reports',
    ],
  },
  {
    id: 'both',
    name: 'Restaurant + Hotel',
    tagline: 'For combined properties running both under one roof',
    monthlyPrice: 2199,
    yearlyPrice: 21990,
    popular: false,
    ctaLabel: 'Start free trial',
    highlights: [
      'Everything in Restaurant + Hotel',
      'Up to 20 team accounts',
      'Restaurant + Hotel on one login',
      'All modules unlocked',
      'Priority phone & chat support',
    ],
  },
];

export function planPriceLabel(plan, cycle) {
  if (cycle === BILLING_CYCLES.yearly) {
    const equivMonthly = Math.round(plan.yearlyPrice / 12);
    return { amount: `₹${equivMonthly.toLocaleString('en-IN')}`, period: '/mo', note: `₹${plan.yearlyPrice.toLocaleString('en-IN')} billed yearly · 2 months free` };
  }
  return { amount: `₹${plan.monthlyPrice.toLocaleString('en-IN')}`, period: '/mo', note: 'Billed monthly · cancel anytime' };
}

// Rows are traced to real modules/schema fields (see backend/prisma/schema.prisma and
// backend/routes/*) so the comparison table never promises a feature that doesn't exist.
// Keyed by plan id (cafe/restaurant/hotel/both) — ComparisonTable in PricingPage.jsx reads
// these dynamically off the PLANS array, so a row only needs a value for the ids it applies to.
export const COMPARISON = [
  {
    category: 'Core operations',
    rows: [
      { label: 'Team member accounts', cafe: 'Up to 3', restaurant: 'Up to 8', hotel: 'Up to 8', both: 'Up to 20' },
      { label: 'Table & floor management', cafe: true, restaurant: true, hotel: false, both: true },
      { label: 'Rooms, reservations & check-in/out', cafe: false, restaurant: false, hotel: true, both: true },
      { label: 'Multi-channel orders (dine-in, takeaway, delivery)', cafe: true, restaurant: true, hotel: false, both: true },
      { label: 'Kitchen Display System (KDS)', cafe: true, restaurant: true, hotel: false, both: true },
      { label: 'GST-ready billing & split payments', cafe: true, restaurant: true, hotel: true, both: true },
      { label: 'Print bill & WhatsApp bill sharing', cafe: true, restaurant: true, hotel: true, both: true },
    ],
  },
  {
    category: 'Inventory & menu',
    rows: [
      { label: 'Inventory stock tracking', cafe: 'Basic', restaurant: 'Advanced + reorder alerts', hotel: '—', both: 'Advanced + reorder alerts' },
      { label: 'Gram / by-weight menu pricing', cafe: false, restaurant: true, hotel: false, both: true },
      { label: 'AI menu scanner (photo → menu items)', cafe: false, restaurant: true, hotel: false, both: true },
    ],
  },
  {
    category: 'Staff & customers',
    rows: [
      { label: 'Role-based staff access', cafe: true, restaurant: true, hotel: true, both: true },
      { label: 'Staff attendance & check-in/out reports', cafe: false, restaurant: true, hotel: true, both: true },
      { label: 'Customer capture for WhatsApp marketing', cafe: false, restaurant: true, hotel: false, both: true },
    ],
  },
  {
    category: 'Reporting',
    rows: [
      { label: 'Analytics dashboard', cafe: 'Standard', restaurant: 'Real-time, advanced', hotel: 'Real-time, advanced', both: 'Real-time, advanced' },
      { label: 'Ledger & accounting exports', cafe: false, restaurant: true, hotel: true, both: true },
    ],
  },
  {
    category: 'Support',
    rows: [
      { label: 'Support channel', cafe: 'Email (48h)', restaurant: 'Priority chat + email (12h)', hotel: 'Priority chat + email (12h)', both: 'Priority phone + chat' },
      { label: 'Onboarding', cafe: 'Self-serve setup wizard', restaurant: 'Self-serve + guided setup', hotel: 'Self-serve + guided setup', both: 'Guided onboarding' },
    ],
  },
];

export const PRICING_FAQS = [
  {
    q: 'Do I need a credit card to start the free trial?',
    a: 'No. Every plan starts with a 14-day free trial — create your account and set up your menu, tables, or rooms first, without entering payment details.',
  },
  {
    q: "What's the difference between the Cafe and Restaurant plans?",
    a: 'Cafe covers the essentials for a small counter-service or quick-bite setup. Restaurant adds staff attendance tracking, customer capture for WhatsApp marketing, gram-based weighed-item pricing, the AI menu scanner, and advanced analytics — built for full-service dine-in operations.',
  },
  {
    q: 'I run a restaurant and a small hotel on the same property — which plan do I need?',
    a: 'Restaurant + Hotel gives you both modules on one login at a bundled price — cheaper than paying for the Restaurant and Hotel plans separately, with a higher team-account limit to match.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can move between Cafe, Restaurant, Hotel, and Restaurant + Hotel as your business grows — your tables, menu, orders, and history carry over with no re-setup.',
  },
  {
    q: 'Is GST included in the listed price?',
    a: 'Listed prices are exclusive of applicable taxes. GST is added at checkout based on your business location.',
  },
  {
    q: 'I run a multi-location chain — is there a plan for that?',
    a: "These four plans are built for single-location small and medium businesses. If you're running multiple outlets or a larger group, contact sales for a custom quote.",
  },
];
