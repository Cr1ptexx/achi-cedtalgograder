function inst(H, r, n, q, cmax, xmax) {
  const g = Array.from({ length: n }, () => [H.int(r, 1, xmax), H.int(r, 1, cmax)]);
  const S = g.reduce((s, x) => s + x[1], 0);
  const ps = Array.from({ length: q }, () => H.int(r, 1, S));
  return `${n} ${q}\n${g.map((x) => x.join(' ')).join('\n')}\n${ps.join('\n')}\n`;
}
/** worst case for a per-query linear scan: N = Q = 100,000 (the statement's largest subtask) and every P near the end */
function worst(H, r) {
  const n = 100000, q = 100000;
  const g = Array.from({ length: n }, () => [H.int(r, 1, 2000000000), H.int(r, 1, 20000)]);
  const S = g.reduce((t, x) => t + x[1], 0);
  const ps = Array.from({ length: q }, () => S - H.int(r, 0, 1000));
  return `${n} ${q}\n${g.map((x) => x.join(' ')).join('\n')}\n${ps.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['5 2\n1 1\n10 1\n5 1\n1 1\n3 1\n5\n1\n', '10\n1\n'],
    ['5 3\n9 1\n4 5\n9 3\n8 3\n7 7\n1\n15\n8\n', '4\n8\n7\n'],
  ],
  gen: (H) => {
    const r = H.rng(65);
    return [
      '1 1\n2000000000 1\n1\n', '1 3\n7 2000000000\n1\n1000000000\n2000000000\n',        // 2 billion copies of one value: nobody can build the array
      inst(H, r, 8, 10, 3, 20), inst(H, r, 100, 200, 5, 10), inst(H, r, 1000, 1000, 1000, 2000000000), inst(H, r, 1000, 5000, 2000000, 2000000000),
      inst(H, r, 20000, 20000, 100000, 2000000000), inst(H, r, 20000, 20000, 1, 50),
      worst(H, r),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), H.int(r, 1, 8), 5, 9),
};