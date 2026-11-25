function inst(H, r, n, m, k, amax, bmax) {
  const A = Array.from({ length: n }, () => H.int(r, 0, amax));
  const qs = Array.from({ length: m }, () => `${H.int(r, 0, n - 1)} ${r() < 0.1 ? H.int(r, 0, 30) : Math.floor(r() * bmax)}`);
  return `${n} ${m} ${k}\n${A.join(' ')}\n${qs.join('\n')}\n`;
}

export default {
  checker: 'exact',
  samples: [
    ['5 5 0\n1 2 3 4 5\n1 5\n1 8\n1 9\n1 10\n1 14\n', '5\n5\n9\n9\n14\n'],
    ['5 4 2\n1 1 1 1 1\n0 2\n0 5\n0 10\n0 1000\n', '0\n1\n3\n5\n'],
  ],
  gen: (H) => {
    const r = H.rng(641);
    return [
      '1 2 0\n0\n0 0\n0 5\n',                                   // single zero-grass cell, free to cut
      '1 3 1000\n1000\n0 0\n0 1999\n0 2000\n',
      inst(H, r, 30, 40, 3, 20, 200),
      inst(H, r, 1000, 1000, 17, 1000, 300000),
      inst(H, r, 2000, 2000, 0, 1000, 1000000),                 // k = 0
      inst(H, r, 5000, 5000, 1000, 1000, 4000000),
      // budgets large enough that every query scans most of the array when done one cell at a time
      inst(H, r, 40000, 40000, 5, 1000, 40000000),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 10), H.int(r, 1, 10), H.int(r, 0, 4), 9, 60),
};
