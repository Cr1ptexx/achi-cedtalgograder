function inst(H, r, n, K, S, p) {
  const a = Array.from({ length: n }, () => (r() < p ? 1 : 0));
  return `${n} ${K} ${S}\n${a.join(' ')}\n`;
}
export default {
  checker: 'exact',
  samples: [['3 2 4\n1 0 1\n', '1\n'], ['6 7 6\n1 0 1 0 1 0\n', '10\n']],
  gen: (H) => {
    const r = H.rng(682);
    return [
      '1 10 5\n1\n', '1 10 11\n1\n', '3 5 4\n0 0 0\n', '15 10 150\n1 1 1 1 1 1 1 1 1 1 1 1 1 1 1\n', '15 10 15\n1 1 1 1 1 1 1 1 1 1 1 1 1 1 1\n',
      '15 2 22\n1 1 1 1 1 1 1 1 1 1 1 1 1 1 1\n', '10 1 7\n1 1 1 1 1 1 1 1 1 1\n',
      inst(H, r, 15, 10, 80, 0.7), inst(H, r, 12, 6, 30, 0.6), inst(H, r, 5, 10, 25, 1), inst(H, r, 15, 3, 25, 0.9),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), H.int(r, 2, 5), H.int(r, 1, 25), 0.75),
};