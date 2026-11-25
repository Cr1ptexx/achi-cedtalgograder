export default {
  checker: 'exact',
  samples: [
    ['3 2\n', '011\n110\n111\n'],
    ['4 2\n', '0011\n0110\n0111\n1011\n1100\n1101\n1110\n1111\n'],
    // The problem PDF lists only 7 lines here and forgets 11100; the grader's own test for "5 3" has all 8.
    ['5 3\n', '00111\n01110\n01111\n10111\n11100\n11101\n11110\n11111\n'],
  ],
  gen: () => ['1 0\n', '1 1\n', '2 2\n', '8 0\n', '10 3\n', '12 5\n', '12 12\n', '16 13\n', '20 17\n', '20 20\n'],
  small: (H, r) => { const n = H.int(r, 1, 10); return `${n} ${H.int(r, 0, n)}\n`; },
};
