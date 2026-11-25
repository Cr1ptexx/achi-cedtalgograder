/** a tree plus one extra edge; `deep` makes the tree path-like so the cycle can be long */
function inst(H, r, n, deep) {
  const have = new Set(), edges = [];
  for (let i = 1; i < n; i++) {
    const p = deep > 0 && r() < deep ? i - 1 : H.int(r, 0, i - 1);
    edges.push([p, i]); have.add(`${p},${i}`);
  }
  for (let guard = 0; guard < 1000; guard++) {
    const a = H.int(r, 0, n - 1), b = H.int(r, 0, n - 1);
    if (a === b) continue;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (have.has(key)) continue;
    edges.push([a, b]); break;
  }
  const lab = H.shuffle(r, H.range(n));
  const es = H.shuffle(r, edges).map(([a, b]) => (r() < 0.5 ? [lab[a], lab[b]] : [lab[b], lab[a]]));
  return `${n}\n${es.map((x) => x.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['9\n0 1\n0 2\n1 3\n1 4\n2 5\n2 6\n2 7\n4 5\n5 8\n', '5\n']],
  gen: (H) => {
    const r = H.rng(59);
    return [
      '3\n0 1\n1 2\n2 0\n',                          // a triangle, nothing else
      inst(H, r, 6, 0), inst(H, r, 30, 0.5), inst(H, r, 1000, 0.99), inst(H, r, 20000, 0), inst(H, r, 20000, 0.9999), inst(H, r, 20000, 1),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 3, 12), r() < 0.5 ? 0 : 0.8),
};