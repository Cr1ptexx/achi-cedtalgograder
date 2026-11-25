// Sorted distinct array + queries ("largest element not exceeding x", queries may be real numbers)
function inst(H, r, n, m, vmax, qmax, decimals) {
  const set = new Set();
  while (set.size < n) set.add(H.int(r, 1, vmax));
  const a = [...set].sort((x, y) => x - y);
  const qs = Array.from({ length: m }, () => {
    const t = r();
    if (t < 0.25) return H.pick(r, a);                            // exactly an element
    if (t < 0.3) return a[0] - 1;                                 // just below the minimum
    const q = H.int(r, 0, qmax);
    return decimals && r() < 0.5 ? `${q}.${H.pick(r, ['5', '25', '99', '01'])}` : q;
  });
  return `${n} ${m}\n${a.join(' ')}\n${qs.join(' ')}\n`;
}

export default {
  checker: 'exact',
  samples: [
    ['4 7\n14 15 20 30\n10 11 14 15 16 21 68\n', '-1\n-1\n14\n15\n15\n20\n30\n'],
  ],
  gen: (H) => {
    const r = H.rng(13);
    return [
      '1 3\n5\n4 5 6\n',
      '4 6\n14 15 20 30\n14.5 29.99 30.0 0.5 13.999 15.0\n',          // real-valued queries
      inst(H, r, 10, 20, 40, 45, false),
      inst(H, r, 200, 300, 1000, 1100, true),
      inst(H, r, 1000, 1000, 1000000, 1100000, false),
      inst(H, r, 30000, 30000, 1000000, 1000000, false),             // linear search per query is too slow
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 8), H.int(r, 1, 8), 30, 35, true),
};
