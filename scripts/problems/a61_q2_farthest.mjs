function inst(H, r, n, p, reachAll) {
  const w = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : (r() < p ? H.int(r, 1, 999999) : -1))));
  if (reachAll) { const order = H.shuffle(r, H.range(n - 1, 1)); let prev = 0; for (const v of order) { if (r() < 0.6 || w[prev][v] < 0) w[prev][v] = H.int(r, 1, 999999); prev = v; } }
  return `${n}\n${w.map((row) => row.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['5\n0 1 -1 -1 7\n-1 0 2 3 5\n-1 -1 0 4 -1\n-1 4 2 0 -1\n-1 -1 -1 4 0\n', '6\n']],
  gen: (H) => {
    const r = H.rng(61);
    return [
      '2\n0 5\n-1 0\n', '2\n0 -1\n-1 0\n', '3\n0 1 1\n1 0 1\n1 1 0\n', inst(H, r, 8, 0.4, true), inst(H, r, 8, 0.1, false), inst(H, r, 50, 0.15, true),
      inst(H, r, 120, 0.05, true), inst(H, r, 250, 0.03, true), inst(H, r, 300, 0.3, true),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 2, 7), 0.4, r() < 0.7),
};