function inst(H, r, k, n, cmax = 1000) {
  const c = Array.from({ length: k }, () => H.int(r, 0, cmax)), a = Array.from({ length: k }, () => H.int(r, 0, 1000));
  return `${k} ${n}\n${c.join(' ')}\n${a.join(' ')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['2 4\n2 10\n2 3\n', '424\n'],
    ['2 892\n6 4\n5 0\n', '15200\n'],
    ['3 4\n7 3 2\n4 4 2\n', '252\n'],
    ['5 16\n0 6 10 1 8\n0 10 9 0 4\n', '19462\n'],
    ['6 982\n5 7 4 9 9 5\n5 2 6 7 9 4\n', '408\n'],
  ],
  gen: (H) => {
    const r = H.rng(662);
    return ['2 1000\n1 1\n0 1\n', '1 1000\n1000\n7\n', '3 2\n1 2 3\n4 5 6\n', '4 4\n1 1 1 1\n1 2 3 4\n', '1 0\n5\n9\n', inst(H, r, 5, 20), inst(H, r, 5, 4), inst(H, r, 40, 1000), inst(H, r, 300, 1000), inst(H, r, 1000, 1000), inst(H, r, 1000, 999), inst(H, r, 1000, 1000, 1)];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 5), H.int(r, 0, 25)),
};