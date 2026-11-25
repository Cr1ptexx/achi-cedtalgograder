function reach(R, C, g) {
  let s = -1; for (let i = 0; i < R * C; i++) if (g[i] === 1) { s = i; break; }
  const seen = new Set([s]); const q = [s];
  while (q.length) { const u = q.pop(); const r = Math.floor(u / C), c = u % C; for (const [a, b] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) { if (a < 0 || b < 0 || a >= R || b >= C) continue; const v = a * C + b; if (g[v] === 3 || seen.has(v)) continue; seen.add(v); q.push(v); } }
  return g.some((x, i) => x === 2 && seen.has(i));
}
const fmt = (R, C, g) => `${R} ${C}\n${Array.from({ length: R }, (_, i) => g.slice(i * C, i * C + C).join(' ')).join('\n')}\n`;
function inst(H, r, R, C, volc, n1, n2) {
  for (;;) {
    const g = Array.from({ length: R * C }, () => (r() < volc ? 3 : 0));
    for (let i = 0; i < n1; i++) g[H.int(r, 0, R * C - 1)] = 1;
    for (let i = 0; i < n2; i++) g[H.int(r, 0, R * C - 1)] = 2;
    if (g.includes(1) && g.includes(2) && reach(R, C, g)) return fmt(R, C, g);
  }
}
/** serpentine corridor: walls of volcano with a gap at alternating ends */
function snake(R, C) {
  const g = Array(R * C).fill(0);
  for (let r = 1; r < R; r += 2) for (let c = 0; c < C; c++) g[r * C + c] = 3;
  for (let r = 1, k = 0; r < R; r += 2, k++) g[r * C + (k % 2 === 0 ? C - 1 : 0)] = 0;
  g[0] = 1; g[R * C - 1] = 2; return fmt(R, C, g);
}
export default {
  checker: 'exact',
  samples: [
    ['3 5\n0 0 0 0 0\n0 2 0 0 1\n0 0 0 0 0\n', '4\n'],
    ['5 5\n2 2 2 0 0\n0 0 0 1 1\n0 0 0 0 1\n2 0 0 0 0\n2 0 0 1 1\n', '3\n'],
    ['5 5\n0 2 2 3 0\n0 0 3 1 1\n0 0 3 0 1\n2 0 0 0 0\n2 0 3 1 1\n', '5\n'],
    ['3 3\n1 0 2\n1 2 0\n1 0 2\n', '2\n'],
    ['3 3\n1 2 1\n2 1 2\n1 2 1\n', '2\n'],
    ['5 5\n0 2 0 0 0\n3 3 3 3 0\n0 0 0 0 0\n0 3 3 3 3\n0 0 0 0 1\n', '16\n'],
  ],
  gen: (H) => {
    const r = H.rng(664);
    return ['1 2\n1 2\n', '2 1\n2\n1\n', inst(H, r, 6, 6, 0.2, 1, 1), inst(H, r, 20, 20, 0.35, 1, 3), inst(H, r, 50, 50, 0.4, 1, 1), snake(21, 21), snake(61, 50), inst(H, r, 150, 150, 0.3, 4, 4), inst(H, r, 250, 200, 0.2, 1, 20), snake(151, 150)];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 5), H.int(r, 2, 5), 0.25, H.int(r, 1, 2), H.int(r, 1, 2)),
};