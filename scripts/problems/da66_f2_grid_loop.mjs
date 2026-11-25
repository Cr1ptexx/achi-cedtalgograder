const TILE = { top: 4, bottom: 3, left: 4 };
function ring(g, C, t, R) {
  const r0 = t, r1 = R - 1 - t, c0 = t, c1 = C - 1 - t; if (r1 <= r0 || c1 <= c0) return;
  g[r0][c0] = 4; g[r0][c1] = 5; g[r1][c1] = 6; g[r1][c0] = 3;
  for (let c = c0 + 1; c < c1; c++) { g[r0][c] = 1; g[r1][c] = 1; }
  for (let r = r0 + 1; r < r1; r++) { g[r][c0] = 2; g[r][c1] = 2; }
}
function inst(H, r, R, C, mode, noise) {
  const g = Array.from({ length: R }, () => Array.from({ length: C }, () => H.int(r, 1, 6)));
  if (mode === 'rings') for (let t = 0; t < Math.min(R, C) / 2; t += H.int(r, 1, 2)) ring(g, C, t, R);
  if (mode === 'tiles') for (let i = 0; i + 1 < R; i += 2) for (let j = 0; j + 1 < C; j += 2) if (r() < 0.7) { g[i][j] = 4; g[i][j + 1] = 5; g[i + 1][j] = 3; g[i + 1][j + 1] = 6; }
  for (let k = 0; k < noise; k++) g[H.int(r, 0, R - 1)][H.int(r, 0, C - 1)] = H.int(r, 1, 6);
  return `${R} ${C}\n${g.map((row) => row.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['2 3\n4 1 5\n3 1 6\n', '1 6\n'],
    ['4 4\n4 5 4 5\n2 2 3 6\n2 3 1 5\n3 1 1 6\n', '2 12\n'],
    ['4 5\n4 1 5 1 2\n2 1 3 5 3\n3 1 1 6 4\n1 2 4 1 6\n', '1 10\n'],
    ['1 1\n3\n', '0 0\n'],
  ],
  gen: (H) => {
    const r = H.rng(665);
    return ['2 2\n4 5\n3 6\n', '3 3\n1 4 5\n4 6 2\n3 1 6\n', inst(H, r, 6, 6, 'rings', 2), inst(H, r, 10, 12, 'tiles', 3), inst(H, r, 30, 30, 'random', 0), inst(H, r, 100, 100, 'rings', 40), inst(H, r, 200, 200, 'tiles', 500), inst(H, r, 300, 250, 'rings', 0), inst(H, r, 1, 40, 'random', 0), inst(H, r, 250, 1, 'random', 0)];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 5), H.int(r, 1, 5), r() < 0.5 ? 'tiles' : 'rings', H.int(r, 0, 2)),
};