import { useEffect, useState } from 'react';

/** Segmented XP bar that fills from 0 on mount, with a light sweep across the filled part. */
export default function XpBar({ value, max, label }: { value: number; max: number; label: string }) {
  const [shown, setShown] = useState(0);
  // start at 0 and grow to the real value so the CSS transition plays; a timer (not requestAnimationFrame)
  // so the bar still fills if the page was opened in a background tab
  useEffect(() => {
    const id = setTimeout(() => setShown(value), 60);
    return () => clearTimeout(id);
  }, [value]);
  const pct = max ? Math.min(100, (shown / max) * 100) : 0;
  return (
    <div className="xp" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className="xp-fill" style={{ width: `${pct}%` }}><i className="xp-sheen" /></div>
    </div>
  );
}
