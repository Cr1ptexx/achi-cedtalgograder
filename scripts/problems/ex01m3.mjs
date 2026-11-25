function inst(H, r, n, a, tmax, cmax) {
  const T = Array.from({ length: n }, () => H.int(r, 1, tmax));
  const cs = Array.from({ length: a }, () => (r() < 0.2 ? H.int(r, 1, n + 3) : 1 + Math.floor(r() * cmax)));
  return `${n} ${a}\n${T.join(' ')}\n${cs.join(' ')}\n`;
}

export default {
  checker: 'exact',
  samples: [
    ['3 5\n2 2 5\n4 5 6 30 123456789012\n', '2\n2\n4\n24\n102880657508\n'],
  ],
  gen: (H) => {
    const r = H.rng(31);
    return [
      '1 4\n1\n1 2 3 1000000000000\n',
      '1 3\n1000\n1 2 1000000000000\n',                         // one slow chef, huge customer number
      '5 5\n7 7 7 7 7\n1 5 6 10 11\n',
      inst(H, r, 3, 30, 10, 60),
      inst(H, r, 50, 100, 1000, 100000),
      inst(H, r, 1000, 200, 1000, 1e12),                        // simulating customer by customer is too slow
      inst(H, r, 1000, 200, 3, 1e12),
      `1000 3\n${Array(1000).fill(1000).join(' ')}\n1000000000000 999999999999 1000000000001\n`,
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), H.int(r, 1, 10), 9, 200),
};
