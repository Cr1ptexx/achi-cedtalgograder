function inst(H, r, n, m, U, K, dmax) {
  const edges = H.tree(r, n).map(([a, b]) => (a < b ? [a + 1, b + 1] : [b + 1, a + 1]));
  const have = new Set(edges.map((e) => e.join(',')));
  const extra = H.edges(r, 1, n, Math.max(0, m - (n - 1)), have);
  const lab = H.shuffle(r, H.range(n, 1));
  const es = H.shuffle(r, [...edges, ...extra]).map(([a, b]) => [lab[a - 1], lab[b - 1], dmax === 1 ? 1 : H.int(r, 1, dmax)]);
  return `${n} ${es.length} ${U} ${K}\n${es.map((e) => e.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['5 6 10 0\n1 2 5\n1 5 7\n2 5 3\n2 4 6\n3 4 2\n4 5 9\n', '160\n'],
    ['5 6 10 2\n1 2 5\n1 5 7\n2 5 3\n2 4 6\n3 4 2\n4 5 9\n', '100\n'],
    ['9 8 1 3\n1 2 5\n2 3 1\n2 4 2\n2 8 8\n2 6 9\n4 5 4\n6 7 3\n6 9 6\n', '21\n'],
  ],
  gen: (H) => {
    const r = H.rng(68);
    return [
      '2 1 5 0\n1 2 7\n', '2 1 3 1\n1 2 7\n', inst(H, r, 3, 3, 10, 0, 1000), inst(H, r, 30, 60, 4, 3, 1000), inst(H, r, 500, 1500, 10, 0, 1),
      inst(H, r, 500, 499, 7, 50, 1000), inst(H, r, 5000, 15000, 3, 100, 1000), inst(H, r, 15000, 30000, 10, 7000, 1000), inst(H, r, 15000, 30000, 1, 14999, 1000),
    ];
  },
  small: (H, r) => { const n = H.int(r, 2, 6); return inst(H, r, n, H.int(r, n - 1, Math.min(n * (n - 1) / 2, 9)), H.int(r, 1, 5), H.int(r, 0, n - 1), 9); },
};