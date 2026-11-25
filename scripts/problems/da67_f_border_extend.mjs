function inst(H, r, R, C, k, landCount, density) {
  const g = Array.from({ length: R }, () => Array(C).fill(0));
  if (density) for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (r() < density) g[i][j] = 1;
  for (let i = 0; i < landCount; i++) g[H.int(r, 0, R - 1)][H.int(r, 0, C - 1)] = 1;
  return `${R} ${C} ${k}\n${g.map((row) => row.join(' ')).join('\n')}\n`;
}
const grid = (s) => s.trim().split('\n').map((x) => x.trim()).join('\n') + '\n';
export default {
  checker: 'exact',
  samples: [
    ['5 3 2\n0 0 0\n0 1 0\n0 0 0\n0 0 0\n0 0 0\n', '2 2 2\n2 1 2\n2 2 2\n0 2 0\n0 0 0\n'],
    ['5 5 1\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 1 0\n0 1 0 0 0\n0 0 0 0 0\n', '0 0 0 0 0\n0 0 0 2 0\n0 2 2 1 2\n2 1 2 2 0\n0 2 0 0 0\n'],
    ['5 5 2\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 1 0\n0 1 0 0 0\n0 0 0 0 0\n', '0 0 0 2 0\n0 2 2 2 2\n2 2 2 1 2\n2 1 2 2 2\n2 2 2 2 0\n'],
    ['4 6 2\n0 1 1 1 1 0\n0 0 1 0 1 1\n0 0 0 1 0 0\n0 0 0 1 0 0\n', '2 1 1 1 1 2\n2 2 1 2 1 1\n0 2 2 1 2 2\n0 2 2 1 2 2\n'],
    ['8 8 2\n0 1 0 0 0 0 0 1\n0 1 0 0 0 0 0 1\n0 1 0 0 0 0 0 1\n0 1 1 1 1 1 1 1\n0 0 0 1 0 0 0 0\n0 0 0 0 0 1 1 0\n0 0 0 0 0 0 1 0\n1 0 0 0 0 0 1 0\n',
      '2 1 2 2 0 2 2 1\n2 1 2 2 2 2 2 1\n2 1 2 2 2 2 2 1\n2 1 1 1 1 1 1 1\n2 2 2 1 2 2 2 2\n2 2 2 2 2 1 1 2\n2 2 0 2 2 2 1 2\n1 2 2 0 2 2 1 2\n'],
  ],
  gen: (H) => {
    const r = H.rng(671);
    return [inst(H, r, 5, 3, 2, 1, 0), inst(H, r, 4, 6, 3, 1, 0), inst(H, r, 10, 10, 1, 0, 0.1), inst(H, r, 1, 1, 5, 1, 0), inst(H, r, 1, 30, 4, 0, 0.1), inst(H, r, 60, 80, 3, 0, 0.02), inst(H, r, 100, 100, 7, 3, 0), inst(H, r, 250, 300, 15, 0, 0.001), inst(H, r, 300, 300, 2000, 1, 0), inst(H, r, 300, 250, 1, 0, 0.3)];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), H.int(r, 1, 6), H.int(r, 1, 4), H.int(r, 0, 3), 0),
};