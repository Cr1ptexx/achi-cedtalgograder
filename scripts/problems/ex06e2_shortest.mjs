/** Every vertex is reachable from s (a spanning tree from s is always included). mode: 'plain' | 'negEdges' (no negative cycle) | 'negCycle' */
function inst(H, r, n, extra, mode) {
  const s = H.int(r, 0, n - 1);
  const order = H.shuffle(r, H.range(n).filter((x) => x !== s));
  const nodes = [s, ...order];
  const p = Array.from({ length: n }, () => H.int(r, -300, 300));
  const have = new Set(), edges = [];
  const add = (a, b) => {
    if (a === b || have.has(`${a},${b}`)) return;
    have.add(`${a},${b}`);
    const base = H.int(r, 0, 200);
    const w = mode === 'plain' ? H.int(r, 0, 1000) : base + p[a] - p[b];       // reweighting keeps every cycle >= 0
    edges.push([a, b, Math.max(-1000, Math.min(1000, w))]);
  };
  for (let i = 1; i < n; i++) add(nodes[H.int(r, 0, i - 1)], nodes[i]);
  for (let i = 0; i < extra; i++) add(H.int(r, 0, n - 1), H.int(r, 0, n - 1));
  if (mode === 'negCycle') {                                                   // a cycle whose total weight is negative
    const len = Math.min(n, H.int(r, 2, 5)), cyc = H.shuffle(r, H.range(n)).slice(0, len);
    for (let i = 0; i < len; i++) {
      const a = cyc[i], b = cyc[(i + 1) % len];
      const idx = edges.findIndex((e) => e[0] === a && e[1] === b);
      const w = i === 0 ? -50 - H.int(r, 0, 100) : H.int(r, -10, 10);
      if (idx >= 0) edges[idx][2] = w; else { edges.push([a, b, w]); have.add(`${a},${b}`); }
    }
  }
  const shuf = H.shuffle(r, edges);
  return `${n} ${shuf.length} ${s}\n${shuf.map((e) => e.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['4 3 0\n0 1 -1\n1 2 1\n2 3 4\n', '0 -1 0 4\n'],
    ['4 3 0\n1 2 -1\n2 3 -1\n3 1 -1\n', '-1\n'],
  ],
  gen: (H) => {
    const r = H.rng(66);
    return [
      '1 0 0\n', '2 1 1\n1 0 -5\n', inst(H, r, 6, 6, 'plain'), inst(H, r, 6, 10, 'negEdges'), inst(H, r, 8, 12, 'negCycle'),
      inst(H, r, 30, 80, 'negEdges'), inst(H, r, 40, 100, 'negCycle'), inst(H, r, 100, 1500, 'negEdges'), inst(H, r, 100, 3000, 'plain'), inst(H, r, 100, 300, 'negCycle'),
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 6); return inst(H, r, n, H.int(r, 0, 8), H.pick(r, ['plain', 'negEdges', 'negCycle'])); },
};