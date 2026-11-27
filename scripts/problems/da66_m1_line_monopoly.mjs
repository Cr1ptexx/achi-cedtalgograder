function inst(H, r, n, coordMax, pQuery, maxLen) {
  const ls = [];
  for (let i = 0; i < n - 1; i++) {
    if (r() < pQuery) ls.push('2');
    else { const a = H.int(r, 1, coordMax); ls.push(`1 ${a} ${Math.min(coordMax, a + H.int(r, 0, maxLen))}`); }
  }
  ls.push('2');
  return `${n}\n${ls.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3\n1 10 20\n1 4 7\n2\n', '2\n'],
    ['4\n1 10 20\n1 4 7\n1 5 11\n2\n', '1\n'],
    ['3\n1 5 10\n1 5 5\n2\n', '1\n'],
    ['4\n1 7 8\n1 3 4\n1 5 6\n2\n', '1\n'],
    ['9\n1 5 10\n1 15 20\n1 25 30\n1 35 40\n2\n1 7 37\n2\n1 2 3\n2\n', '4\n1\n2\n'],
  ],
  gen: (H) => {
    const r = H.rng(1484);
    return [
      '1\n2\n', '2\n1 1 1000000000\n2\n', inst(H, r, 12, 30, 0.3, 4), inst(H, r, 500, 1000, 0.01, 6), inst(H, r, 5000, 1000000000, 0.002, 1000),
      inst(H, r, 12000, 1000000000, 0.5, 20000), inst(H, r, 12000, 1000000000, 0.5, 5000000), inst(H, r, 12000, 100000, 0.5, 3),
      `40000\n${Array.from({ length: 39999 }, (_, i) => (i % 2 ? '2' : `1 ${i * 3 + 1} ${i * 3 + 1}`)).join('\n')}\n2\n`,  // 20000 isolated cells, a query between every insert
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 12), H.int(r, 3, 30), 0.3, H.int(r, 0, 6)),
};