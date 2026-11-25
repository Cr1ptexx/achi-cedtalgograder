export default {
  checker: 'exact',
  samples: [['10\n', '42\n']],
  gen: () => [1, 2, 3, 5, 20, 40, 50, 70, 90, 100].map((n) => `${n}\n`),
  small: (H, r) => `${H.int(r, 1, 24)}\n`,
};