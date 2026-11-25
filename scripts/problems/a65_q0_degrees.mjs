function inst(H, r, n, m) {
  const mat = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [a, b] of H.edges(r, 0, n - 1, m)) mat[a][b] = mat[b][a] = 1;
  return `${n}\n${mat.map((row) => row.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['6\n0 1 0 1 0 0\n1 0 1 0 0 0\n0 1 0 0 0 0\n1 0 0 0 1 1\n0 0 0 1 0 1\n0 0 0 1 1 0\n', '0 1 4 1\n']],
  gen: (H) => {
    const r = H.rng(65);
    return ['1\n0\n', '2\n0 0\n0 0\n', '2\n0 1\n1 0\n', inst(H, r, 5, 10), inst(H, r, 30, 40), inst(H, r, 100, 300), inst(H, r, 300, 3000), inst(H, r, 350, 60000), inst(H, r, 400, 200)];
  },
  small: (H, r) => { const n = H.int(r, 1, 7); return inst(H, r, n, H.int(r, 0, n * (n - 1) / 2)); },
};