const fmt = (x) => (Math.round(x * 100) / 100).toString();
function inst(H, r, n, W, vmax, wmax) {
  const v = Array.from({ length: n }, () => fmt(H.int(r, 1, vmax * 100) / 100));
  const w = Array.from({ length: n }, () => fmt(H.int(r, 1, wmax * 100) / 100));
  return `${W} ${n}\n${v.join(' ')}\n${w.join(' ')}\n`;
}
export default {
  checker: 'float',
  samples: [
    ['6 3\n5 3 3\n4 3 3\n', '7.0000\n'],
    ['5.5 4\n2 3 4 5\n1 2 3 4\n', '8.3333\n'],
  ],
  gen: (H) => {
    const r = H.rng(42);
    return [
      '1 1\n10\n1\n', '1 1\n10\n4\n', '100 2\n5 6\n3 4\n',             // bag larger than everything / one item cut into a fraction
      inst(H, r, 10, 20, 50, 10), inst(H, r, 200, 300.5, 1000, 20), inst(H, r, 5000, 1234.56, 1000, 50),
      inst(H, r, 20000, 5000, 100000, 100), inst(H, r, 20000, 100000, 1000, 1000),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), fmt(H.int(r, 1, 3000) / 100), 20, 8),
};