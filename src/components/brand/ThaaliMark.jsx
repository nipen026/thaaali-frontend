import { useId } from 'react';

/**
 * The THAAALI logomark: a stylized thali (the round, compartmented platter the
 * product is named for) — an outer rim, an inner plate edge, three small katori
 * (bowl) dots around it, and the थ glyph (the first sound of "thali") at the
 * center. Pure SVG so it stays crisp at any size, from a 24px sidebar icon up
 * to a 90px auth-panel hero mark.
 */
export default function ThaaliMark({ size = 40, className, style }) {
  const gid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="THAAALI"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id={`thaali-mark-g-${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8A3D" />
          <stop offset="100%" stopColor="#D45700" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#thaali-mark-g-${gid})`} />
      <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,.32)" strokeWidth="2" />
      <circle cx="50" cy="19.5" r="5" fill="rgba(255,255,255,.55)" />
      <circle cx="75.5" cy="65" r="5" fill="rgba(255,255,255,.55)" />
      <circle cx="24.5" cy="65" r="5" fill="rgba(255,255,255,.55)" />
      <text
        x="50" y="61"
        textAnchor="middle"
        fontFamily="'Sora', sans-serif"
        fontWeight="800"
        fontSize="40"
        fill="white"
      >
        थ
      </text>
    </svg>
  );
}
