const f4 = (x) => (Math.round(x * 10000) / 10000).toString();
/** consistent rates v_j / v_i with a little loss on every edge (no profit possible); `profitCycle` > 0 plants a profitable cycle of that length */
function table(H, r, n, profitCycle) {
  const v = Array.from({ length: n }, () => 0.5 + r() * 4.5);
  const f = Array.from({ length: n }, () => Array.from({ length: n }, () => 0.9 + r() * 0.08));
  if (profitCycle > 1) {
    const cyc = H.shuffle(r, H.range(n)).slice(0, Math.min(n, profitCycle));
    const gain = Math.pow(1.08, 1 / cyc.length);
    cyc.forEach((a, i) => { f[a][cyc[(i + 1) % cyc.length]] = gain; });
  }
  const rows = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? '1' : f4((v[j] / v[i]) * f[i][j]))));
  return `${n}\n${rows.map((x) => x.join(' ')).join('\n')}\n`;
}
const wrap = (tables) => `${tables.length}\n${tables.join('')}`;
export default {
  checker: 'exact',
  samples: [['2\n3\n1 0.7 1.2\n1.1 1 2\n0.75 0.7 1\n2\n1 0.7\n1.2 1\n', 'YES\nNO\n']],
  gen: (H) => {
    const r = H.rng(67);
    return [
      wrap(['1\n1\n', '2\n1 0.5\n2 1\n']),                                         // exactly 1.0 around the cycle: not a profit
      wrap(['2\n1 2\n0.5 1.0001\n'.replace('1.0001', '1'), '2\n1 2.01\n0.5 1\n']),
      wrap([table(H, r, 5, 0), table(H, r, 5, 3), table(H, r, 8, 0), table(H, r, 8, 2)]),
      wrap([table(H, r, 30, 0), table(H, r, 30, 7), table(H, r, 30, 30), table(H, r, 40, 0)]),
      wrap(Array.from({ length: 6 }, (_, i) => table(H, r, 50, i % 2 ? 5 : 0))),
      wrap([table(H, r, 100, 0), table(H, r, 100, 40), table(H, r, 100, 2)]),
    ];
  },
  small: (H, r) => wrap(Array.from({ length: 2 }, () => { const n = H.int(r, 1, 5); return table(H, r, n, r() < 0.5 ? 0 : H.int(r, 2, 5)); })),
};