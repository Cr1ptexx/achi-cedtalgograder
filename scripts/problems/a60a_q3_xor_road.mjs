function inst(H, r, n, bits) {
  const set = new Set(), cap = 2 ** bits;
  while (set.size < Math.min(n, cap)) set.add(Math.floor(r() * cap));
  return `${set.size}\n${H.shuffle(r, [...set]).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['4\n3\n10\n9\n6\n', '37\n']],
  gen: (H) => {
    const r = H.rng(60);
    return ['1\n5\n', '2\n0\n1073741823\n', '3\n1\n2\n4\n', inst(H, r, 10, 8), inst(H, r, 100, 10), inst(H, r, 500, 30), inst(H, r, 2000, 30), inst(H, r, 2000, 12), inst(H, r, 2000, 3)];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 10), 8),
};