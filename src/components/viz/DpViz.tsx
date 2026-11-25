import { useMemo, useState } from 'react';
import StepShell, { type VFrame } from './StepShell';
import { Grid } from './parts';

type Algo = 'lcs' | 'knap';

const LCS_CODE = [
  'for (i = 1; i <= n; i++)',
  '  for (j = 1; j <= m; j++)',
  '    if (s[i] == t[j])',
  '      L[i][j] = L[i-1][j-1] + 1;',
  '    else',
  '      L[i][j] = max(L[i-1][j], L[i][j-1]);',
  '// ย้อนรอยจาก L[n][m] เพื่อหาสตริงจริง',
  'while (i > 0 && j > 0) { ... }',
];
const KNAP_CODE = [
  'for (i = 1; i <= n; i++)',
  '  for (c = 0; c <= W; c++)',
  '    if (w[i] > c)',
  '      K[i][c] = K[i-1][c];          // ใส่ไม่ได้',
  '    else',
  '      K[i][c] = max(K[i-1][c],      // ไม่ใส่',
  '                    K[i-1][c-w[i]] + v[i]);  // ใส่',
  '// ย้อนรอยดูว่าหยิบชิ้นไหน',
];

type Cell = { v: string | number; cls?: string };
const blank = (r: number, c: number): Cell[][] => Array.from({ length: r }, () => Array.from({ length: c }, () => ({ v: '' })));
const snap = (t: Cell[][]) => t.map((r) => r.map((c) => ({ ...c })));
const mark = (t: Cell[][], pts: [number, number][], cls: string) => { for (const [i, j] of pts) if (t[i]?.[j]) t[i][j].cls = cls; };

function lcsFrames(s: string, t: string): { frames: VFrame[]; rows: string[]; cols: string[] } {
  const n = s.length, m = t.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  const rows = ['∅', ...s.split('')], cols = ['∅', ...t.split('')];
  const tbl = blank(n + 1, m + 1);
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) if (i === 0 || j === 0) tbl[i][j] = { v: 0, cls: 'done' };
  const frames: VFrame[] = [];
  const push = (line: number, msg: string, table: Cell[][], tone?: VFrame['tone'], vars?: VFrame['vars']) =>
    frames.push({ line, msg, tone, vars, stage: <Grid rows={rows} cols={cols} cells={snap(table)} corner="s ↓ t →" /> });
  push(0, 'เติมตาราง L[i][j] = ความยาว LCS ของ s ตัวแรก i ตัว กับ t ตัวแรก j ตัว · แถวและคอลัมน์ 0 คือสตริงว่าง จึงได้ 0', tbl);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const eq = s[i - 1] === t[j - 1];
      L[i][j] = eq ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
      const tmp = snap(tbl);
      mark(tmp, [[i, j]], 'cur');
      mark(tmp, eq ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]], 'dep');
      tmp[i][j].v = L[i][j];
      push(eq ? 3 : 5,
        eq ? `s[${i}] = t[${j}] = '${s[i - 1]}' ตรงกัน → L[${i}][${j}] = L[${i - 1}][${j - 1}] + 1 = ${L[i][j]}`
          : `'${s[i - 1]}' ≠ '${t[j - 1]}' → เอาค่ามากกว่าของด้านบน (${L[i - 1][j]}) กับด้านซ้าย (${L[i][j - 1]}) = ${L[i][j]}`,
        tmp, undefined, [['i', i], ['j', j], ['L[i][j]', L[i][j]]]);
      tbl[i][j] = { v: L[i][j] };
    }
  }
  // trace back
  let i = n, j = m, out = '';
  const path: [number, number][] = [[n, m]];
  const done = snap(tbl);
  push(6, `ตารางเต็มแล้ว L[${n}][${m}] = ${L[n][m]} คือความยาว LCS · ต่อไปย้อนรอยเพื่อหาตัวอักษรจริง`, done, 'back');
  while (i > 0 && j > 0) {
    if (s[i - 1] === t[j - 1]) { out = s[i - 1] + out; i--; j--; }
    else if (L[i - 1][j] >= L[i][j - 1]) i--;
    else j--;
    path.push([i, j]);
    const tmp = snap(tbl);
    mark(tmp, path, 'done');
    push(7, `ย้อนรอย: ไปที่ (${i}, ${j}) · ตัวอักษรที่เก็บได้ตอนนี้ = "${out}"`, tmp, 'back', [['LCS', out || '—']]);
  }
  const fin = snap(tbl); mark(fin, path, 'done');
  push(7, `LCS = "${out}" ยาว ${L[n][m]} ตัว`, fin, 'good', [['LCS', out]]);
  return { frames, rows, cols };
}

const ITEMS = [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }, { w: 5, v: 8 }];

function knapFrames(W: number): { frames: VFrame[]; rows: string[]; cols: number[] } {
  const n = ITEMS.length;
  const K: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  const rows = ['ยังไม่มีชิ้น', ...ITEMS.map((x, k) => `ชิ้น ${k + 1} (w=${x.w}, v=${x.v})`)];
  const cols = Array.from({ length: W + 1 }, (_, c) => c);
  const tbl = blank(n + 1, W + 1);
  for (let c = 0; c <= W; c++) tbl[0][c] = { v: 0, cls: 'done' };
  const frames: VFrame[] = [];
  const push = (line: number, msg: string, table: Cell[][], tone?: VFrame['tone'], vars?: VFrame['vars']) =>
    frames.push({ line, msg, tone, vars, stage: <Grid rows={rows} cols={cols} cells={snap(table)} corner="ชิ้น ↓ ความจุ →" /> });
  push(0, `K[i][c] = มูลค่ามากสุดเมื่อเลือกได้จากชิ้นที่ 1..i และจุของได้ c · ความจุถุง W = ${W} · แถวบนสุดคือยังไม่มีของให้เลือก = 0`, tbl);
  for (let i = 1; i <= n; i++) {
    const { w, v } = ITEMS[i - 1];
    for (let c = 0; c <= W; c++) {
      const skip = K[i - 1][c];
      const take = w <= c ? K[i - 1][c - w] + v : -1;
      K[i][c] = Math.max(skip, take);
      const tmp = snap(tbl);
      mark(tmp, [[i, c]], 'cur');
      mark(tmp, w <= c ? [[i - 1, c], [i - 1, c - w]] : [[i - 1, c]], 'dep');
      tmp[i][c].v = K[i][c];
      push(w > c ? 3 : 6,
        w > c ? `ชิ้น ${i} หนัก ${w} > ความจุ ${c} ใส่ไม่ได้ → ใช้ค่าด้านบน ${skip}`
          : `ไม่ใส่ = ${skip} · ใส่ = K[${i - 1}][${c - w}] + ${v} = ${take} → เลือก ${K[i][c]}`,
        tmp, undefined, [['i', i], ['c', c], ['K[i][c]', K[i][c]]]);
      tbl[i][c] = { v: K[i][c] };
    }
  }
  let c = W;
  const taken: number[] = [];
  const path: [number, number][] = [[n, W]];
  for (let i = n; i >= 1; i--) {
    const took = K[i][c] !== K[i - 1][c];
    if (took) { taken.push(i); c -= ITEMS[i - 1].w; }
    path.push([i - 1, c]);
    const tmp = snap(tbl); mark(tmp, path, 'done');
    push(7, took ? `ชิ้น ${i}: ค่าต่างจากแถวบน แปลว่าต้องหยิบ → เหลือความจุ ${c}` : `ชิ้น ${i}: ค่าเท่าแถวบน แปลว่าไม่ได้หยิบ`, tmp, 'back', [['หยิบแล้ว', taken.length ? taken.slice().reverse().join(',') : '—']]);
  }
  const fin = snap(tbl); mark(fin, path, 'done');
  push(7, `ได้มูลค่ารวม ${K[n][W]} โดยหยิบชิ้น ${taken.slice().reverse().join(', ') || '—'}`, fin, 'good');
  return { frames, rows, cols };
}

const LCS_PRESETS = [['AGGTAB', 'GXTXAYB'], ['ABCBD', 'BDCAB'], ['SUNDAY', 'SATURDAY'], ['ABCD', 'EFGH']];

export default function DpViz() {
  const [algo, setAlgo] = useState<Algo>('lcs');
  const [pre, setPre] = useState(0);
  const [W, setW] = useState(8);
  const { frames } = useMemo(() => {
    if (algo === 'lcs') { const [s, t] = LCS_PRESETS[pre]; return lcsFrames(s, t); }
    return knapFrames(W);
  }, [algo, pre, W]);

  const options = (
    <>
      <div className="seg" role="group" aria-label="ตัวอย่างโจทย์">
        <button className={algo === 'lcs' ? 'on' : ''} onClick={() => setAlgo('lcs')}>LCS</button>
        <button className={algo === 'knap' ? 'on' : ''} onClick={() => setAlgo('knap')}>Knapsack 0/1</button>
      </div>
      {algo === 'lcs' ? (
        <div className="seg" role="group" aria-label="ชุดสตริง">
          {LCS_PRESETS.map(([s, t], k) => <button key={s} className={pre === k ? 'on' : ''} onClick={() => setPre(k)}>{s} · {t}</button>)}
        </div>
      ) : (
        <label className="small">ความจุถุง W =
          <select className="select" value={W} onChange={(e) => setW(+e.target.value)} style={{ marginLeft: 8 }}>
            {[5, 6, 7, 8, 9, 10].map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
      )}
    </>
  );

  return (
    <StepShell frames={frames} code={algo === 'lcs' ? LCS_CODE : KNAP_CODE} title={algo === 'lcs' ? 'Longest Common Subsequence' : '0/1 Knapsack'} resetKey={`${algo}-${pre}-${W}`} options={options} label="ตัวจำลอง Dynamic Programming" />
  );
}
