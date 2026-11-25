export default {
  checker: 'exact',
  samples: [['1\n', '1\n'], ['10\n', '55\n'], ['17\n', '1597\n']],
  gen: () => ['2\n', '3\n', '20\n', '30\n', '44\n', '45\n'],
  small: (H, r) => `${H.int(r, 1, 22)}\n`,
};