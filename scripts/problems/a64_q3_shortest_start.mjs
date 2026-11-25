/** mode: 'unit' | 'pos' | 'neg' (negative edges but no negative cycle, via potentials). Node 0 is always one of the starts and reaches everything. */
function inst(H, r, n, m, k, mode) {
  const p = Array.from({ length: n }, () => H.int(r, -400, 400));
  const have = new Set(), edges = [];
  const add = (a, b) => {
    if (a === b || have.has(`${a},${b}`) || edges.length >= m) return;
    have.add(`${a},${b}`);
    const w = mode === 'unit' ? 1 : mode === 'pos' ? H.int(r, 1, 1000) : Math.max(-1000, Math.min(1000, H.int(r, 0, 100) + p[a] - p[b]));
    edges.push([a, b, w]);
  };
  for (let i = 1; i < n; i++) add(H.int(r, 0, i - 1), i);            // arborescence from node 0
  for (let g = 0; edges.length < m && g < m * 20; g++) add(H.int(r, 0, n - 1), H.int(r, 0, n - 1));
  const lab = H.shuffle(r, H.range(n));                              // hide the structure behind random labels
  const es = H.shuffle(r, edges).map(([a, b, w]) => [lab[a], lab[b], w]);
  const starts = H.shuffle(r, [0, ...H.shuffle(r, H.range(n - 1, 1)).slice(0, k - 1)]).map((x) => lab[x]);
  const v = lab[H.int(r, 0, n - 1)];
  return `${n} ${es.length} ${k}\n${v}\n${starts.join(' ')}\n${es.map((e) => e.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['5 4 2\n4\n0 1\n0 1 1\n1 2 1\n2 4 1\n3 4 2\n', '2\n'],
    ['6 6 4\n5\n4 3 0 1\n0 1 10\n1 2 5\n1 3 7\n2 5 -4\n3 2 2\n1 4 8\n', '-2\n'],
  ],
  gen: (H) => {
    const r = H.rng(64);
    return [
      '1 0 1\n0\n0\n', '2 1 1\n1\n0\n0 1 -7\n', inst(H, r, 12, 20, 3, 'neg'), inst(H, r, 50, 49, 1, 'unit'), inst(H, r, 200, 600, 1, 'pos'),
      inst(H, r, 500, 3000, 1, 'neg'), inst(H, r, 1000, 6000, 50, 'neg'), inst(H, r, 3000, 15000, 3000, 'pos'), inst(H, r, 3000, 20000, 100, 'neg'),
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 7); return inst(H, r, n, H.int(r, n - 1, Math.min(n * (n - 1), n + 6)), H.int(r, 1, n), H.pick(r, ['unit', 'pos', 'neg'])); },
};