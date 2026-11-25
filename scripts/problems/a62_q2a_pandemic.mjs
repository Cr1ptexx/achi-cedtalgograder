function grid(H, r, rows, cols, T, pInfected, pMountain) {
  const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => { const t = r(); return t < pMountain ? 2 : t < pMountain + pInfected ? 1 : 0; }));
  return `${rows} ${cols} ${T}\n${g.map((row) => row.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['5 4 3\n0 0 0 0\n0 0 0 0\n0 0 0 0\n0 2 1 0\n0 0 0 0\n', '14\n'],
    ['3 3 2\n0 0 1\n0 0 0\n0 0 1\n', '8\n'],
    ['1 12 3\n0 1 0 0 0 0 0 0 0 1 0 0\n', '11\n'],
  ],
  gen: (H) => {
    const r = H.rng(62);
    const one = (rows, cols, T, mount) => { const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (r() < mount ? 2 : 0))); const i = H.int(r, 0, rows - 1), j = H.int(r, 0, cols - 1); g[i][j] = 1; return `${rows} ${cols} ${T}\n${g.map((x) => x.join(' ')).join('\n')}\n`; };
    return [
      '1 1 0\n1\n', '1 1 1000000\n1\n', '2 2 0\n1 0\n0 1\n',
      grid(H, r, 6, 8, 3, 0.1, 0.2), grid(H, r, 30, 30, 5, 0.02, 0.1), one(60, 60, 1000000, 0.2), one(100, 100, 40, 0), one(200, 200, 1000000, 0.3),
      grid(H, r, 150, 150, 1000000, 0.0005, 0.35), one(1, 300, 150, 0), one(200, 1, 1000000, 0),
    ];
  },
  small: (H, r) => grid(H, r, H.int(r, 1, 7), H.int(r, 1, 7), H.int(r, 0, 12), 0.15, 0.25),
};