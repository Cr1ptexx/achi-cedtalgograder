function inst(H, r, n, max, zeroP = 0) {
  const rows = [];
  for (let i = 0; i < n - 1; i++) rows.push(Array.from({ length: n - 1 - i }, () => (r() < zeroP ? 0 : H.int(r, 0, max))).join(' '));
  return `${n}\n${rows.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['4\n1 3 4\n2 7\n6\n', '7\n'],
    ['5\n4 3 6 7\n4 2 5\n6 5\n7\n', '14\n'],
  ],
  gen: (H) => {
    const r = H.rng(61);
    return ['2\n0\n', '2\n1000\n', inst(H, r, 6, 20), inst(H, r, 30, 1000), inst(H, r, 100, 5, 0.3), inst(H, r, 200, 1000), inst(H, r, 350, 1000), inst(H, r, 350, 3)];
  },
  small: (H, r) => inst(H, r, H.int(r, 2, 9), 15, 0.1),
};