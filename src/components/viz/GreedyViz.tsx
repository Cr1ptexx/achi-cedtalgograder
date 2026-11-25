import { useMemo, useState } from 'react';
import StepShell, { type VFrame } from './StepShell';
import { Chips } from './parts';

type Algo = 'interval' | 'coin';

const INTERVALS: [number, number][] = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]];

const CODE: Record<Algo, string[]> = {
  interval: [
    'sort(งาน ตามเวลาจบ จากน้อยไปมาก);',
    'last = -∞;  cnt = 0;',
    'for (แต่ละงาน [s, f] ตามลำดับ) {',
    '  if (s >= last) {      // ไม่ชนงานที่เลือกไว้',
    '    เลือกงานนี้;  last = f;  cnt++;',
    '  }                     // ไม่งั้นข้ามไป',
    '}',
  ],
  coin: [
    'for (coin ในชุดเหรียญ จากใหญ่ไปเล็ก)',
    '  while (remain >= coin) {',
    '    หยิบ coin;',
    '    remain -= coin;',
    '  }',
  ],
};

function intervalFrames(): VFrame[] {
  const sorted = INTERVALS.map(([s, f], k) => ({ s, f, k })).sort((p, q) => p.f - q.f || p.s - q.s);
  const frames: VFrame[] = [];
  const view = (state: Record<number, string>, cur: number) => (
    <div className="tl" aria-hidden="true">
      {sorted.map((x) => (
        <div key={x.k} className="tl-row">
          <div className={`tl-bar ${x.k === cur ? 'cmp' : state[x.k] ?? ''}`} style={{ gridColumn: `${x.s + 1} / ${x.f + 1}` }}>{x.s}–{x.f}</div>
        </div>
      ))}
      <div className="small muted" style={{ display: 'flex', justifyContent: 'space-between' }}><span>เวลา 0</span><span>16</span></div>
    </div>
  );
  const state: Record<number, string> = {};
  frames.push({ line: 0, msg: 'เรียงงานตาม "เวลาจบ" จากน้อยไปมาก (แถวบนจบเร็วสุด) เหตุผล: งานที่จบเร็วสุดเหลือที่ว่างให้งานอื่นมากที่สุด', stage: view(state, -1) });
  let last = -Infinity, cnt = 0;
  for (const x of sorted) {
    if (x.s >= last) {
      state[x.k] = 'done'; last = x.f; cnt++;
      frames.push({ line: 4, msg: `งาน ${x.s}–${x.f} เริ่ม (${x.s}) ไม่ก่อนงานที่เลือกล่าสุดจบ → เลือก! ตอนนี้ last = ${x.f}`, tone: 'good', vars: [['last', x.f], ['cnt', cnt]], stage: view(state, -1) });
    } else {
      state[x.k] = 'bad';
      frames.push({ line: 5, msg: `งาน ${x.s}–${x.f} เริ่ม (${x.s}) ก่อน last = ${last} ชนกับงานที่เลือกไว้ → ข้าม`, tone: 'bad', vars: [['last', last], ['cnt', cnt]], stage: view(state, -1) });
    }
  }
  frames.push({ line: 6, msg: `ได้ ${cnt} งาน ซึ่งเป็นจำนวนมากสุดที่เป็นไปได้ (พิสูจน์ได้ว่า greedy แบบนี้ถูกต้องเสมอ)`, tone: 'good', vars: [['cnt', cnt]], stage: view(state, -1) });
  return frames;
}

const SETS: { label: string; coins: number[]; target: number }[] = [
  { label: '25·10·5·1 จ่าย 63', coins: [25, 10, 5, 1], target: 63 },
  { label: '4·3·1 จ่าย 6', coins: [4, 3, 1], target: 6 },
  { label: '10·6·1 จ่าย 12', coins: [10, 6, 1], target: 12 },
];

function bestCoins(coins: number[], target: number) {
  const dp = Array(target + 1).fill(Infinity); dp[0] = 0;
  for (let x = 1; x <= target; x++) for (const c of coins) if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1);
  return dp[target] as number;
}

function coinFrames(coins: number[], target: number): VFrame[] {
  const frames: VFrame[] = [];
  const view = (picked: number[], remain: number) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <Chips title="ชุดเหรียญ" items={coins} cls="pen" />
      <Chips title="หยิบแล้ว" items={picked} cls="good" />
      <div>เหลือต้องจ่าย: <b className="mono">{remain}</b> จากทั้งหมด {target}</div>
    </div>
  );
  const picked: number[] = [];
  let remain = target;
  frames.push({ line: 0, msg: `ต้องจ่าย ${target} บาท ด้วยเหรียญจำนวนน้อยสุด greedy: หยิบเหรียญ "ใหญ่สุดที่ยังไม่เกินยอดที่เหลือ" ซ้ำไปเรื่อย ๆ`, stage: view(picked, remain) });
  for (const c of coins) {
    while (remain >= c) {
      remain -= c; picked.push(c);
      frames.push({ line: 3, msg: `เหลือ ${remain + c} ≥ ${c} → หยิบเหรียญ ${c} เหลือ ${remain}`, vars: [['remain', remain], ['จำนวนเหรียญ', picked.length]], stage: view(picked, remain) });
    }
  }
  const opt = bestCoins(coins, target);
  const bad = picked.length > opt;
  frames.push({
    line: 4,
    msg: bad ? `greedy ใช้ ${picked.length} เหรียญ แต่คำตอบที่ดีที่สุดคือ ${opt} เหรียญ → greedy ผิดสำหรับชุดเหรียญนี้! ต้องใช้ DP แทน` : `greedy ใช้ ${picked.length} เหรียญ เท่ากับคำตอบที่ดีที่สุด (ชุดเหรียญนี้ greedy ใช้ได้)`,
    tone: bad ? 'bad' : 'good',
    vars: [['greedy', picked.length], ['ดีที่สุด', opt]],
    stage: view(picked, remain),
  });
  return frames;
}

export default function GreedyViz() {
  const [algo, setAlgo] = useState<Algo>('interval');
  const [set, setSet] = useState(1);
  const frames = useMemo(() => (algo === 'interval' ? intervalFrames() : coinFrames(SETS[set].coins, SETS[set].target)), [algo, set]);
  const options = (
    <>
      <div className="seg" role="group" aria-label="ตัวอย่าง">
        <button className={algo === 'interval' ? 'on' : ''} onClick={() => setAlgo('interval')}>เลือกงานไม่ชนกัน</button>
        <button className={algo === 'coin' ? 'on' : ''} onClick={() => setAlgo('coin')}>ทอนเหรียญ</button>
      </div>
      {algo === 'coin' && (
        <div className="seg" role="group" aria-label="ชุดเหรียญ">
          {SETS.map((s, k) => <button key={s.label} className={set === k ? 'on' : ''} onClick={() => setSet(k)}>{s.label}</button>)}
        </div>
      )}
    </>
  );
  return <StepShell frames={frames} code={CODE[algo]} title={algo === 'interval' ? 'Interval scheduling' : 'Greedy coin change'} resetKey={`${algo}-${set}`} options={options} label="ตัวจำลองอัลกอริทึมละโมบ" />;
}
