function inst(H, r, n, m, k, cmax) {
  const edges = H.tree(r, n).map(([a, b]) => (a < b ? [a, b] : [b, a]));
  const have = new Set(edges.map((e) => e.join(',')));
  const extra = H.edges(r, 0, n - 1, Math.max(0, m - (n - 1)), have);
  const all = H.shuffle(r, [...edges, ...extra]);
  const lab = H.shuffle(r, H.range(n));
  const es = all.map(([a, b]) => { const x = lab[a], y = lab[b]; return x < y ? [x, y] : [y, x]; });
  const src = H.shuffle(r, H.range(n)).slice(0, k);
  const c = Array.from({ length: n }, () => H.int(r, 1, cmax));
  return `${n} ${es.length} ${k}\n${src.join(' ')}\n${c.join(' ')}\n${es.map((e) => e.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 2 1\n1\n3 5 1\n0 1\n1 2\n', '8\n'],
    ['4 4 1\n0\n2 5 3 1\n0 1\n0 2\n1 3\n2 3\n', '7\n'],
    ['4 3 2\n0 3\n4 3 2 1\n0 1\n1 2\n2 3\n', '6\n'],
  ],
  gen: (H) => {
    const r = H.rng(58);
    return [
      '1 0 1\n0\n7\n', '2 1 2\n0 1\n3 9\n0 1\n', inst(H, r, 10, 12, 1, 20), inst(H, r, 50, 70, 3, 1000), inst(H, r, 500, 500 - 1, 1, 1000),
      inst(H, r, 2000, 6000, 20, 1000), inst(H, r, 8000, 30000, 1, 1000), inst(H, r, 8000, 7999, 5, 1000), inst(H, r, 8000, 30000, 8000, 1000),
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 7); return inst(H, r, n, H.int(r, n - 1, Math.min(n * (n - 1) / 2, n + 3)), H.int(r, 1, n), 9); },
};