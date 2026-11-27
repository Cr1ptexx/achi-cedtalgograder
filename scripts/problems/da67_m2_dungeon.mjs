/** greedy cumulative cost per demon (same rule as the reference), used to put T right on the boundary */
function cumulative(dung, dem, Z) {
  const cost = Array.from({ length: Z }, () => []);
  for (const [t, z] of dung) cost[z].push(t);
  cost.forEach((c) => c.sort((a, b) => a - b));
  const nxt = Array(Z).fill(0); const out = []; let s = 0;
  for (const d of dem) { for (const z of d) { if (nxt[z] >= cost[z].length) return out; s += cost[z][nxt[z]++]; } out.push(s); }
  return out;
}
function inst(H, r, N, D, Z, qmax, costMax, tMode) {
  const dung = Array.from({ length: D }, () => [H.int(r, 0, costMax), H.int(r, 0, Z - 1)]);
  const dem = Array.from({ length: N }, () => Array.from({ length: H.int(r, 0, qmax) }, () => dung[H.int(r, 0, D - 1)][1]));
  const cum = cumulative(dung, dem, Z);
  let T;
  if (tMode === 'zero') T = 0;
  else if (tMode === 'huge') T = 1000000000;
  else if (cum.length === 0) T = H.int(r, 0, costMax);
  else T = Math.max(0, Math.min(1000000000, cum[H.int(r, 0, cum.length - 1)] + H.pick(r, [-1, 0, 0, 1])));
  return `${N} ${D} ${T} ${Z}\n${dung.map((x) => x.join(' ')).join('\n')}\n${dem.map((d) => [d.length, ...d].join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['1 1 10 1\n1 0\n1 0\n', '1\n'],
    ['1 1 10 2\n1 1\n1 0\n', '0\n'],
    ['3 5 100 10\n1 0\n4 9\n13 5\n95 0\n2 1\n3 0 9 5\n1 0\n1 1\n', '1\n'],
    ['3 5 100 10\n1 0\n4 9\n13 5\n40 0\n2 1\n3 0 9 5\n1 0\n1 1\n', '3\n'],
  ],
  gen: (H) => {
    const r = H.rng(1628);
    return [
      inst(H, r, 1, 1, 1, 1, 5, 'mid'), inst(H, r, 6, 8, 3, 2, 9, 'mid'), inst(H, r, 50, 60, 8, 3, 100, 'mid'), inst(H, r, 90, 99, 20, 5, 1000, 'mid'),
      inst(H, r, 900, 990, 40, 8, 100000, 'mid'), inst(H, r, 20000, 40000, 300, 3, 1000000, 'mid'), inst(H, r, 20000, 40000, 5, 3, 1000, 'huge'), inst(H, r, 5000, 20000, 1000, 6, 1000000000, 'mid'),
      inst(H, r, 3000, 3000, 2, 1, 500, 'zero'),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 6), H.int(r, 1, 9), H.int(r, 1, 4), H.int(r, 0, 3), 6, 'mid'),
};