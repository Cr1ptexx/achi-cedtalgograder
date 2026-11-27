function inst(H, r, n, coordMax, maxLen) {
  const ls = Array.from({ length: n }, () => { const a = H.int(r, 1, coordMax); return `${a} ${Math.min(coordMax, a + H.int(r, 0, maxLen))}`; });
  return `${n}\n${ls.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['2\n10 20\n4 7\n', '4 7 10 20\n'],
    ['3\n10 20\n4 7\n5 11\n', '4 20\n'],
    ['2\n5 10\n11 15\n', '5 15\n'],
    ['3\n7 8\n3 4\n5 6\n', '3 8\n'],
    ['6\n5 10\n15 20\n25 30\n35 40\n7 37\n2 3\n', '2 3 5 40\n'],
  ],
  gen: (H) => {
    const r = H.rng(2004);
    return [
      '1\n1 1\n', '1\n1000000000 1000000000\n', inst(H, r, 5, 40, 3), inst(H, r, 500, 1000, 5), inst(H, r, 5000, 1000000000, 100000), inst(H, r, 5000, 1000000000, 100000000),
      inst(H, r, 12000, 1000000000, 1000), inst(H, r, 12000, 1000000000, 30000000), inst(H, r, 12000, 80000, 2),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 8), H.int(r, 2, 40), H.int(r, 0, 5)),
};