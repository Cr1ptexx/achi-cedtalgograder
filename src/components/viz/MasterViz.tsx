import { useState } from 'react';

const PRESETS: { label: string; a: number; b: number; d: number }[] = [
  { label: 'Merge sort', a: 2, b: 2, d: 1 },
  { label: 'Binary search', a: 1, b: 2, d: 0 },
  { label: 'Karatsuba', a: 3, b: 2, d: 1 },
  { label: 'แบ่ง 4 งานย่อย', a: 4, b: 2, d: 2 },
  { label: 'งานบนสุดหนัก', a: 2, b: 2, d: 2 },
];
const LEVELS = 6;

const fmt = (x: number) => (x >= 1e7 ? x.toExponential(2).replace('e+', '×10^') : Math.round(x).toLocaleString('en-US'));

export default function MasterViz() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [d, setD] = useState(1);

  const c = Math.log(a) / Math.log(b);
  const r = a / Math.pow(b, d); // work ratio between consecutive levels
  const eps = 1e-9;
  const cmp = Math.abs(c - d) < eps ? 'eq' : c > d ? 'leaf' : 'root';
  const cs = Number.isInteger(+c.toFixed(6)) ? `${+c.toFixed(6)}` : c.toFixed(3);

  // level k: a^k calls, each does (n / b^k)^d work, with n = b^(LEVELS-1)
  const n = Math.pow(b, LEVELS - 1);
  const work = Array.from({ length: LEVELS }, (_, k) => Math.pow(a, k) * Math.pow(n / Math.pow(b, k), d));
  const max = Math.max(...work);

  const pw = (e: number | string) => (String(e) === '1' ? 'n' : `n^${e}`);
const tn = d === 0 ? '1' : pw(d);
  let result: string;
  let why: string;
  if (cmp === 'leaf') {
    result = `Θ(${pw(cs)})`;
    why = `c = log_${b}(${a}) = ${cs} มากกว่า d = ${d} → งานรวมของแต่ละชั้นเพิ่มขึ้นเมื่อลงลึก ชั้นใบหนักสุดและชนะ`;
  } else if (cmp === 'eq') {
    result = d === 0 ? 'Θ(log n)' : `Θ(${pw(d)} · log n)`;
    why = `c = d = ${d} → ทุกชั้นทำงานเท่ากัน มี log_${b}(n) ชั้น จึงคูณด้วย log n`;
  } else {
    result = d === 0 ? 'Θ(1)' : `Θ(${pw(d)})`;
    why = `c = ${cs} น้อยกว่า d = ${d} → งานรวมของแต่ละชั้นลดลงเมื่อลงลึก ชั้นบนสุดหนักสุดและชนะ`;
  }

  return (
    <div className="viz">
      <div className="viz-options">
        <div className="seg" role="group" aria-label="ตัวอย่างสำเร็จรูป">
          {PRESETS.map((p) => (
            <button key={p.label} className={a === p.a && b === p.b && d === p.d ? 'on' : ''} onClick={() => { setA(p.a); setB(p.b); setD(p.d); }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="ctl" style={{ marginBottom: 8 }}>
          <label>a (จำนวนงานย่อย)
            <input className="input" type="number" min={1} max={8} value={a} style={{ width: 70 }} onChange={(e) => setA(Math.min(8, Math.max(1, +e.target.value || 1)))} />
          </label>
          <label>b (ตัวหารขนาด)
            <input className="input" type="number" min={2} max={6} value={b} style={{ width: 70 }} onChange={(e) => setB(Math.min(6, Math.max(2, +e.target.value || 2)))} />
          </label>
          <label>d (งานต่อโหนด = n^d)
            <input className="input" type="number" min={0} max={3} value={d} style={{ width: 70 }} onChange={(e) => setD(Math.min(3, Math.max(0, +e.target.value || 0)))} />
          </label>
        </div>
        <p className="mono" style={{ fontSize: '1.05rem', margin: '8px 0' }}>T(n) = {a === 1 ? '' : `${a}·`}T(n/{b}) + {tn}</p>
      </div>

      <div className="stage">
        <div>
          <p className="small muted" style={{ margin: '0 0 8px' }}>งานรวมในแต่ละชั้นของ recursion tree (ตัวอย่างที่ n = {b}^{LEVELS - 1} = {n.toLocaleString('en-US')})</p>
          <div style={{ display: 'grid', gap: 6 }}>
            {work.map((w, k) => (
              <div key={k} className="mlvl">
                <span>ชั้น {k} <span className="muted">×{Math.pow(a, k).toLocaleString('en-US')}</span></span>
                <div className="mlvl-bar" style={{ width: `${Math.max(1.5, (w / max) * 100)}%` }} />
                <span>{fmt(w)}</span>
              </div>
            ))}
          </div>
          <p className="small muted" style={{ margin: '8px 0 0' }}>อัตราส่วนระหว่างชั้น = a / b^d = {a} / {Math.pow(b, d)} = {r.toFixed(3)} ({r > 1 + eps ? 'เพิ่มขึ้นทุกชั้น' : r < 1 - eps ? 'ลดลงทุกชั้น' : 'เท่ากันทุกชั้น'})</p>
        </div>
        <div className="verdict" aria-live="polite">
          <div className="small muted">กรณีของ Master Theorem</div>
          <div style={{ font: '700 1.35rem var(--mono)', margin: '4px 0' }}>T(n) = {result}</div>
          <div>{why}</div>
        </div>
      </div>
    </div>
  );
}
