import { avatarColor, initials } from '../../lib/avatarColor';

// Replaces the old emoji/image thumbnail on menu items — a two-letter initials badge on a
// per-item color, stable across reloads (see lib/avatarColor.js).
export default function ItemAvatar({ id, name, size = 40 }) {
  const { bg, fg } = avatarColor(id || name);
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, color: fg, fontWeight: 800, fontSize: size * 0.38,
        fontFamily: 'var(--font-d)', letterSpacing: '.01em',
      }}
    >
      {initials(name)}
    </div>
  );
}
