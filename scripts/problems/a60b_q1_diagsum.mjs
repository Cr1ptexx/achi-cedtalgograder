function grid(H, r, n, lo, hi) {
  return `${n}\n` + Array.from({ length: n }, () => Array.from({ length: n }, () => H.int(r, lo, hi)).join(' ')).join('\n') + '\n';
}
export default {
  checker: 'exact',
  samples: [
    ['4\n1 2 3 4\n-2 -5 2 -5\n6 3 -7 1\n3 -2 7 -9\n', '10\n'],
    ['2\n1 2\n3 4\n', '5\n'],
    ['4\n-1 -1 -1 -1\n-1 -1 -1 -1\n-1 -1 -1 -1\n-1 -1 -1 -1\n', '-1\n'],
  ],
  gen: (H) => {
    const r = H.rng(8);
    return [
      '1\n7\n', '1\n-999\n', grid(H, r, 3, -9, 9), grid(H, r, 20, -999, 999), grid(H, r, 20, -999, 100),
      grid(H, r, 60, -50, 60), grid(H, r, 150, -999, 999), grid(H, r, 150, -999, 0), grid(H, r, 250, -999, 999),
      `200\n${Array.from({ length: 200 }, () => Array(200).fill(999).join(' ')).join('\n')}\n`,
    ];
  },
  small: (H, r) => grid(H, r, H.int(r, 1, 7), -9, 9),
};