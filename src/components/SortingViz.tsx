import { useMemo, useState } from 'react';
import { CodePanel, StepperControls } from './Stepper';
import { useStepper } from './useStepper';

type Algo = 'selection' | 'insertion' | 'shell' | 'merge' | 'quick';
type Frame = {
  arr: number[];
  cmp: number[];
  hit: number[];   // positions just written / swapped
  done: number[];  // positions known to be final
  range?: [number, number];
  line: number;
  msg: string;
  comps: number;
  moves: number;
  vars: [string, string | number][];
};

const NAMES: Record<Algo, string> = {
  selection: 'Selection', insertion: 'Insertion', shell: 'Shell', merge: 'Merge', quick: 'Quick',
};

// Same shape as the code in the concept cards / course slides.
const CODE: Record<Algo, string[]> = {
  selection: [
    'for (pos = n-1; pos > 0; pos--) {',
    '  mx = 0;',
    '  for (i = 1; i <= pos; i++)',
    '    if (A[i] > A[mx]) mx = i;',
    '  swap(A[pos], A[mx]);',
    '}',
  ],
  insertion: [
    'for (pos = n-2; pos >= 0; pos--) {',
    '  tmp = A[pos];  i = pos + 1;',
    '  while (i < n && A[i] < tmp) {',
    '    A[i-1] = A[i];  i++;',
    '  }',
    '  A[i-1] = tmp;',
    '}',
  ],
  shell: [
    'for (G : {4, 2, 1})',
    '  for (i = G; i < n; i++) {',
    '    tmp = A[i];  j = i;',
    '    while (j >= G && A[j-G] > tmp) {',
    '      A[j] = A[j-G];  j -= G;',
    '    }',
    '    A[j] = tmp;',
    '  }',
  ],
  merge: [
    'void msort(lo, hi) {        // [lo, hi)',
    '  if (hi - lo <= 1) return;',
    '  mid = (lo + hi) / 2;',
    '  msort(lo, mid);  msort(mid, hi);',
    '  while (ทั้งสองฝั่งยังมีของ)',
    '    A[k++] = หัวแถวที่น้อยกว่า;',
    '  คัดลอกของที่เหลือ',
    '}',
  ],
  quick: [
    'void qsort(lo, hi) {',
    '  if (lo >= hi) return;',
    '  p = A[hi];  i = lo;',
    '  for (j = lo; j < hi; j++)',
    '    if (A[j] < p) swap(A[i++], A[j]);',
    '  swap(A[i], A[hi]);',
    '  qsort(lo, i-1);  qsort(i+1, hi);',
    '}',
  ],
};

const NOTE: Partial<Record<Algo, string>> = {
  merge: 'merge sort กับ quick sort อยู่ในบท Divide & Conquer ดูไว้ล่วงหน้าได้',
  quick: 'merge sort กับ quick sort อยู่ในบท Divide & Conquer ดูไว้ล่วงหน้าได้',
};

function frames(algo: Algo, input: number[]): Frame[] {
  const a = [...input];
  const n = a.length;
  const out: Frame[] = [];
  let comps = 0, moves = 0;
  const done = new Set<number>();
  const f = (line: number, msg: string, vars: [string, string | number][] = [], cmp: number[] = [], hit: number[] = [], range?: [number, number]) =>
    out.push({ arr: [...a], cmp, hit, done: [...done], range, line, msg, comps, moves, vars });

  f(-1, 'เริ่มต้น — กด ▶ เพื่อดูทีละขั้น');

  if (algo === 'selection') {
    for (let pos = n - 1; pos > 0; pos--) {
      let mx = 0;
      f(1, `รอบ pos = ${pos}: เริ่มสมมติว่าตัวมากสุดอยู่ที่ตำแหน่ง 0`, [['pos', pos], ['mx', mx]], [0], [], [0, pos]);
      for (let i = 1; i <= pos; i++) {
        comps++;
        const bigger = a[i] > a[mx];
        f(3, `เทียบ A[${i}] = ${a[i]} กับตัวมากสุดตอนนี้ A[${mx}] = ${a[mx]}${bigger ? ' → มากกว่า ย้าย mx มาที่นี่' : ''}`,
          [['pos', pos], ['i', i], ['mx', bigger ? i : mx]], [mx, i], [], [0, pos]);
        if (bigger) mx = i;
      }
      [a[pos], a[mx]] = [a[mx], a[pos]]; moves++;
      done.add(pos);
      f(4, `swap ตัวมากสุด ${a[pos]} ไปไว้ท้ายส่วนที่ยังไม่เรียง (ตำแหน่ง ${pos})`, [['pos', pos], ['mx', mx]], [], [pos, mx]);
    }
    done.add(0);
  } else if (algo === 'insertion') {
    done.add(n - 1);
    for (let pos = n - 2; pos >= 0; pos--) {
      const tmp = a[pos];
      let i = pos + 1;
      f(1, `หยิบ tmp = ${tmp} (ตำแหน่ง ${pos}) ไปแทรกในส่วนที่เรียงแล้วทางขวา`, [['pos', pos], ['tmp', tmp], ['i', i]], [pos], [], [pos, n - 1]);
      while (i < n) {
        comps++;
        const less = a[i] < tmp;
        f(2, `A[${i}] = ${a[i]} < ${tmp} ?${less ? ' ใช่' : ' ไม่ใช่ → หยุดเลื่อน'}`, [['pos', pos], ['tmp', tmp], ['i', i]], [i], [], [pos, n - 1]);
        if (!less) break;
        a[i - 1] = a[i]; moves++;
        f(3, `เลื่อน ${a[i]} มาทางซ้าย 1 ช่อง`, [['pos', pos], ['tmp', tmp], ['i', i + 1]], [], [i - 1], [pos, n - 1]);
        i++;
      }
      a[i - 1] = tmp;
      for (let q = pos; q < n; q++) done.add(q);
      f(5, `วาง ${tmp} ที่ตำแหน่ง ${i - 1} — ส่วน [${pos}..${n - 1}] เรียงแล้ว`, [['pos', pos], ['tmp', tmp], ['i', i]], [], [i - 1], [pos, n - 1]);
    }
  } else if (algo === 'shell') {
    const gaps = [4, 2, 1].filter((g) => g < n);
    for (const G of gaps) {
      f(0, `รอบ G = ${G}: ตัวที่ห่างกัน ${G} ช่องถือเป็นกลุ่มเดียวกัน แล้ว insertion sort ในกลุ่ม`, [['G', G]]);
      for (let i = G; i < n; i++) {
        const tmp = a[i];
        let j = i;
        f(2, `G = ${G}: หยิบ tmp = ${tmp} (ตำแหน่ง ${i})`, [['G', G], ['i', i], ['j', j], ['tmp', tmp]], [i]);
        while (j >= G) {
          comps++;
          const bigger = a[j - G] > tmp;
          f(3, `A[${j - G}] = ${a[j - G]} > ${tmp} ?${bigger ? ' ใช่' : ' ไม่ใช่ → หยุด'}`, [['G', G], ['i', i], ['j', j], ['tmp', tmp]], [j - G, j]);
          if (!bigger) break;
          a[j] = a[j - G]; moves++;
          f(4, `เลื่อน ${a[j]} ไปข้างหลัง ${G} ช่อง`, [['G', G], ['i', i], ['j', j - G], ['tmp', tmp]], [], [j]);
          j -= G;
        }
        a[j] = tmp;
        if (j !== i) f(6, `วาง ${tmp} ที่ตำแหน่ง ${j}`, [['G', G], ['i', i], ['j', j]], [], [j]);
      }
      if (G === 1) a.forEach((_, q) => done.add(q));
    }
  } else if (algo === 'merge') {
    const rec = (lo: number, hi: number) => {
      if (hi - lo <= 1) return;
      const mid = (lo + hi) >> 1;
      f(3, `แบ่ง [${lo}..${hi - 1}] เป็น [${lo}..${mid - 1}] กับ [${mid}..${hi - 1}]`, [['lo', lo], ['mid', mid], ['hi', hi]], [], [], [lo, hi - 1]);
      rec(lo, mid); rec(mid, hi);
      const L = a.slice(lo, mid), R = a.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) {
        comps++;
        f(4, `รวม: เทียบหัวแถวซ้าย ${L[i]} กับหัวแถวขวา ${R[j]}`, [['lo', lo], ['hi', hi], ['k', k]], [], [], [lo, hi - 1]);
        a[k++] = L[i] <= R[j] ? L[i++] : R[j++]; moves++;
        f(5, `เขียนตัวที่น้อยกว่าลงตำแหน่ง ${k - 1}`, [['lo', lo], ['hi', hi], ['k', k]], [], [k - 1], [lo, hi - 1]);
      }
      while (i < L.length) { a[k++] = L[i++]; moves++; }
      while (j < R.length) { a[k++] = R[j++]; moves++; }
      f(6, `รวม [${lo}..${hi - 1}] เสร็จ`, [['lo', lo], ['hi', hi]], [], [], [lo, hi - 1]);
    };
    rec(0, n);
    a.forEach((_, q) => done.add(q));
  } else {
    const rec = (lo: number, hi: number) => {
      if (lo >= hi) { if (lo === hi) done.add(lo); return; }
      const p = a[hi];
      f(2, `เลือก pivot p = ${p} (ตัวขวาสุดของ [${lo}..${hi}])`, [['lo', lo], ['hi', hi], ['p', p]], [hi], [], [lo, hi]);
      let i = lo;
      for (let j = lo; j < hi; j++) {
        comps++;
        const less = a[j] < p;
        f(4, `A[${j}] = ${a[j]} < ${p} ?${less ? ' ใช่ → ย้ายไปฝั่งน้อย' : ''}`, [['lo', lo], ['hi', hi], ['p', p], ['i', i], ['j', j]], [j, hi], [], [lo, hi]);
        if (less) {
          [a[i], a[j]] = [a[j], a[i]]; moves++;
          f(4, `swap แล้ว — ตอนนี้ [${lo}..${i}] น้อยกว่า ${p} ทั้งหมด`, [['lo', lo], ['hi', hi], ['p', p], ['i', i + 1], ['j', j]], [], [i, j], [lo, hi]);
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]]; moves++;
      done.add(i);
      f(5, `วาง pivot ${p} ลงตำแหน่งจริง ${i}`, [['lo', lo], ['hi', hi], ['i', i]], [], [i], [lo, hi]);
      rec(lo, i - 1); rec(i + 1, hi);
    };
    rec(0, n - 1);
    a.forEach((_, q) => done.add(q));
  }
  f(-1, `เรียงเสร็จ — เทียบ ${comps} ครั้ง, เลื่อน/สลับ/เขียน ${moves} ครั้ง`);
  return out;
}

const rand = (len = 9) => Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 20));
const PRESETS: { label: string; make: (cur: number[]) => number[] }[] = [
  { label: 'สุ่ม', make: (c) => rand(c.length) },
  { label: 'เรียงแล้ว', make: (c) => [...c].sort((x, y) => x - y) },
  { label: 'กลับด้าน', make: (c) => [...c].sort((x, y) => y - x) },
  {
    label: 'เกือบเรียง',
    make: (c) => {
      const s = [...c].sort((x, y) => x - y);
      for (const i of new Set([1, s.length - 3])) if (i >= 0 && i + 1 < s.length) [s[i], s[i + 1]] = [s[i + 1], s[i]];
      return s;
    },
  },
];

export default function SortingViz() {
  const [algo, setAlgo] = useState<Algo>('selection');
  const [arr, setArr] = useState<number[]>([7, 3, 15, 1, 9, 12, 4, 18, 6]);
  const [text, setText] = useState(arr.join(' '));
  const [err, setErr] = useState('');
  const fr = useMemo(() => frames(algo, arr), [algo, arr]);
  const s = useStepper(fr.length, `${algo}-${arr.join(',')}`);
  const f = fr[s.i];
  const max = Math.max(...arr, 1);

  const applyArr = (next: number[]) => { setArr(next); setText(next.join(' ')); setErr(''); };
  const applyText = () => {
    const nums = text.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (nums.some((x) => !Number.isInteger(x) || x < 1 || x > 99)) return setErr('ใส่จำนวนเต็ม 1–99 คั่นด้วยช่องว่าง');
    if (nums.length < 2 || nums.length > 12) return setErr('ใส่ได้ 2–12 ตัว');
    applyArr(nums);
  };

  return (
    <div className="viz" tabIndex={0} onKeyDown={s.onKeyDown} aria-label="ตัวจำลองการเรียงลำดับ">
      <div className="viz-options">
        <div className="seg" role="group" aria-label="อัลกอริทึม">
          {(Object.keys(NAMES) as Algo[]).map((k) => (
            <button key={k} className={algo === k ? 'on' : ''} onClick={() => setAlgo(k)}>{NAMES[k]}</button>
          ))}
        </div>
      </div>
      <div className="viz-options">
        <form className="array-input" onSubmit={(e) => { e.preventDefault(); applyText(); }}>
          <label htmlFor="arr-in" className="small muted">ข้อมูล</label>
          <input id="arr-in" className="input" value={text} onChange={(e) => setText(e.target.value)} aria-describedby="arr-err" />
          <button className="btn small" type="submit">ใช้ชุดนี้</button>
          {err && <span id="arr-err" className="err">{err}</span>}
        </form>
        <div className="seg" role="group" aria-label="ชุดข้อมูลสำเร็จรูป">
          {PRESETS.map((p) => <button key={p.label} onClick={() => applyArr(p.make(arr))}>{p.label}</button>)}
        </div>
      </div>
      {NOTE[algo] && <p className="small muted" style={{ margin: 0 }}>{NOTE[algo]}</p>}

      <div className="viz-grid">
        <div className="stage">
          <div className="bars" aria-hidden="true">
            {f.arr.map((v, k) => {
              const cls = [
                f.cmp.includes(k) ? 'cmp' : '',
                f.hit.includes(k) ? 'hit' : '',
                f.done.includes(k) ? 'done' : '',
                f.range && (k < f.range[0] || k > f.range[1]) ? 'dim' : '',
              ].join(' ');
              return (
                <div key={k} className={`bar ${cls}`}>
                  <div className="bar-fill" style={{ height: `${(v / max) * 100}%` }} />
                  <span className="bar-v">{v}</span>
                  <span className="bar-i">[{k}]</span>
                </div>
              );
            })}
          </div>
          <div className="counters">
            <span>เทียบ <b>{f.comps}</b> ครั้ง</span>
            <span>เลื่อน/สลับ <b>{f.moves}</b> ครั้ง</span>
            <span className="legend"><i className="lg cmp" />กำลังเทียบ <i className="lg hit" />เพิ่งเปลี่ยน <i className="lg done" />อยู่ที่จริงแล้ว</span>
          </div>
          <div className={`step-note ${s.i === fr.length - 1 ? 'good' : ''}`} aria-live="polite">{f.msg}</div>
        </div>
        <CodePanel title={`${NAMES[algo]} sort`} lines={CODE[algo]} active={f.line >= 0 ? f.line : null} vars={f.vars} />
      </div>

      <StepperControls s={s} />
    </div>
  );
}
