import { useEffect, useMemo, useState } from 'react';

// A tiny insertion sort that plays once on the home page — the site's one
// "look, it moves" moment. Respects prefers-reduced-motion (starts sorted).
const START = [5, 2, 8, 1, 9, 3];
const W = 60; // tile slot width in px

type Step = { order: number[]; active: number | null; done: number; caption: string };

function buildSteps(): Step[] {
  // order[k] = id of the value sitting in slot k; ids are indexes into START
  const order = START.map((_, i) => i);
  const steps: Step[] = [{ order: [...order], active: null, done: 1, caption: 'ส่วนซ้ายสุด 1 ช่องถือว่าเรียงแล้ว' }];
  for (let i = 1; i < order.length; i++) {
    const id = order[i];
    steps.push({ order: [...order], active: id, done: i, caption: `หยิบ ${START[id]} ขึ้นมา แล้วหาที่แทรกทางซ้าย` });
    let j = i;
    while (j > 0 && START[order[j - 1]] > START[id]) {
      [order[j - 1], order[j]] = [order[j], order[j - 1]];
      j--;
      steps.push({ order: [...order], active: id, done: i, caption: `${START[order[j + 1]]} มากกว่า ${START[id]} — เลื่อน ${START[id]} ไปซ้าย` });
    }
    steps.push({ order: [...order], active: null, done: i + 1, caption: `วาง ${START[id]} ลงช่อง ${j} ได้แล้ว` });
  }
  steps.push({ order: [...order], active: null, done: order.length, caption: 'เรียงเสร็จ — นี่คือ insertion sort ที่จะได้เล่นแบบทีละขั้นในบทที่ 2' });
  return steps;
}

export default function HeroSort() {
  const steps = useMemo(buildSteps, []);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [k, setK] = useState(reduce ? steps.length - 1 : 0);
  const [run, setRun] = useState(!reduce);

  useEffect(() => {
    if (!run) return;
    if (k >= steps.length - 1) { setRun(false); return; }
    const t = setTimeout(() => setK(k + 1), k === 0 ? 900 : 700);
    return () => clearTimeout(t);
  }, [k, run, steps.length]);

  const s = steps[k];
  return (
    <div className="card hero-sort" aria-label="ตัวอย่าง insertion sort">
      <div className="row">
        <span className="small muted">insertion sort</span>
        <button className="btn small ghost" onClick={() => { setK(0); setRun(true); }}>เล่นอีกครั้ง</button>
      </div>
      <div className="tiles" style={{ maxWidth: START.length * W }}>
        {START.map((v, id) => {
          const slot = s.order.indexOf(id);
          return (
            <div key={id} className={`tile ${s.active === id ? 'active' : ''} ${slot < s.done && s.active !== id ? 'done' : ''}`} style={{ left: `${(slot * 100) / START.length}%` }}>
              {v}
            </div>
          );
        })}
      </div>
      <div className="caption" aria-live="polite">{s.caption}</div>
    </div>
  );
}
