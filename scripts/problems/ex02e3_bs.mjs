// Sorted array with repeated values, "largest index i with A[i] <= x"
function inst(H, r, n, m, vmax, qmax) {
  const a = H.range(n).map(() => H.int(r, 1, vmax)).sort((x, y) => x - y);
  const qs = Array.from({ length: m }, () => (r() < 0.3 ? H.pick(r, a) : H.int(r, 0, qmax)));
  return `${n} ${m}\n${a.join(' ')}\n${qs.join(' ')}\n`;
}

export default {
  checker: 'exact',
  samples: [
    ['10 8\n10 13 14 14 14 15 16 16 18 200\n9 10 11 14 0 200 20 16\n', '-1\n0\n0\n4\n-1\n9\n8\n7\n'],
  ],
  gen: (H) => {
    const r = H.rng(23);
    return [
      '1 4\n5\n4 5 6 1000000\n',
      '6 5\n7 7 7 7 7 7\n6 7 8 1 7\n',                          // every element equal
      inst(H, r, 15, 30, 8, 10),
      inst(H, r, 500, 500, 60, 70),
      inst(H, r, 30000, 30000, 1000000, 1000000),               // linear search per query is too slow
      inst(H, r, 30000, 30000, 50, 55),                         // huge runs of equal values
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 9), H.int(r, 1, 9), 8, 10),
};
