/** how many distinct walks (stops counting past `cap`) */
function count(R, C, g, cap) {
  const vis = Array.from({ length: R }, () => Array(C).fill(false)); let n = 0; vis[0][0] = true;
  const go = (r, c) => {
    if (n > cap) return;
    if (r === R - 1 && c === C - 1) { n++; return; }
    for (const [dr, dc] of [[0, 1], [1, 0], [-1, 0]]) { const a = r + dr, b = c + dc; if (a < 0 || b < 0 || a >= R || b >= C || g[a][b] || vis[a][b]) continue; vis[a][b] = true; go(a, b); vis[a][b] = false; }
  };
  go(0, 0); return n;
}
function inst(H, r, R, C, density, maxPaths) {
  for (let tries = 0; ; tries++) {
    const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r() < density ? 1 : 0)));
    g[0][0] = 0; g[R - 1][C - 1] = 0;
    const n = count(R, C, g, maxPaths);
    if (n <= maxPaths && (n > 0 || tries > 200)) return `${R} ${C}\n${g.map((row) => row.join(' ')).join('\n')}\n`;
    density = Math.min(0.9, density + 0.005);
  }
}
export default {
  checker: 'exact',
  samples: [
    ['2 2\n0 0\n0 0\n', 'AB\nBA\nDONE\n'],
    ['2 3\n0 0 0\n0 0 0\n', 'AAB\nABA\nBAA\nBACAB\nDONE\n'],
    ['2 3\n0 1 0\n0 1 0\n', 'DONE\n'],
    ['4 4\n0 1 1 1\n0 1 1 1\n0 0 1 1\n0 0 0 0\n', 'BBABAA\nBBBAAA\nDONE\n'],
    ['4 5\n0 1 0 0 0\n0 1 0 1 0\n0 1 0 1 0\n0 0 0 1 0\n', 'BBBAACCCAABBB\nDONE\n'],
  ],
  gen: (H) => {
    const r = H.rng(663);
    return ['1 2\n0 0\n', '2 1\n0\n0\n', '3 3\n0 0 0\n0 0 0\n0 0 0\n', '3 4\n0 0 0 0\n0 0 0 0\n0 0 0 0\n', inst(H, r, 5, 5, 0.25, 3000), inst(H, r, 7, 7, 0.3, 20000), inst(H, r, 8, 6, 0.28, 30000), inst(H, r, 10, 10, 0.45, 40000), inst(H, r, 10, 10, 0.5, 40000), inst(H, r, 10, 9, 0.4, 20000)];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 4) + (r() < 0.9 ? 1 : 0), H.int(r, 2, 5), 0.2, 3000),
};