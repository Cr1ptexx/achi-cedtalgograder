function inst(H, r, n, tmax, maxLen) {
  const S = Array.from({ length: n }, () => H.int(r, 0, tmax));
  const F = S.map((s) => s + H.int(r, 0, maxLen));
  return `${n}\n${S.join(' ')}\n${F.join(' ')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3\n1 4 6\n5 7 10\n', '2\n'],
    ['4\n1 2 3 4\n2 3 4 5\n', '4\n'],
  ],
  gen: (H) => {
    const r = H.rng(41);
    return [
      '1\n5\n5\n', '2\n1 1\n3 3\n', '3\n1 2 3\n3 3 3\n',          // zero-length class, clashes
      inst(H, r, 12, 30, 8), inst(H, r, 200, 1000, 40), inst(H, r, 2000, 100000, 500),
      inst(H, r, 5000, 100000, 100000), inst(H, r, 5000, 1000, 5),
      `5000\n${Array.from({ length: 5000 }, (_, i) => i).join(' ')}\n${Array.from({ length: 5000 }, (_, i) => i + 1).join(' ')}\n`,   // all fit back to back
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 9), 12, 5),
};