function inst(H, r, n, kmax, pmax) {
  const lines = [];
  for (let i = 3; i <= n; i++) {                                    // year i connects node i (1-based) to earlier nodes
    const k = H.int(r, 1, Math.min(kmax, i - 1));
    const ts = H.shuffle(r, H.range(i - 1, 1)).slice(0, k);
    lines.push(`${k} ${ts.map((t) => `${t} ${H.int(r, 0, pmax)}`).join(' ')}`);
  }
  return `${n} ${H.int(r, 0, 1000000)}\n${lines.join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [['5 10\n2 1 6 2 7\n3 1 1 3 1 2 9\n2 1 2 2 5\n', '10 9 7\n']],
  gen: (H) => {
    const r = H.rng(65);
    return [
      '3 5\n1 1 0\n', '3 1000000\n2 1 1000 2 1000\n', inst(H, r, 6, 3, 20), inst(H, r, 30, 5, 1000), inst(H, r, 100, 100, 1),
      inst(H, r, 150, 150, 1000), inst(H, r, 400, 4, 1000), inst(H, r, 700, 3, 1000),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 3, 7), 4, 12),
};