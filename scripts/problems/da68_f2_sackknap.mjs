function items(H, r, n, V, pmax, same) {
  const lines = Array.from({ length: n }, () => { const w = H.int(r, 1, V); return `${w} ${same ? w : H.int(r, 1, pmax)}`; });
  return `${n} ${V}\n${lines.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 10\n5 100\n5 50\n2 20\n', '150\n'],
    ['5 20\n6 10\n6 10\n6 10\n6 10\n3 5\n', '-1\n'],
    ['20 100\n12 50\n15 80\n10 30\n8 25\n20 100\n7 20\n5 15\n25 120\n18 70\n14 55\n6 18\n9 35\n11 45\n13 60\n17 85\n4 12\n16 75\n22 95\n3 10\n21 110\n', '363\n'],
  ],
  gen: (H) => {
    const r = H.rng(683);
    return [
      '1 1\n1 5\n', '1 4\n5 5\n', '2 6\n3 1000000000\n3 1000000000\n', items(H, r, 20, 60, 100, false), items(H, r, 15, 100, 50, true),
      items(H, r, 200, 1000, 1000000, false), items(H, r, 1000, 1000, 1000000, false),
      items(H, r, 3000, 5000, 1000000000, false),
      items(H, r, 10000, 10000, 1000000000, false),         // n * V = 10^8
    ];
  },
  small: (H, r) => items(H, r, H.int(r, 1, 8), H.int(r, 1, 14), 30, r() < 0.2),
};