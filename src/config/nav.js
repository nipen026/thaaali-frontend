import {
  LayoutDashboard, Grid3X3, ClipboardList, Monitor,
  UtensilsCrossed, Wallet, Package, Users, TrendingUp,
  Building2, Store, BookOpen,
} from 'lucide-react';

// Single source of truth for both sidebar rendering (Layout.jsx) and route access
// enforcement (RoleGuard in App.jsx) — a route reachable by a role must appear here,
// or it isn't reachable at all, so the two can never drift apart.
export const NAV = {
  owner:[
    {sect:'Restaurant',links:[
      {to:'/app/dashboard',Icon:LayoutDashboard,label:'Dashboard'},
      {to:'/app/tables',Icon:Grid3X3,label:'Floor & Tables'},
      {to:'/app/orders',Icon:ClipboardList,label:'Orders'},
      {to:'/app/kitchen',Icon:Monitor,label:'Kitchen (KDS)'},
      {to:'/app/menu',Icon:UtensilsCrossed,label:'Menu'},
      {to:'/app/billing',Icon:Wallet,label:'Billing'},
    ]},
    {sect:'Operations',links:[
      {to:'/app/inventory',Icon:Package,label:'Inventory'},
      {to:'/app/staff',Icon:Users,label:'Staff'},
      {to:'/app/analytics',Icon:TrendingUp,label:'Analytics'},
      {to:'/app/ledger',Icon:BookOpen,label:'Ledger'},
    ]},
    {sect:'Hotel',links:[
      {to:'/app/hotel',Icon:Building2,label:'Hotel Module'},
    ]},
    {sect:'Setup',links:[
      {to:'/app/setup/restaurant',Icon:Store,label:'Restaurant Info'},
      {to:'/app/setup/tables',Icon:Grid3X3,label:'Tables & Seating'},
      {to:'/app/setup/menu',Icon:UtensilsCrossed,label:'Menu Setup'},
    ]},
  ],
  restaurant_manager:[
    {sect:'Operations',links:[
      {to:'/app/dashboard',Icon:LayoutDashboard,label:'Dashboard'},
      {to:'/app/tables',Icon:Grid3X3,label:'Floor & Tables'},
      {to:'/app/orders',Icon:ClipboardList,label:'Orders'},
      {to:'/app/menu',Icon:UtensilsCrossed,label:'Menu'},
      {to:'/app/billing',Icon:Wallet,label:'Billing'},
      {to:'/app/inventory',Icon:Package,label:'Inventory'},
      {to:'/app/staff',Icon:Users,label:'Staff'},
      {to:'/app/analytics',Icon:TrendingUp,label:'Analytics'},
      {to:'/app/ledger',Icon:BookOpen,label:'Ledger'},
    ]},
    {sect:'Setup',links:[
      {to:'/app/setup/tables',Icon:Grid3X3,label:'Tables & Seating'},
      {to:'/app/setup/menu',Icon:UtensilsCrossed,label:'Menu Setup'},
    ]},
  ],
  hotel_manager:[
    {sect:'Hotel',links:[
      {to:'/app/dashboard',Icon:LayoutDashboard,label:'Dashboard'},
      {to:'/app/hotel',Icon:Building2,label:'Hotel Module'},
      {to:'/app/staff',Icon:Users,label:'Staff'},
      {to:'/app/analytics',Icon:TrendingUp,label:'Analytics'},
    ]},
  ],
  waiter:[
    {sect:'My Work',links:[
      {to:'/app/tables',Icon:Grid3X3,label:'My Tables'},
      {to:'/app/orders',Icon:ClipboardList,label:'Active Orders'},
      {to:'/app/menu',Icon:UtensilsCrossed,label:'Menu'},
    ]},
  ],
  cashier:[
    {sect:'Billing',links:[
      {to:'/app/billing',Icon:Wallet,label:'Billing'},
      {to:'/app/orders',Icon:ClipboardList,label:'Orders'},
      {to:'/app/ledger',Icon:BookOpen,label:'Ledger'},
    ]},
  ],
  kitchen:[
    {sect:'Kitchen',links:[
      {to:'/app/kitchen',Icon:Monitor,label:'KDS Display'},
    ]},
  ],
  hotel_desk:[
    {sect:'Hotel',links:[
      {to:'/app/hotel',Icon:Building2,label:'Hotel Module'},
    ]},
  ],
};

export const PAGE_META = {
  '/app/dashboard':{title:'Dashboard',     sub:'Real-time overview of your operation'},
  '/app/tables':   {title:'Floor & Tables',sub:'Live floor map · Click any table to manage'},
  '/app/orders':   {title:'Orders',        sub:'All channels in one view'},
  '/app/kitchen':  {title:'Kitchen Display',sub:'Live KDS · Real-time updates'},
  '/app/menu':     {title:'Menu Management',sub:'Items, pricing, filters, availability'},
  '/app/billing':  {title:'Billing',       sub:'GST-ready · UPI · Card · Cash · Split'},
  '/app/inventory':{title:'Inventory',     sub:'Stock levels · Low-stock alerts'},
  '/app/staff':    {title:'Staff',         sub:'Team overview · Shift management'},
  '/app/hotel':    {title:'Hotel Module',  sub:'Rooms · Reservations · Housekeeping'},
  '/app/analytics':{title:'Analytics',     sub:'Revenue trends · Channel split · Top dishes'},
  '/app/ledger':   {title:'Ledger',        sub:'Full financial reports · Payment methods · Top sellers'},
  '/app/setup/restaurant':{title:'Restaurant Info', sub:'Business details, currency & tax settings'},
  '/app/setup/tables':    {title:'Tables & Seating', sub:'Add or remove tables and configure seating'},
  '/app/setup/menu':      {title:'Menu Setup',       sub:'Add menu items manually or scan an existing menu'},
};

// Where each role lands right after login / when hitting a route they can't access.
export const DEFAULT_LANDING = {
  waiter: '/app/tables',
  kitchen: '/app/kitchen',
  cashier: '/app/billing',
  hotel_desk: '/app/hotel',
};

export function landingFor(role) {
  return DEFAULT_LANDING[role] || '/app/dashboard';
}

export function routesForRole(role) {
  const sections = NAV[role] || NAV.owner;
  return sections.flatMap((s) => s.links.map((l) => l.to));
}
