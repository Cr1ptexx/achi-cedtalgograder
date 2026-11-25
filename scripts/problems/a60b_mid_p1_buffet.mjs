function inst(H, r, n, f, w) {
  const pos = H.shuffle(r, H.range(n, 1)).slice(0, f);
  return `${f} ${w} ${n}\n${pos.join(' ')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 0 10\n1 3 4\n', '3\n'],
    ['5 1 10\n1 2 3 5 6\n', '2\n'],
    ['10 5 10\n1 10 9 2 3 4 8 7 5 6\n', '1\n'],
  ],
  gen: (H) => {
    const r = H.rng(43);
    return [
      '1 0 1\n1\n', '1 10000 10000\n10000\n', inst(H, r, 30, 12, 2), inst(H, r, 200, 100, 3), inst(H, r, 10000, 10000, 0),
      inst(H, r, 10000, 3000, 1), inst(H, r, 10000, 1000, 4), inst(H, r, 10000, 5000, 300), inst(H, r, 10000, 10, 10000),
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 12); return inst(H, r, n, H.int(r, 1, n), H.int(r, 0, 4)); },
};