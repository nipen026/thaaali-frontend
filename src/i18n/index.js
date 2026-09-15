import common from './dict/common';
import chrome from './dict/chrome';
import dashboard from './dict/dashboard';
import tables from './dict/tables';
import orders from './dict/orders';
import kitchen from './dict/kitchen';
import menu from './dict/menu';
import billing from './dict/billing';
import inventory from './dict/inventory';
import staff from './dict/staff';
import attendance from './dict/attendance';
import hotel from './dict/hotel';
import analytics from './dict/analytics';
import ledger from './dict/ledger';
import setup from './dict/setup';
import landing from './dict/landing';
import auth from './dict/auth';

// Every per-domain dictionary gets merged into one { [langCode]: { [key]: string } }
// map. Domains are additive — two files can't collide unless they reuse the exact same
// key, which they shouldn't (each domain namespaces its keys, e.g. 'dashboard.title').
const DOMAINS = [
  common, chrome, dashboard, tables, orders, kitchen, menu, billing,
  inventory, staff, attendance, hotel, analytics, ledger, setup, landing, auth,
];

const TRANSLATIONS = {};
for (const domain of DOMAINS) {
  for (const lang of Object.keys(domain)) {
    TRANSLATIONS[lang] = Object.assign(TRANSLATIONS[lang] || {}, domain[lang]);
  }
}

// Falls back lang -> English -> the caller-supplied fallback -> the raw key itself,
// so a still-untranslated string never renders as blank.
export function translate(lang, key, fallback) {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || fallback || key;
}

export { TRANSLATIONS };
