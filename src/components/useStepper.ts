import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';

export function useStepper(total: number, resetKey: unknown) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);

  useEffect(() => { setI(0); setPlaying(false); }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    if (i >= total - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, total - 1)), speed);
    return () => clearTimeout(t);
  }, [playing, i, total, speed]);

  const next = useCallback(() => { setPlaying(false); setI((x) => Math.min(total - 1, x + 1)); }, [total]);
  const prev = useCallback(() => { setPlaying(false); setI((x) => Math.max(0, x - 1)); }, []);
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p) setI((x) => (x >= total - 1 ? 0 : x)); // replay from the start when at the end
      return !p;
    });
  }, [total]);

  /** Attach to the visualizer container (it is focusable). */
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === ' ') { e.preventDefault(); toggle(); }
    else if (e.key === 'Home') { e.preventDefault(); setPlaying(false); setI(0); }
    else if (e.key === 'End') { e.preventDefault(); setPlaying(false); setI(total - 1); }
  }, [next, prev, toggle, total]);

  return { i, setI, playing, setPlaying, speed, setSpeed, total, next, prev, toggle, onKeyDown };
}
