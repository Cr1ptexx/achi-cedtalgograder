function inst(H, r, n, k, q, coordMax, maxLen) {
  const iv = Array.from({ length: n }, () => { const l = H.int(r, 1, coordMax); return [l, Math.min(coordMax, l + H.int(r, 0, maxLen))]; });
  const xs = Array.from({ length: q }, () => (r() < 0.3 ? H.pick(r, iv)[H.int(r, 0, 1)] : H.int(r, 1, coordMax)));
  return `${n} ${k}\n${iv.map((x) => x.join(' ')).join('\n')}\n${q}\n${xs.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 1\n1 3\n2 5\n4 6\n5\n1\n2\n3\n5\n7\n', 'YES\nYES\nYES\nYES\nNO\n'],
    ['3 2\n1 4\n3 6\n4 8\n5\n2\n4\n6\n8\n9\n', 'NO\nYES\nYES\nNO\nNO\n'],
  ],
  gen: (H) => {
    const r = H.rng(1729);
    return [
      '1 1\n1 1\n1\n1\n', '1 1\n1000000000 1000000000\n2\n1000000000\n999999999\n', inst(H, r, 6, 2, 10, 15, 4), inst(H, r, 100, 3, 100, 100, 10), inst(H, r, 5000, 1, 5000, 1000000000, 1000000),
      inst(H, r, 12000, 5, 12000, 1000000000, 30000000), inst(H, r, 12000, 12000, 12000, 100000, 100000), inst(H, r, 12000, 2, 12000, 100000, 0), inst(H, r, 12000, 100, 12000, 1000000, 20000),
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 8); return inst(H, r, n, H.int(r, 1, n), H.int(r, 1, 8), 12, 5); },
};