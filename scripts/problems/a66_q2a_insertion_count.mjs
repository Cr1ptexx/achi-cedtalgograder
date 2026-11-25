function inst(H, r, n, m, mode) {
  let a = H.shuffle(r, H.range(n, 1));
  if (mode === 'sorted') a = H.range(n, 1);
  if (mode === 'reversed') a = H.range(n, 1).reverse();
  if (mode === 'near') { a = H.range(n, 1); for (let i = 0; i < Math.max(1, n / 20); i++) { const x = H.int(r, 0, n - 2); [a[x], a[x + 1]] = [a[x + 1], a[x]]; } }
  const qs = Array.from({ length: m }, () => H.pick(r, a));
  return `${n} ${m}\n${a.join(' ')}\n${qs.join(' ')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['6 2\n3 4 6 2 1 5\n6 2\n', '0\n3\n'],
    ['6 6\n3 4 6 2 1 5\n6 5 4 3 2 1\n', '0\n1\n0\n0\n3\n4\n'],
    ['10 5\n10 9 8 3 1 4 2 5 7 6\n6 2 8 5 7\n', '4\n5\n2\n3\n3\n'],
  ],
  gen: (H) => {
    const r = H.rng(66);
    return [
      '2 1\n1 2\n1\n', '2 2\n2 1\n1 2\n', inst(H, r, 12, 6, 'random'), inst(H, r, 400, 100, 'random'), inst(H, r, 3000, 300, 'near'),
      inst(H, r, 10000, 500, 'random'), inst(H, r, 40000, 1000, 'random'), inst(H, r, 40000, 1000, 'reversed'), inst(H, r, 40000, 1000, 'sorted'),
    ];
  },
  small: (H, r) => { const n = H.int(r, 2, 9); return inst(H, r, n, H.int(r, 1, n), 'random'); },
};