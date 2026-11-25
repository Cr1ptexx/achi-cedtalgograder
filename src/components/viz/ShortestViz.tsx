import { useMemo, useState } from 'react';
import StepShell, { type VFrame } from './StepShell';
import { Grid, GraphSvg } from './parts';
import { adjacency, edgeKey } from './graphData';

type Algo = 'dijkstra' | 'floyd';

const CODE: Record<Algo, string[]> = {
  dijkstra: [
    'dist[ทุกปม] = ∞;  dist[s] = 0;',
    'while (ยังมีปมที่ยังไม่เสร็จ) {',
    '  u = ปมที่ยังไม่เสร็จที่ dist น้อยสุด;',
    '  ปักหมุด u (dist[u] เป็นค่าจริงแล้ว);',
    '  for ((v, w) : adj[u])',
    '    if (dist[u] + w < dist[v])',
    '      dist[v] = dist[u] + w;   // relax',
    '}',
  ],
  floyd: [
    'for (k = 0; k < n; k++)',
    '  for (i = 0; i < n; i++)',
    '    for (j = 0; j < n; j++)',
    '      d[i][j] = min(d[i][j], d[i][k] + d[k][j]);',
  ],
};

const INF = Infinity;
const show = (x: number) => (x === INF ? '∞' : x);

function dijkstraFrames(): VFrame[] {
  const adj = adjacency();
  const ids = 'ABCDEFG'.split('');
  const dist: Record<string, number> = Object.fromEntries(ids.map((i) => [i, INF]));
  const parent: Record<string, string> = {};
  const fin = new Set<string>();
  const nodeCls: Record<string, string> = {}, frames: VFrame[] = [];
  const treeEdges = () => Object.fromEntries(Object.entries(parent).map(([v, u]) => [edgeKey(u, v), 'use']));
  const view = (cur: string | null, tryEdge: string | null) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <GraphSvg nodeCls={{ ...nodeCls, ...(cur ? { [cur]: 'cur' } : {}) }} edgeCls={{ ...treeEdges(), ...(tryEdge ? { [tryEdge]: 'try' } : {}) }} label={Object.fromEntries(ids.map((i) => [i, show(dist[i])]))} />
      <Grid rows={['dist']} cols={ids} cells={[ids.map((i) => ({ v: show(dist[i]), cls: fin.has(i) ? 'done' : i === cur ? 'cur' : '' }))]} />
    </div>
  );
  dist.A = 0;
  frames.push({ line: 0, msg: 'ตั้งระยะจาก A: dist[A] = 0 ปมอื่นเป็น ∞ (ยังไม่รู้ทาง) ตัวเลขน้ำเงินเหนือปมคือ dist ตอนนี้', stage: view(null, null) });
  while (fin.size < ids.length) {
    const u = ids.filter((i) => !fin.has(i)).sort((p, q) => dist[p] - dist[q])[0];
    if (dist[u] === INF) break;
    fin.add(u); nodeCls[u] = 'done';
    frames.push({ line: 2, msg: `เลือกปมที่ยังไม่เสร็จและ dist น้อยสุด = ${u} (dist = ${dist[u]}) ปักหมุด: ค่านี้คือระยะสั้นสุดจริงแล้ว เพราะน้ำหนักไม่ติดลบ`, vars: [['u', u], ['dist[u]', dist[u]]], stage: view(u, null) });
    for (const { to, w } of adj[u]) {
      if (fin.has(to)) continue;
      const cand = dist[u] + w, key = edgeKey(u, to);
      if (cand < dist[to]) {
        const old = dist[to];
        dist[to] = cand; parent[to] = u;
        frames.push({ line: 6, msg: `ผ่าน ${u}→${to}: ${dist[u]} + ${w} = ${cand} < ${show(old)} → ปรับ dist[${to}] = ${cand}`, tone: 'good', vars: [['v', to], ['dist[v]', cand]], stage: view(u, key) });
      } else {
        frames.push({ line: 5, msg: `ผ่าน ${u}→${to}: ${dist[u]} + ${w} = ${cand} ไม่ดีกว่า dist[${to}] = ${dist[to]} → คงเดิม`, tone: 'bad', vars: [['v', to], ['dist[v]', dist[to]]], stage: view(u, key) });
      }
    }
  }
  frames.push({ line: 7, msg: 'ทุกปมถูกปักหมุดแล้ว เส้นสีเขียวคือต้นไม้เส้นทางสั้นสุดจาก A (ใช้ parent[] ย้อนหาเส้นทางจริงได้)', tone: 'good', stage: view(null, null) });
  return frames;
}

const FW_N = ['1', '2', '3', '4'];
const FW0: number[][] = [
  [0, 3, INF, 7],
  [8, 0, 2, INF],
  [5, INF, 0, 1],
  [2, INF, INF, 0],
];

function floydFrames(): VFrame[] {
  const d = FW0.map((r) => [...r]);
  const frames: VFrame[] = [];
  const view = (k: number | null, i: number, j: number, changed: [number, number][]) => (
    <Grid
      rows={FW_N} cols={FW_N} corner="จาก ↓ ถึง →"
      cells={d.map((r, a) => r.map((v, b) => ({
        v: show(v),
        cls: changed.some(([x, y]) => x === a && y === b) ? 'done'
          : a === i && b === j ? 'cur'
            : k !== null && ((a === i && b === k) || (a === k && b === j)) ? 'dep' : '',
      })))}
    />
  );
  frames.push({ line: 0, msg: 'เริ่มจากตารางระยะทางตรง (เส้นทางที่ไม่มีเป็น ∞) แล้วลองให้ปม k เป็น "จุดแวะพัก" ทีละปม', stage: view(null, -1, -1, []) });
  for (let k = 0; k < 4; k++) {
    const changed: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === j || i === k || j === k) continue;
        const via = d[i][k] + d[k][j];
        const better = via < d[i][j];
        const old = d[i][j];
        if (better) { d[i][j] = via; changed.push([i, j]); }
        frames.push({
          line: 3,
          msg: better ? `จาก ${i + 1} ไป ${j + 1} แวะ ${k + 1}: ${show(d[i][k])} + ${show(d[k][j])} = ${via} < ${show(old)} → ปรับเป็น ${via}`
            : `จาก ${i + 1} ไป ${j + 1} แวะ ${k + 1}: ${show(d[i][k])} + ${show(d[k][j])} = ${show(via)} ไม่ดีกว่า ${show(d[i][j])}`,
          tone: better ? 'good' : undefined,
          vars: [['k', k + 1], ['i', i + 1], ['j', j + 1]],
          stage: view(k, i, j, changed),
        });
      }
    }
  }
  frames.push({ line: 3, msg: 'ครบทุก k แล้ว ตารางนี้คือระยะสั้นสุดระหว่างทุกคู่ปม (ลำดับของ k สำคัญ: ต้องเป็นลูปนอกสุด)', tone: 'good', stage: view(null, -1, -1, []) });
  return frames;
}

export default function ShortestViz() {
  const [algo, setAlgo] = useState<Algo>('dijkstra');
  const frames = useMemo(() => (algo === 'dijkstra' ? dijkstraFrames() : floydFrames()), [algo]);
  const options = (
    <div className="seg" role="group" aria-label="อัลกอริทึม">
      <button className={algo === 'dijkstra' ? 'on' : ''} onClick={() => setAlgo('dijkstra')}>Dijkstra</button>
      <button className={algo === 'floyd' ? 'on' : ''} onClick={() => setAlgo('floyd')}>Floyd–Warshall</button>
    </div>
  );
  return <StepShell frames={frames} code={CODE[algo]} title={algo === 'dijkstra' ? 'Dijkstra จาก A' : 'Floyd–Warshall'} resetKey={algo} options={options} label="ตัวจำลองวิถีสั้นสุด" />;
}
