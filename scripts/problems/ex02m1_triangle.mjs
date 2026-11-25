function tri(H, r, n, max, fill) {
  const rows = Array.from({ length: n }, (_, i) => Array.from({ length: i + 1 }, () => (fill ?? H.int(r, 0, max))));
  return `${n}\n${rows.map((x) => x.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['2\n10\n20 3\n', '30\n'],
    ['1\n9\n', '9\n'],
    ['5\n7\n3 8\n8 1 0\n2 7 4 4\n4 5 2 6 5\n', '30\n'],
  ],
  gen: (H) => {
    const r = H.rng(5);
    return [tri(H, r, 1, 0, 0), tri(H, r, 3, 9), tri(H, r, 10, 100), tri(H, r, 30, 1000), tri(H, r, 100, 1000), tri(H, r, 100, 0, 1000), tri(H, r, 100, 1), tri(H, r, 60, 1000)];
  },
  small: (H, r) => tri(H, r, H.int(r, 1, 10), 20),
};