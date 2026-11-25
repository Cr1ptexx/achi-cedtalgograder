import { useMemo, useState } from 'react';
import { CodePanel, StepperControls } from './Stepper';
import { useStepper } from './useStepper';

type Mode = 'perm' | 'prune' | 'combi' | 'combik';
type Kind = 'start' | 'call' | 'pick' | 'back' | 'emit' | 'skip' | 'prune' | 'done';
type Frame = {
  sol: (number | null)[];
  used: boolean[];
  depth: number;
  focus: number | null;
  kind: Kind;
  line: string;
  msg: string;
  out: string[];
  vars: [string, string | number][];
};

const MODES: { id: Mode; label: string }[] = [
  { id: 'perm', label: 'Permutation' },
  { id: 'prune', label: 'Permutation + เงื่อนไข' },
  { id: 'combi', label: 'Combination (0/1)' },
  { id: 'combik', label: 'เลือกพอดี k ชิ้น' },
];

// "a must come before b" pairs, like the Permutation with Constraint problem.
const PAIRS: [number, number][] = [[1, 3], [2, 0]];

const CODE: Record<Mode, [string, string][]> = {
  perm: [
    ['head', 'void gen(int step) {'],
    ['base', '  if (step == n) { print(sol); return; }'],
    ['loop', '  for (int x = 0; x < n; x++) {'],
    ['used', '    if (used[x]) continue;'],
    ['pick', '    used[x] = true;  sol[step] = x;'],
    ['call', '    gen(step + 1);'],
    ['back', '    used[x] = false;'],
    ['end', '  }'],
    ['close', '}'],
  ],
  prune: [
    ['head', 'void gen(int step) {'],
    ['base', '  if (step == n) { print(sol); return; }'],
    ['loop', '  for (int x = 0; x < n; x++) {'],
    ['used', '    if (used[x]) continue;'],
    ['prune', '    if (need[x] != -1 && !used[need[x]]) continue;'],
    ['pick', '    used[x] = true;  sol[step] = x;'],
    ['call', '    gen(step + 1);'],
    ['back', '    used[x] = false;'],
    ['end', '  }'],
    ['close', '}'],
  ],
  combi: [
    ['head', 'void combi(int len) {'],
    ['base', '  if (len == n) { print(sol); return; }'],
    ['try0', '  sol[len] = 0;  combi(len + 1);'],
    ['try1', '  sol[len] = 1;  combi(len + 1);'],
    ['close', '}'],
  ],
  combik: [
    ['head', 'void combi(int len, int chosen) {'],
    ['base', '  if (len == n) { print(sol); return; }'],
    ['can0', '  if (n - len > k - chosen)      // ช่องที่เหลือยังพอ'],
    ['try0', '    { sol[len] = 0;  combi(len + 1, chosen); }'],
    ['can1', '  if (chosen < k)                // ยังหยิบได้'],
    ['try1', '    { sol[len] = 1;  combi(len + 1, chosen + 1); }'],
    ['close', '}'],
  ],
};

function buildFrames(mode: Mode, n: number, k: number): Frame[] {
  const frames: Frame[] = [];
  const sol: (number | null)[] = Array(n).fill(null);
  const used = Array(n).fill(false);
  const out: string[] = [];
  const push = (kind: Kind, line: string, depth: number, focus: number | null, msg: string, vars: [string, string | number][]) =>
    frames.push({ sol: [...sol], used: [...used], depth, focus, kind, line, msg, out: [...out], vars });

  if (mode === 'perm' || mode === 'prune') {
    const need = Array(n).fill(-1);
    if (mode === 'prune') PAIRS.forEach(([a, b]) => { if (a < n && b < n) need[b] = a; });
    push('start', 'head', 0, null, `เรียก gen(0) — มีช่องว่าง ${n} ช่องรอเติม`, [['step', 0]]);
    const gen = (step: number) => {
      if (step === n) {
        out.push(sol.join(' '));
        push('emit', 'base', step, null, `step == n แปลว่าเติมครบแล้ว → พิมพ์ "${sol.join(' ')}" แล้วกลับขึ้นไป`, [['step', step]]);
        return;
      }
      for (let x = 0; x < n; x++) {
        if (used[x]) {
          push('skip', 'used', step, x, `ช่อง ${step}: เลข ${x} ถูกใช้ไปแล้วในกิ่งนี้ ข้าม`, [['step', step], ['x', x]]);
          continue;
        }
        if (mode === 'prune' && need[x] !== -1 && !used[need[x]]) {
          push('prune', 'prune', step, x, `ช่อง ${step}: วาง ${x} ไม่ได้ เพราะ ${need[x]} ต้องมาก่อน ${x} แต่ยังไม่ถูกวาง → ตัดกิ่งนี้ทิ้งทันที`, [['step', step], ['x', x], [`need[${x}]`, need[x]]]);
          continue;
        }
        used[x] = true; sol[step] = x;
        push('pick', 'pick', step, x, `วาง ${x} ลงช่อง ${step} และจดว่า ${x} ถูกใช้แล้ว`, [['step', step], ['x', x]]);
        push('call', 'call', step + 1, x, `ลงไปเติมช่องถัดไป: เรียก gen(${step + 1})`, [['step', step], ['x', x]]);
        gen(step + 1);
        used[x] = false; sol[step] = null;
        push('back', 'back', step, x, `กลับมาจาก gen(${step + 1}) → คืนเลข ${x} ให้ใช้ได้อีก แล้วลองเลขถัดไปในช่อง ${step}`, [['step', step], ['x', x]]);
      }
    };
    gen(0);
  } else {
    const exact = mode === 'combik';
    push('start', 'head', 0, null, exact ? `เลือกพอดี ${k} จาก ${n} ชิ้น: ตัดสินใจทีละชิ้นว่าหยิบ (1) หรือไม่หยิบ (0)` : `ของ ${n} ชิ้น ตัดสินใจทีละชิ้นว่าหยิบ (1) หรือไม่หยิบ (0)`, [['len', 0]]);
    const rec = (len: number, chosen: number) => {
      const v: [string, string | number][] = exact ? [['len', len], ['chosen', chosen], ['k', k]] : [['len', len]];
      if (len === n) {
        out.push(sol.join(''));
        push('emit', 'base', len, null, `ตัดสินใจครบ ${n} ชิ้น → พิมพ์ ${sol.join('')}`, v);
        return;
      }
      if (!exact || n - len > k - chosen) {
        sol[len] = 0;
        push('pick', 'try0', len, len, `ชิ้นที่ ${len}: ลองไม่หยิบ (0)`, v);
        rec(len + 1, chosen);
      } else {
        push('prune', 'can0', len, len, `ชิ้นที่ ${len}: ห้ามไม่หยิบ เพราะเหลือ ${n - len} ช่อง แต่ยังต้องหยิบอีก ${k - chosen} ชิ้น`, v);
      }
      if (!exact || chosen < k) {
        sol[len] = 1;
        push('pick', 'try1', len, len, `ชิ้นที่ ${len}: ลองหยิบ (1)`, exact ? [['len', len], ['chosen', chosen + 1], ['k', k]] : v);
        rec(len + 1, chosen + 1);
      } else {
        push('prune', 'can1', len, len, `ชิ้นที่ ${len}: หยิบไม่ได้แล้ว เพราะหยิบครบ ${k} ชิ้น`, v);
      }
      sol[len] = null;
      push('back', 'close', len, len, `ลองครบทั้งสองทางของชิ้นที่ ${len} แล้ว → กลับขึ้นไป`, v);
    };
    rec(0, 0);
  }
  push('done', 'close', 0, null, `จบ — ได้ทั้งหมด ${out.length} แบบ`, []);
  return frames;
}

const NOTE_CLASS: Partial<Record<Kind, string>> = { emit: 'good', prune: 'bad', back: 'back', done: 'good' };

export default function PermutationViz() {
  const [mode, setMode] = useState<Mode>('perm');
  const [n, setN] = useState(3);
  const [k, setK] = useState(2);
  const isPerm = mode === 'perm' || mode === 'prune';
  const nn = mode === 'prune' ? 4 : n;
  const kk = Math.min(k, nn);
  const frames = useMemo(() => buildFrames(mode, nn, kk), [mode, nn, kk]);
  const s = useStepper(frames.length, `${mode}-${nn}-${kk}`);
  const f = frames[s.i];
  const lines = CODE[mode];
  const active = lines.findIndex(([key]) => key === f.line);

  return (
    <div className="viz" tabIndex={0} onKeyDown={s.onKeyDown} aria-label="ตัวจำลองการสร้างคำตอบทุกแบบ">
      <div className="viz-options">
        <div className="seg" role="group" aria-label="รูปแบบ">
          {MODES.map((m) => <button key={m.id} className={mode === m.id ? 'on' : ''} onClick={() => setMode(m.id)}>{m.label}</button>)}
        </div>
        {mode !== 'prune' && (
          <label>n
            <select className="select" value={n} onChange={(e) => setN(+e.target.value)}>
              {[2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        )}
        {mode === 'combik' && (
          <label>k
            <select className="select" value={kk} onChange={(e) => setK(+e.target.value)}>
              {Array.from({ length: nn + 1 }, (_, v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        )}
        {mode === 'prune' && <span className="small muted">n = 4 · เงื่อนไข: 1 ต้องมาก่อน 3 และ 2 ต้องมาก่อน 0</span>}
      </div>

      <div className="viz-grid">
        <div className="viz-stage">
          <div className="perm-board">
            <div>
              <div className="label">ช่องคำตอบ sol[]</div>
              <div className="slots">
                {f.sol.map((v, idx) => (
                  <div key={idx} className={`slot ${idx === f.depth && f.kind !== 'done' && f.kind !== 'emit' ? 'active' : ''} ${v !== null ? 'filled' : ''}`}>
                    <span className="slot-idx">{idx}</span>{v ?? ''}
                  </div>
                ))}
              </div>
            </div>
            {isPerm && (
              <div>
                <div className="label">เลขที่ยังใช้ได้ (ขีดฆ่า = used)</div>
                <div className="chips">
                  {f.used.map((u, x) => (
                    <span key={x} className={`chip ${u ? 'used' : ''} ${f.focus === x ? `focus ${f.kind}` : ''}`}>{x}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="stack" aria-label="call stack">
              <div className="label">call stack (บนสุด = ที่กำลังทำงาน)</div>
              {Array.from({ length: f.kind === 'done' ? 0 : f.depth + 1 }, (_, d) => (
                <div key={d} className={`frame ${d === f.depth ? 'top' : ''}`} style={{ marginLeft: d * 14 }}>
                  {isPerm ? `gen(${d})` : `combi(${d})`}
                </div>
              ))}
            </div>
          </div>
          <div className={`step-note ${NOTE_CLASS[f.kind] ?? ''}`} aria-live="polite">{f.msg}</div>
        </div>
        <CodePanel title={isPerm ? 'gen — สร้าง permutation' : 'combi — เลือก/ไม่เลือก'} lines={lines.map(([, t]) => t)} active={active} vars={f.vars} />
      </div>

      <StepperControls s={s} />

      <details className="out-list" open>
        <summary>ผลลัพธ์ที่พิมพ์ออกแล้ว ({f.out.length})</summary>
        <div className="out-grid">
          {f.out.map((o, idx) => <span key={idx} className={idx === f.out.length - 1 && f.kind === 'emit' ? 'new' : ''}>{o}</span>)}
        </div>
      </details>
    </div>
  );
}
