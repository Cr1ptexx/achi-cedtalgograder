/** each student free on `dens` of the days; every day is given to at least one student so a cover exists */
function inst(H, r, n, m, dens) {
  const free = Array.from({ length: m }, () => new Set());
  for (let d = 1; d <= n; d++) for (let s = 0; s < m; s++) if (r() < dens) free[s].add(d);
  for (let d = 1; d <= n; d++) if (!free.some((f) => f.has(d))) free[H.int(r, 0, m - 1)].add(d);
  const lines = free.map((f) => { const a = [...f].sort((x, y) => x - y); return `${a.length} ${a.join(' ')}`.trim(); });
  return `${n} ${m}\n${lines.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['2 3\n1 1\n1 2\n2 1 2\n', '1\n'],
    ['5 4\n3 1 3 5\n3 1 2 3\n2 2 5\n2 3 4\n', '3\n'],
  ],
  gen: (H) => {
    const r = H.rng(1653);
    return [
      '1 1\n1 1\n', inst(H, r, 6, 3, 0.4), inst(H, r, 20, 8, 0.3), inst(H, r, 50, 12, 0.25), inst(H, r, 200, 16, 0.12), inst(H, r, 1000, 20, 0.08), inst(H, r, 1000, 20, 0.2),
      inst(H, r, 1000, 20, 0.02), inst(H, r, 400, 20, 0.05),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 9), H.int(r, 1, 7), 0.4),
};