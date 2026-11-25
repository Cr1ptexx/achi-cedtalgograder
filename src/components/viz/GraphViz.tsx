import { useMemo, useState } from 'react';
import StepShell, { type VFrame } from './StepShell';
import { Chips, GraphSvg } from './parts';
import { G_EDGES, adjacency, edgeKey } from './graphData';

type Algo = 'bfs' | 'dfs' | 'kruskal';

const CODE: Record<Algo, string[]> = {
  bfs: [
    'queue.push(s);  dist[s] = 0;  seen[s] = true;',
    'while (!queue.empty()) {',
    '  u = queue.front();  queue.pop();',
    '  for (v : adj[u])',
    '    if (!seen[v]) {',
    '      seen[v] = true;  dist[v] = dist[u] + 1;',
    '      queue.push(v);',
    '    }',
    '}',
  ],
  dfs: [
    'void dfs(u) {',
    '  seen[u] = true;',
    '  for (v : adj[u])',
    '    if (!seen[v])',
    '      dfs(v);',
    '}',
  ],
  kruskal: [
    'sort(edges ตามน้ำหนัก);',
    'for (แต่ละเส้น (u, v, w) ตามลำดับ)',
    '  if (find(u) != find(v)) {   // คนละกลุ่ม',
    '    union(u, v);  เลือกเส้นนี้;  total += w;',
    '  }                           // ไม่งั้นเกิดวงรอบ → ข้าม',
  ],
};

const NAMES: Record<Algo, string> = { bfs: 'BFS', dfs: 'DFS', kruskal: 'Kruskal (MST)' };

function bfsFrames(): VFrame[] {
  const adj = adjacency();
  const frames: VFrame[] = [];
  const nodeCls: Record<string, string> = {}, edgeCls: Record<string, string> = {}, dist: Record<string, number> = { A: 0 };
  let queue = ['A'];
  nodeCls.A = 'seen';
  const snap = (cur: string | null) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <GraphSvg showW={false} nodeCls={{ ...nodeCls, ...(cur ? { [cur]: 'cur' } : {}) }} edgeCls={{ ...edgeCls }} label={{ ...dist }} />
      <Chips title="คิว (หน้า→หลัง)" items={queue} cls="pen" />
    </div>
  );
  frames.push({ line: 0, msg: 'เริ่มที่ปม A: ใส่ลงคิว ระยะ 0 (ตัวเลขสีน้ำเงินเหนือปมคือระยะจาก A)', vars: [['queue', 'A']], stage: snap(null) });
  while (queue.length) {
    const u = queue[0]; queue = queue.slice(1);
    nodeCls[u] = 'done';
    frames.push({ line: 2, msg: `ดึง ${u} ออกจากหน้าคิว แล้วสำรวจเพื่อนบ้านของมันตามลำดับตัวอักษร`, vars: [['u', u], ['dist[u]', dist[u]]], stage: snap(u) });
    for (const { to } of adj[u]) {
      const key = edgeKey(u, to);
      if (to in dist) {
        edgeCls[key] ||= 'skip';
        frames.push({ line: 4, msg: `${to} ถูกเยี่ยมแล้ว → ข้าม`, tone: 'bad', vars: [['u', u], ['v', to]], stage: snap(u) });
      } else {
        dist[to] = dist[u] + 1; nodeCls[to] = 'seen'; edgeCls[key] = 'use'; queue = [...queue, to];
        frames.push({ line: 6, msg: `${to} ยังไม่เคยเห็น → ระยะ = ${dist[u]} + 1 = ${dist[to]} แล้วใส่ท้ายคิว`, tone: 'good', vars: [['u', u], ['v', to], ['dist[v]', dist[to]]], stage: snap(u) });
      }
    }
  }
  frames.push({ line: 8, msg: 'คิวว่างแล้ว ทุกปมได้ระยะ (จำนวนเส้นขั้นต่ำ) จาก A เส้นสีเขียวคือต้นไม้ BFS', tone: 'good', stage: snap(null) });
  return frames;
}

function dfsFrames(): VFrame[] {
  const adj = adjacency();
  const frames: VFrame[] = [];
  const nodeCls: Record<string, string> = {}, edgeCls: Record<string, string> = {}, order: Record<string, number> = {};
  const stack: string[] = [];
  let t = 0;
  const snap = (cur: string | null) => (
    <div style={{ display: 'grid', gap: 10 }}>
      <GraphSvg showW={false} nodeCls={{ ...nodeCls, ...(cur ? { [cur]: 'cur' } : {}) }} edgeCls={{ ...edgeCls }} label={{ ...order }} />
      <Chips title="สแตก (ล่าง→บน)" items={[...stack]} cls="pen" />
    </div>
  );
  const dfs = (u: string, from: string | null) => {
    order[u] = ++t; nodeCls[u] = 'seen'; stack.push(u);
    if (from) edgeCls[edgeKey(from, u)] = 'use';
    frames.push({ line: 1, msg: `เข้า dfs(${u}) เป็นปมลำดับที่ ${t} ที่ถูกเยี่ยม (ตัวเลขเหนือปม) ซ้อนลงบนสแตก`, vars: [['u', u], ['ลำดับ', t]], stage: snap(u) });
    for (const { to } of adj[u]) {
      if (to in order) {
        if (to !== from) edgeCls[edgeKey(u, to)] ||= 'skip';
        frames.push({ line: 3, msg: `${to} ถูกเยี่ยมแล้ว → ไม่ลงไป`, tone: 'bad', vars: [['u', u], ['v', to]], stage: snap(u) });
      } else {
        frames.push({ line: 4, msg: `${to} ยังไม่เคยเยี่ยม → ลงไป dfs(${to}) ทันที (ลึกก่อน)`, vars: [['u', u], ['v', to]], stage: snap(u) });
        dfs(to, u);
        nodeCls[u] = 'seen';
        frames.push({ line: 5, msg: `กลับมาที่ ${u} หลัง dfs(${to}) จบ แล้วดูเพื่อนบ้านตัวถัดไป`, tone: 'back', vars: [['u', u]], stage: snap(u) });
      }
    }
    stack.pop(); nodeCls[u] = 'done';
  };
  dfs('A', null);
  frames.push({ line: 5, msg: 'dfs(A) จบ ทุกปมถูกเยี่ยมครบ เส้นสีเขียวคือต้นไม้ DFS เส้นประสีแดงคือเส้นที่ย้อนไปหาปมที่เยี่ยมแล้ว', tone: 'good', stage: snap(null) });
  return frames;
}

function kruskalFrames(): VFrame[] {
  const sorted = [...G_EDGES].sort((p, q) => p.w - q.w || p.a.localeCompare(q.a));
  const parent: Record<string, string> = {};
  for (const n of 'ABCDEFG') parent[n] = n;
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const frames: VFrame[] = [];
  const edgeCls: Record<string, string> = {};
  let total = 0, picked = 0;
  const comps = () => {
    const g: Record<string, string[]> = {};
    for (const n of 'ABCDEFG') (g[find(n)] ||= []).push(n);
    return Object.values(g).map((x) => x.join(''));
  };
  const snap = () => (
    <div style={{ display: 'grid', gap: 10 }}>
      <GraphSvg nodeCls={{}} edgeCls={{ ...edgeCls }} />
      <Chips title="กลุ่มที่เชื่อมกัน" items={comps()} cls="pen" />
    </div>
  );
  frames.push({ line: 0, msg: 'เรียงเส้นตามน้ำหนักจากน้อยไปมาก แล้วลองใส่ทีละเส้น ถ้าไม่ทำให้เกิดวงรอบก็เลือก', vars: [['เส้นทั้งหมด', sorted.length]], stage: snap() });
  for (const e of sorted) {
    const key = `${e.a}-${e.b}`;
    edgeCls[key] = 'try';
    frames.push({ line: 2, msg: `ลองเส้น ${e.a}–${e.b} (น้ำหนัก ${e.w}): ${e.a} อยู่กลุ่ม ${comps().find((c) => c.includes(e.a))}, ${e.b} อยู่กลุ่ม ${comps().find((c) => c.includes(e.b))}`, vars: [['w', e.w], ['รวม', total]], stage: snap() });
    if (find(e.a) !== find(e.b)) {
      parent[find(e.a)] = find(e.b); edgeCls[key] = 'use'; total += e.w; picked++;
      frames.push({ line: 3, msg: `คนละกลุ่ม → เลือก รวมสองกลุ่มเป็นหนึ่ง (น้ำหนักรวม ${total})`, tone: 'good', vars: [['รวม', total], ['เลือกแล้ว', picked]], stage: snap() });
      if (picked === 6) break;
    } else {
      edgeCls[key] = 'skip';
      frames.push({ line: 4, msg: `อยู่กลุ่มเดียวกันแล้ว ถ้าเพิ่มเส้นนี้จะเกิดวงรอบ → ข้าม`, tone: 'bad', vars: [['รวม', total]], stage: snap() });
    }
  }
  frames.push({ line: 4, msg: `ได้ต้นไม้แผ่ทั่ว (MST) ครบ 6 เส้นสำหรับ 7 ปม น้ำหนักรวมน้อยสุด = ${total}`, tone: 'good', vars: [['รวม', total]], stage: snap() });
  return frames;
}

export default function GraphViz() {
  const [algo, setAlgo] = useState<Algo>('bfs');
  const frames = useMemo(() => (algo === 'bfs' ? bfsFrames() : algo === 'dfs' ? dfsFrames() : kruskalFrames()), [algo]);
  const options = (
    <div className="seg" role="group" aria-label="อัลกอริทึม">
      {(Object.keys(NAMES) as Algo[]).map((k) => <button key={k} className={algo === k ? 'on' : ''} onClick={() => setAlgo(k)}>{NAMES[k]}</button>)}
    </div>
  );
  return <StepShell frames={frames} code={CODE[algo]} title={NAMES[algo]} resetKey={algo} options={options} label="ตัวจำลองกราฟ" />;
}
