const VARIANT_CLASS = {
  kpi: 'skel-kpi',
  card: 'skel-card',
  row: 'skel-row',
  text: 'skel-text',
};

export default function Skeleton({ variant = 'text', count = 1, className = '' }) {
  const cls = VARIANT_CLASS[variant] || VARIANT_CLASS.text;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`shimmer skel ${cls} ${className}`} aria-hidden="true" />
      ))}
    </>
  );
}
