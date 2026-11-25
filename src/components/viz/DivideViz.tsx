import { useMemo, useState } from 'react';
import StepShell, { type VFrame } from './StepShell';
import { Cells } from './parts';

type Algo = 'bsearch' | 'power';

const ARR = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91, 99];
const KEYS = [23, 2, 99, 50, 7];

const CODE: Record<Algo, string[]> = {
  bsearch: [
    'int bsearch(A, n, k) {',
    '  lo = 0;  hi = n - 1;',
    '  while (lo <= hi) {',
    '    mid = (lo + hi) / 2;',
    '    if (A[mid] == k) return mid;',
    '    if (A[mid] < k) lo = mid + 1;',
    '    else            hi = mid - 1;',
    '  }',
    '  return -1;',
    '}',
  ],
  power: [
    'long long pw(a, e) {',
    '  if (e == 0) return 1;',
    '  h = pw(a, e / 2);',
    '  if (e % 2 == 0)',
    '    return h * h;',
    '  return h * h * a;',
    '}',
  ],
};

function bsearchFrames(key: number): VFrame[] {
  const out: VFrame[] = [];
  const view = (lo: number, hi: number, mid: number, found: number) => (
    <Cells items={ARR.map((v, k) => ({
      v, idx: k,
      cls: found === k ? 'done' : k === mid ? 'cmp' : k < lo || k > hi ? 'dim' : 'hit',
    }))} />
  );
  let lo = 0, hi = ARR.length - 1, steps = 0;
  out.push({ line: 1, msg: `ค้นหา k = ${key} ในอาร์เรย์ที่เรียงแล้ว 12 ตัว เริ่มจากช่วงทั้งหมด [0, 11]`, vars: [['k', key], ['lo', lo], ['hi', hi]], stage: view(lo, hi, -1, -1) });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps++;
    out.push({ line: 3, msg: `ช่วง [${lo}, ${hi}] มี ${hi - lo + 1} ตัว → mid = (${lo} + ${hi}) / 2 = ${mid}, A[${mid}] = ${ARR[mid]}`, vars: [['lo', lo], ['hi', hi], ['mid', mid], ['A[mid]', ARR[mid]]], stage: view(lo, hi, mid, -1) });
    if (ARR[mid] === key) {
      out.push({ line: 4, msg: `A[${mid}] = ${key} เจอแล้ว! เทียบไปแค่ ${steps} ครั้ง (ค้นตรง ๆ ต้องดูถึง ${mid + 1} ตัว)`, tone: 'good', vars: [['mid', mid], ['เทียบ', steps]], stage: view(lo, hi, mid, mid) });
      return out;
    }
    if (ARR[mid] < key) {
      out.push({ line: 5, msg: `${ARR[mid]} < ${key} → k ต้องอยู่ทางขวา ตัดครึ่งซ้ายทิ้ง: lo = ${mid + 1}`, tone: 'back', vars: [['lo', mid + 1], ['hi', hi]], stage: view(mid + 1, hi, -1, -1) });
      lo = mid + 1;
    } else {
      out.push({ line: 6, msg: `${ARR[mid]} > ${key} → k ต้องอยู่ทางซ้าย ตัดครึ่งขวาทิ้ง: hi = ${mid - 1}`, tone: 'back', vars: [['lo', lo], ['hi', mid - 1]], stage: view(lo, mid - 1, -1, -1) });
      hi = mid - 1;
    }
  }
  out.push({ line: 8, msg: `ช่วงว่างแล้ว (lo = ${lo} > hi = ${hi}) → ไม่มี ${key} ในอาร์เรย์ คืน −1 เทียบไป ${steps} ครั้ง`, tone: 'bad', vars: [['lo', lo], ['hi', hi]], stage: view(1, 0, -1, -1) });
  return out;
}

function powerFrames(e0: number): VFrame[] {
  const a = 3;
  const out: VFrame[] = [];
  const chain: number[] = [];
  for (let x = e0; ; x = Math.floor(x / 2)) { chain.push(x); if (x === 0) break; }
  const res: (number | null)[] = chain.map(() => null);
  const view = (depth: number, cur: number) => (
    <div style={{ display: 'grid', gap: 6 }}>
      {chain.slice(0, depth + 1).map((x, j) => (
        <div key={j} className={`frame ${j === cur ? 'top' : ''}`} style={{ marginLeft: j * 14 }}>
          pw({a}, {x}){res[j] !== null ? ` = ${res[j]}` : ''}
        </div>
      ))}
      <p className="small muted" style={{ margin: 0 }}>คูณไปแล้ว {res.filter((r) => r !== null).length > 0 ? res.reduce<number>((s, r, j) => (r === null || chain[j] === 0 ? s : s + (chain[j] % 2 === 0 ? 1 : 2)), 0) : 0} ครั้ง · คูณทีละตัวต้อง {e0 - 1} ครั้ง</p>
    </div>
  );
  chain.forEach((x, j) => {
    out.push({ line: x === 0 ? 1 : 2, msg: x === 0 ? 'e = 0 แล้ว จุดหยุดของ recursion คืนค่า 1' : `เรียก pw(${a}, ${x}) ต้องรู้ pw(${a}, ${Math.floor(x / 2)}) ก่อน (ครึ่งหนึ่งของเลขชี้กำลัง)`, vars: [['e', x]], stage: view(j, j) });
  });
  res[chain.length - 1] = 1;
  out.push({ line: 1, msg: 'เริ่มคืนค่าขึ้นมาทีละชั้น: pw(3, 0) = 1', tone: 'back', stage: view(chain.length - 1, chain.length - 1) });
  for (let j = chain.length - 2; j >= 0; j--) {
    const x = chain[j], h = res[j + 1] as number;
    const even = x % 2 === 0;
    res[j] = even ? h * h : h * h * a;
    out.push({
      line: even ? 4 : 5,
      msg: even ? `e = ${x} เป็นเลขคู่: ${a}^${x} = (${a}^${x / 2})² = ${h}² = ${res[j]}` : `e = ${x} เป็นเลขคี่: ${a}^${x} = (${a}^${(x - 1) / 2})² × ${a} = ${h}² × ${a} = ${res[j]}`,
      tone: j === 0 ? 'good' : 'back',
      vars: [['e', x], ['h', h]],
      stage: view(chain.length - 1, j),
    });
  }
  return out;
}

export default function DivideViz() {
  const [algo, setAlgo] = useState<Algo>('bsearch');
  const [key, setKey] = useState(23);
  const [e, setE] = useState(13);
  const frames = useMemo(() => (algo === 'bsearch' ? bsearchFrames(key) : powerFrames(e)), [algo, key, e]);

  const options = (
    <>
      <div className="seg" role="group" aria-label="อัลกอริทึม">
        <button className={algo === 'bsearch' ? 'on' : ''} onClick={() => setAlgo('bsearch')}>Binary search</button>
        <button className={algo === 'power' ? 'on' : ''} onClick={() => setAlgo('power')}>Fast power</button>
      </div>
      {algo === 'bsearch' ? (
        <label className="small">ค้นหาค่า
          <select className="select" value={key} onChange={(ev) => setKey(+ev.target.value)} style={{ marginLeft: 8 }}>
            {KEYS.map((k) => <option key={k} value={k}>{k}{ARR.includes(k) ? '' : ' (ไม่มีในอาร์เรย์)'}</option>)}
          </select>
        </label>
      ) : (
        <label className="small">คำนวณ 3^e เมื่อ e =
          <select className="select" value={e} onChange={(ev) => setE(+ev.target.value)} style={{ marginLeft: 8 }}>
            {[5, 10, 13, 20, 30].map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
      )}
    </>
  );

  return (
    <StepShell frames={frames} code={CODE[algo]} title={algo === 'bsearch' ? 'Binary search' : 'Fast power'} resetKey={`${algo}-${key}-${e}`} options={options} label="ตัวจำลองแบ่งแยกและเอาชนะ" />
  );
}
