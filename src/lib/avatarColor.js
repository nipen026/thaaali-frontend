// Deterministic per-item "random" color for the initials avatars that replaced menu item
// emoji/images — hashed from the item's id (falling back to its name) so the color is stable
// across reloads instead of re-randomizing on every render. Reuses the app's existing badge
// color pairs (see .bg-* in index.css) rather than inventing a new palette.
const PALETTE = [
  { bg: 'var(--saffron-50)', fg: 'var(--saffron-dark)' },
  { bg: 'var(--jade-50)', fg: 'var(--jade)' },
  { bg: 'var(--sky-50)', fg: 'var(--sky)' },
  { bg: 'var(--amber-50)', fg: '#92400e' },
  { bg: 'var(--purple-50)', fg: 'var(--purple)' },
  { bg: 'var(--crimson-50)', fg: 'var(--crimson)' },
];

// djb2 string hash
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function avatarColor(seed) {
  return PALETTE[hash(String(seed || '')) % PALETTE.length];
}

export function initials(name) {
  return (name || '').trim().slice(0, 2).toUpperCase();
}
