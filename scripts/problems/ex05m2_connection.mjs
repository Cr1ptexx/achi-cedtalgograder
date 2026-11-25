function inst(H, r, n, e, k) {
  const es = H.edges(r, 0, n - 1, e);
  return `${n} ${es.length} ${k}\n${es.map((x) => x.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['7 8 2\n0 6\n1 6\n1 5\n1 4\n2 3\n3 4\n4 5\n5 6\n', '6\n']],
  gen: (H) => {
    const r = H.rng(52);
    const path = (n, k) => `${n} ${n - 1} ${k}\n${Array.from({ length: n - 1 }, (_, i) => `${i} ${i + 1}`).join('\n')}\n`;
    return [
      '2 1 1\n0 1\n', path(10, 1), path(10, 4), path(1000, 3), inst(H, r, 30, 50, 2), inst(H, r, 300, 400, 3),
      inst(H, r, 1000, 1500, 4), inst(H, r, 1000, 4000, 2), inst(H, r, 1000, 20000, 4),
    ];
  },
  small: (H, r) => { const n = H.int(r, 2, 8); return inst(H, r, n, H.int(r, 1, n * (n - 1) / 2), H.int(r, 1, 4)); },
};