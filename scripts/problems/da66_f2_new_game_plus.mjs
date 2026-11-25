function inst(H, r, R, C, density) {
  const g = Array.from({ length: R }, () => Array.from({ length: C }, () => (r() < density ? 1 : 0)));
  return `${R} ${C}\n${g.map((row) => row.join(' ')).join('\n')}\n`;
}
const zeros = (R, C) => `${R} ${C}\n${Array.from({ length: R }, () => Array(C).fill(0).join(' ')).join('\n')}\n`;
export default {
  checker: 'exact',
  samples: [
    ['2 2\n0 0\n0 0\n', '4\n'],
    ['2 3\n0 1 0\n0 0 0\n', '3\n'],
    ['2 3\n1 0 0\n1 0 0\n', '0\n'],
    ['3 3\n0 1 0\n0 0 1\n0 1 0\n', '4\n'],
    [zeros(25, 25), '43099679\n'],
  ],
  gen: (H) => {
    const r = H.rng(666);
    return [zeros(2, 20), zeros(3, 3), inst(H, r, 25, 25, 0.1), inst(H, r, 25, 25, 0.3), inst(H, r, 2, 500, 0.1), inst(H, r, 100, 100, 0.15), inst(H, r, 200, 300, 0.05), zeros(300, 300), inst(H, r, 400, 400, 0.02), inst(H, r, 500, 100, 0)];
  },
  small: (H, r) => inst(H, r, H.int(r, 2, 5), H.int(r, 2, 6), 0.2),
};