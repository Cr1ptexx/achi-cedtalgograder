import { useMemo, useState } from 'react';
import StepShell, { type VFrame } from './StepShell';

const CODE = [
  'void place(row) {',
  '  if (row == n) { count++; return; }',
  '  for (col = 0; col < n; col++) {',
  '    if (col / ทแยง ชนกับที่วางไว้) continue;',
  '    วางควีนที่ (row, col);',
  '    place(row + 1);',
  '    ถอนควีนออก;      // backtrack',
  '  }',
  '}',
];

function build(n: number, all: boolean): VFrame[] {
  const frames: VFrame[] = [];
  const qs: number[] = []; // qs[row] = col
  let placed = 0, pruned = 0, solutions = 0;
  let stop = false;

  const board = (probe: [number, number] | null, probeBad: boolean, solved: boolean) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className="board" style={{ gridTemplateColumns: `repeat(${n}, auto)` }} aria-hidden="true">
        {Array.from({ length: n * n }, (_, k) => {
          const r = Math.floor(k / n), c = k % n;
          const isQ = qs[r] === c && r < qs.length;
          const isProbe = probe && probe[0] === r && probe[1] === c;
          const cls = [(r + c) % 2 ? 'alt' : '', isProbe ? (probeBad ? 'bad' : 'cmp') : '', isQ && solved ? 'good' : ''].join(' ');
          return <div key={k} className={`sq ${cls}`}>{isQ ? '♛' : isProbe ? (probeBad ? '✕' : '?') : ''}</div>;
        })}
      </div>
      <div className="counters">
        <span>วางแล้ว (โหนดที่เปิด) <b>{placed}</b></span>
        <span>ตัดกิ่งเพราะชน <b>{pruned}</b></span>
        <span>คำตอบที่พบ <b>{solutions}</b></span>
      </div>
    </div>
  );

  const conflict = (row: number, col: number) => {
    for (let r = 0; r < row; r++) {
      if (qs[r] === col) return `คอลัมน์เดียวกับควีนแถว ${r + 1}`;
      if (Math.abs(qs[r] - col) === row - r) return `แนวทแยงเดียวกับควีนแถว ${r + 1}`;
    }
    return '';
  };

  const place = (row: number) => {
    if (stop) return;
    if (row === n) {
      solutions++;
      frames.push({ line: 1, msg: `วางครบ ${n} แถวโดยไม่ชนกันเลย → พบคำตอบที่ ${solutions}!`, tone: 'good', vars: [['count', solutions]], stage: board(null, false, true) });
      if (!all) stop = true;
      return;
    }
    for (let col = 0; col < n && !stop; col++) {
      const why = conflict(row, col);
      if (why) {
        pruned++;
        frames.push({ line: 3, msg: `ลองแถว ${row + 1} คอลัมน์ ${col + 1}: ชน! (${why}) → ข้ามช่องนี้ ไม่ต้องลงไปลึกกว่านี้`, tone: 'bad', vars: [['row', row], ['col', col]], stage: board([row, col], true, false) });
      } else {
        qs[row] = col; placed++;
        frames.push({ line: 4, msg: `ลองแถว ${row + 1} คอลัมน์ ${col + 1}: ไม่ชนใคร → วางควีน แล้วไปแถวถัดไป`, tone: 'good', vars: [['row', row], ['col', col]], stage: board(null, false, false) });
        place(row + 1);
        if (stop) return;
        qs.length = row;
        frames.push({ line: 6, msg: `กลับมาที่แถว ${row + 1} (แถวถัดไปไม่มีที่วางหรือสำรวจครบแล้ว) → ถอนควีนที่คอลัมน์ ${col + 1} แล้วลองคอลัมน์ถัดไป`, tone: 'back', vars: [['row', row], ['col', col]], stage: board(null, false, false) });
      }
    }
  };
  frames.push({ line: 0, msg: `วางควีน ${n} ตัวบนกระดาน ${n}×${n} ทีละแถว ทุกแถวมีควีนได้ตัวเดียว จึงลองแค่ว่าควีนแถวนี้อยู่คอลัมน์ไหน`, stage: board(null, false, false) });
  place(0);
  if (!solutions) frames.push({ line: 8, msg: `ลองครบแล้วไม่มีคำตอบสำหรับ n = ${n}`, tone: 'bad', stage: board(null, false, false) });
  else if (all) frames.push({ line: 8, msg: `สำรวจครบทั้งต้นไม้ มี ${solutions} คำตอบสำหรับ n = ${n}`, tone: 'good', stage: board(null, false, false) });
  return frames;
}

export default function QueensViz() {
  const [n, setN] = useState(4);
  const [all, setAll] = useState(false);
  const frames = useMemo(() => build(n, all), [n, all]);
  const options = (
    <>
      <div className="seg" role="group" aria-label="ขนาดกระดาน">
        {[4, 5, 6].map((k) => <button key={k} className={n === k ? 'on' : ''} onClick={() => setN(k)}>{k}×{k}</button>)}
      </div>
      <div className="seg" role="group" aria-label="โหมด">
        <button className={!all ? 'on' : ''} onClick={() => setAll(false)}>หาคำตอบแรก</button>
        <button className={all ? 'on' : ''} onClick={() => setAll(true)}>หาทุกคำตอบ</button>
      </div>
    </>
  );
  return <StepShell frames={frames} code={CODE} title="N-Queens backtracking" resetKey={`${n}-${all}`} options={options} label="ตัวจำลอง Backtracking" />;
}
