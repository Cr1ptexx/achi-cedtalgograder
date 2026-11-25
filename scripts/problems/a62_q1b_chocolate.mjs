function inst(H, r, n, set) { return `${n} ${set.length}\n${H.shuffle(r, set).join(' ')}\n`; }
export default {
  checker: 'exact',
  samples: [
    ['4 2\n1 3\n', '3\n'],
    ['10 2\n1 2\n', '89\n'],
    ['10 5\n1 2 4 6 8\n', '196\n'],
    ['999 5\n1 2 4 50 999\n', '450619\n'],
  ],
  gen: (H) => {
    const r = H.rng(62);
    return [
      '2 1\n1\n', '2 2\n1 2\n', '10000 2\n1 2\n', '10000 1\n1\n', '9999 3\n1 100 9999\n',
      inst(H, r, 10000, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      inst(H, r, 10000, [1, 7, 13, 101, 1000, 5000, 9999, 3, 50, 777]),
      inst(H, r, 5000, [1, 2, 4, 8, 16, 32, 64, 128]),
      inst(H, r, 20, [1, 5, 20]),
      inst(H, r, 1234, [1, 10, 100, 1000]),
    ];
  },
  small: (H, r) => { const n = H.int(r, 2, 16); const cand = H.shuffle(r, H.range(n, 2)).slice(0, H.int(r, 0, 4)); return inst(H, r, n, [1, ...cand]); },
};