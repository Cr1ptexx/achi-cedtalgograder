// Any connected set of K cities is accepted: checked by the "k-connected-city" validator.
function inst(H, r, n, m, k) {
  const have = new Set(), es = [];
  for (const [a, b] of H.tree(r, n)) { es.push([a + 1, b + 1]); have.add(`${Math.min(a, b) + 1},${Math.max(a, b) + 1}`); }
  for (const e of H.edges(r, 1, n, Math.max(0, m - (n - 1)), have)) es.push(e);
  const lab = H.shuffle(r, H.range(n, 1));
  const out = H.shuffle(r, es).map(([a, b]) => (r() < 0.5 ? [lab[a - 1], lab[b - 1]] : [lab[b - 1], lab[a - 1]]));
  return `${n} ${out.length} ${k}\n${out.map((x) => x.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'custom',
  validator: 'k-connected-city',
  samples: [
    ['5 4 3\n5 1\n1 3\n3 4\n4 2\n', '1 3 4\n'],
    ['5 4 2\n5 1\n5 4\n5 2\n2 3\n', '1 5\n'],
    ['10 20 5\n7 2\n2 9\n2 1\n2 3\n9 4\n3 6\n4 5\n7 10\n10 8\n5 8\n2 8\n9 10\n7 6\n1 6\n4 8\n3 8\n3 5\n9 1\n1 8\n7 8\n', '2 4 5 8 9\n'],
  ],
  gen: (H) => {
    const r = H.rng(682);
    const line = (n, k) => `${n} ${n - 1} ${k}\n${Array.from({ length: n - 1 }, (_, i) => `${i + 1} ${i + 2}`).join('\n')}\n`;
    return [
      '2 1 1\n1 2\n', '2 1 2\n2 1\n', line(10, 6), line(5000, 2500), inst(H, r, 8, 7, 4), inst(H, r, 100, 99, 50),
      inst(H, r, 100, 400, 100), inst(H, r, 5000, 6000, 1), inst(H, r, 20000, 25000, 9000), inst(H, r, 20000, 19999, 20000),
    ];
  },
};