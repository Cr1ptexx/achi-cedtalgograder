function grid(H, r, R, C, max, zeroP = 0) {
  const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r() < zeroP ? 0 : H.int(r, 0, max))));
  return `${R} ${C}\n${g.map((row) => row.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['4 4\n1 1 1 1\n9 8 7 1\n1 1 1 1\n1 2 4 9\n', '0 1 2 3\n9 9 9 4\n8 7 6 5\n9 9 10 14\n']],
  gen: (H) => {
    const r = H.rng(63);
    return [
      '1 1\n5\n', '1 6\n3 1 4 1 5 9\n', '5 1\n2\n7\n1\n8\n2\n', grid(H, r, 5, 5, 9), grid(H, r, 12, 9, 1000, 0.3),
      grid(H, r, 1, 3000, 1000), grid(H, r, 60, 60, 1000), grid(H, r, 200, 200, 1000), grid(H, r, 200, 200, 3, 0.5),
    ];
  },
  small: (H, r) => grid(H, r, H.int(r, 1, 6), H.int(r, 1, 6), 20, 0.2),
};