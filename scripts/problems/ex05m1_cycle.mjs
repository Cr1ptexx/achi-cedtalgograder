function graph(H, r, n, e, forceForest) {
  let es;
  if (forceForest) es = H.tree(r, n).slice(0, e).map(([a, b]) => (a < b ? [a, b] : [b, a]));
  else es = H.edges(r, 0, n - 1, e);
  return `${n} ${es.length}\n${es.map((x) => x.join(' ')).join('\n')}${es.length ? '\n' : ''}`;
}
function inst(H, r, graphs) { return `${graphs.length}\n${graphs.join('')}`; }
export default {
  checker: 'exact',
  samples: [['4\n4 0\n4 4\n2 3\n0 1\n1 2\n2 0\n4 3\n0 1\n1 2\n2 0\n4 1\n1 3\n', 'NO\nYES\nYES\nNO\n']],
  gen: (H) => {
    const r = H.rng(51);
    return [
      inst(H, r, [graph(H, r, 1, 0, true), graph(H, r, 2, 1, true)]),
      inst(H, r, [graph(H, r, 6, 5, true), graph(H, r, 6, 6, false), graph(H, r, 20, 19, true), graph(H, r, 20, 25, false)]),
      inst(H, r, Array.from({ length: 30 }, (_, i) => graph(H, r, 40, 20 + (i % 3) * 10, i % 2 === 0))),
      inst(H, r, [graph(H, r, 1000, 999, true), graph(H, r, 1000, 998, true), graph(H, r, 1000, 1000, false), graph(H, r, 1000, 5000, false)]),
      inst(H, r, Array.from({ length: 100 }, (_, i) => graph(H, r, 8, 1 + (i % 7), i % 2 === 0))),
    ];
  },
  small: (H, r) => inst(H, r, Array.from({ length: H.int(r, 1, 4) }, () => { const n = H.int(r, 1, 7); return graph(H, r, n, H.int(r, 0, Math.min(n * (n - 1) / 2, n + 1)), r() < 0.5); })),
};