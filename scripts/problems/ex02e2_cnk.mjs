export default {
  checker: 'exact',
  samples: [['10 3\n', '120\n'], ['10 10\n', '1\n'], ['30 15\n', '155117520\n']],
  gen: () => ['1 1\n', '2 1\n', '30 1\n', '30 30\n', '30 29\n', '29 14\n', '25 12\n', '20 7\n'],
  small: (H, r) => { const n = H.int(r, 1, 16); return `${n} ${H.int(r, 1, n)}\n`; },
};