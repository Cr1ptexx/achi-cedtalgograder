export default {
  checker: 'exact',
  samples: [['4\n', '2\n'], ['8\n', '92\n']],
  gen: () => [1, 2, 3, 5, 6, 7, 9, 10, 11, 12].map((n) => `${n}\n`),
  small: (H, r) => `${H.int(r, 1, 8)}\n`,
};