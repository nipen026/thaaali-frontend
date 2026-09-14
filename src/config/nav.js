import {
  LayoutDashboard, Grid3X3, ClipboardList, Monitor,
  UtensilsCrossed, Wallet, Package, Users, TrendingUp,
  Building2, Store, BookOpen,
} from 'lucide-react';

// Single source of truth for both sidebar rendering (Layout.jsx) and route access
// enforcement (RoleGuard in App.jsx) — a route reachable by a role must appear here,
// or it isn't reachable at all, so the two can never drift apart.
//
// `label` is the English fallback text; `labelKey` looks it up in the active language
// via t(labelKey, label) in Layout.jsx.
export const NAV = {
  owner:[
    {sect:'Restaurant',sectKey:'nav.sectRestaurant',links:[
      {to:'/app/dashboard',Icon:LayoutDashboard,label:'Dashboard',labelKey:'nav.dashboard'},
      {to:'/app/tables',Icon:Grid3X3,label:'Floor & Tables',labelKey:'nav.floorTables'},
      {to:'/app/orders',Icon:ClipboardList,label:'Orders',labelKey:'nav.orders'},
      {to:'/app/kitchen',Icon:Monitor,label:'Kitchen (KDS)',labelKey:'nav.kitchenKds'},
      {to:'/app/menu',Icon:UtensilsCrossed,label:'Menu',labelKey:'nav.menu'},
      {to:'/app/billing',Icon:Wallet,label:'Billing',labelKey:'nav.billing'},
    ]},
    {sect:'Operations',sectKey:'nav.sectOperations',links:[
      {to:'/app/inventory',Icon:Package,label:'Inventory',labelKey:'nav.inventory'},
      {to:'/app/staff',Icon:Users,label:'Staff',labelKey:'nav.staff'},
      {to:'/app/analytics',Icon:TrendingUp,label:'Analytics',labelKey:'nav.analytics'},
      {to:'/app/ledger',Icon:BookOpen,label:'Ledger',labelKey:'nav.ledger'},
    ]},
    {sect:'Hotel',sectKey:'nav.sectHotel',links:[
      {to:'/app/hotel',Icon:Building2,label:'Hotel Module',labelKey:'nav.hotelModule'},
    ]},
    {sect:'Setup',sectKey:'nav.sectSetup',links:[
      {to:'/app/setup/restaurant',Icon:Store,label:'Restaurant Info',labelKey:'nav.restaurantInfo'},
      {to:'/app/setup/tables',Icon:Grid3X3,label:'Tables & Seating',labelKey:'nav.tablesSeating'},
      {to:'/app/setup/menu',Icon:UtensilsCrossed,label:'Menu Setup',labelKey:'nav.menuSetup'},
    ]},
  ],
  restaurant_manager:[
    {sect:'Operations',sectKey:'nav.sectOperations',links:[
      {to:'/app/dashboard',Icon:LayoutDashboard,label:'Dashboard',labelKey:'nav.dashboard'},
      {to:'/app/tables',Icon:Grid3X3,label:'Floor & Tables',labelKey:'nav.floorTables'},
      {to:'/app/orders',Icon:ClipboardList,label:'Orders',labelKey:'nav.orders'},
      {to:'/app/menu',Icon:UtensilsCrossed,label:'Menu',labelKey:'nav.menu'},
      {to:'/app/billing',Icon:Wallet,label:'Billing',labelKey:'nav.billing'},
      {to:'/app/inventory',Icon:Package,label:'Inventory',labelKey:'nav.inventory'},
      {to:'/app/staff',Icon:Users,label:'Staff',labelKey:'nav.staff'},
      {to:'/app/analytics',Icon:TrendingUp,label:'Analytics',labelKey:'nav.analytics'},
      {to:'/app/ledger',Icon:BookOpen,label:'Ledger',labelKey:'nav.ledger'},
    ]},
    {sect:'Setup',sectKey:'nav.sectSetup',links:[
      {to:'/app/setup/tables',Icon:Grid3X3,label:'Tables & Seating',labelKey:'nav.tablesSeating'},
      {to:'/app/setup/menu',Icon:UtensilsCrossed,label:'Menu Setup',labelKey:'nav.menuSetup'},
    ]},
  ],
  hotel_manager:[
    {sect:'Hotel',sectKey:'nav.sectHotel',links:[
      {to:'/app/dashboard',Icon:LayoutDashboard,label:'Dashboard',labelKey:'nav.dashboard'},
      {to:'/app/hotel',Icon:Building2,label:'Hotel Module',labelKey:'nav.hotelModule'},
      {to:'/app/staff',Icon:Users,label:'Staff',labelKey:'nav.staff'},
      {to:'/app/analytics',Icon:TrendingUp,label:'Analytics',labelKey:'nav.analytics'},
    ]},
  ],
  waiter:[
    {sect:'My Work',sectKey:'nav.sectMyWork',links:[
      {to:'/app/tables',Icon:Grid3X3,label:'My Tables',labelKey:'nav.myTables'},
      {to:'/app/orders',Icon:ClipboardList,label:'Active Orders',labelKey:'nav.activeOrders'},
      {to:'/app/menu',Icon:UtensilsCrossed,label:'Menu',labelKey:'nav.menu'},
    ]},
  ],
  cashier:[
    {sect:'Billing',sectKey:'nav.sectBilling',links:[
      {to:'/app/billing',Icon:Wallet,label:'Billing',labelKey:'nav.billing'},
      {to:'/app/orders',Icon:ClipboardList,label:'Orders',labelKey:'nav.orders'},
      {to:'/app/ledger',Icon:BookOpen,label:'Ledger',labelKey:'nav.ledger'},
    ]},
  ],
  kitchen:[
    {sect:'Kitchen',sectKey:'nav.sectKitchen',links:[
      {to:'/app/kitchen',Icon:Monitor,label:'KDS Display',labelKey:'nav.kdsDisplay'},
    ]},
  ],
  hotel_desk:[
    {sect:'Hotel',sectKey:'nav.sectHotel',links:[
      {to:'/app/hotel',Icon:Building2,label:'Hotel Module',labelKey:'nav.hotelModule'},
    ]},
  ],
};

export const PAGE_META = {
  '/app/dashboard':{title:'Dashboard',       titleKey:'nav.dashboard',      sub:'Real-time overview of your operation',                          subKey:'meta.dashboardSub'},
  '/app/tables':   {title:'Floor & Tables',  titleKey:'nav.floorTables',    sub:'Live floor map · Click any table to manage',                     subKey:'meta.tablesSub'},
  '/app/orders':   {title:'Orders',          titleKey:'nav.orders',         sub:'All channels in one view',                                       subKey:'meta.ordersSub'},
  '/app/kitchen':  {title:'Kitchen Display', titleKey:'meta.kitchenTitle',  sub:'Live KDS · Real-time updates',                                   subKey:'meta.kitchenSub'},
  '/app/menu':     {title:'Menu Management', titleKey:'meta.menuTitle',     sub:'Items, pricing, filters, availability',                          subKey:'meta.menuSub'},
  '/app/billing':  {title:'Billing',         titleKey:'nav.billing',        sub:'GST-ready · UPI · Card · Cash · Split',                          subKey:'meta.billingSub'},
  '/app/inventory':{title:'Inventory',       titleKey:'nav.inventory',      sub:'Stock levels · Low-stock alerts',                                subKey:'meta.inventorySub'},
  '/app/staff':    {title:'Staff',           titleKey:'nav.staff',          sub:'Team overview · Shift management',                               subKey:'meta.staffSub'},
  '/app/hotel':    {title:'Hotel Module',    titleKey:'nav.hotelModule',    sub:'Rooms · Reservations · Housekeeping',                            subKey:'meta.hotelSub'},
  '/app/analytics':{title:'Analytics',       titleKey:'nav.analytics',      sub:'Revenue trends · Channel split · Top dishes',                    subKey:'meta.analyticsSub'},
  '/app/ledger':   {title:'Ledger',          titleKey:'nav.ledger',         sub:'Full financial reports · Payment methods · Top sellers',         subKey:'meta.ledgerSub'},
  '/app/setup/restaurant':{title:'Restaurant Info', titleKey:'nav.restaurantInfo', sub:'Business details, currency & tax settings',                subKey:'meta.restaurantInfoSub'},
  '/app/setup/tables':    {title:'Tables & Seating', titleKey:'nav.tablesSeating',  sub:'Add or remove tables and configure seating',                subKey:'meta.tablesSetupSub'},
  '/app/setup/menu':      {title:'Menu Setup',       titleKey:'nav.menuSetup',      sub:'Add menu items manually or scan an existing menu',          subKey:'meta.menuSetupSub'},
  '/app/profile':         {title:'Profile',          titleKey:'common.profile',     sub:'Your account details',                                       subKey:'meta.profileSub'},
  '/app/settings':        {title:'Settings',         titleKey:'common.settings',    sub:'Appearance and preferences',                                 subKey:'meta.settingsSub'},
};

// Reachable by every role regardless of NAV — opened from the user menu, not the sidebar.
export const UNIVERSAL_ROUTES = ['/app/profile', '/app/settings'];

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
