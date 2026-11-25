function inst(H, r, n, m, chain) {
  const co = Array.from({ length: n }, () => H.int(r, 1, 1000)), ci = Array.from({ length: n }, () => H.int(r, 1, 1000));
  const have = new Set(), es = [];
  const add = (a, b) => { if (a === b || have.has(a * 4096 + b)) return; have.add(a * 4096 + b); es.push([a, b]); };
  if (chain) { const order = [0, ...H.shuffle(r, H.range(n - 1, 1))]; for (let i = 0; i + 1 < n; i++) add(order[i], order[i + 1]); }
  m = Math.min(m, n * n - n);
  for (let guard = 0; es.length < m && guard < m * 20 + 100; guard++) add(H.int(r, 0, n - 1), H.int(r, 0, n - 1));
  return `${n} ${es.length}\n${ci.join(' ')}\n${co.join(' ')}\n${H.shuffle(r, es).map((e) => e.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['4 3\n100 1 2 3\n10 20 30 40\n0 1\n1 2\n2 3\n', '0 11 33 66\n'],
    ['4 6\n1 2 3 4\n9 8 7 6\n0 2\n0 3\n2 3\n1 0\n1 3\n1 2\n', '0 -1 12 13\n'],
    ['5 10\n5 7 3 4 8\n1 4 4 2 6\n0 3\n0 4\n4 3\n3 4\n0 1\n4 1\n1 2\n2 4\n2 0\n1 0\n', '0 8 15 5 9\n'],
  ],
  gen: (H) => {
    const r = H.rng(661);
    return [inst(H, r, 1, 1, false).replace('1 0', '1 0'), inst(H, r, 3, 4, true), inst(H, r, 30, 80, true), inst(H, r, 100, 150, false), inst(H, r, 400, 2000, true), inst(H, r, 1000, 8000, false), inst(H, r, 2000, 1999, true), inst(H, r, 2000, 60000, true)];
  },
  small: (H, r) => { const n = H.int(r, 2, 7); return inst(H, r, n, H.int(r, 1, n * 2), r() < 0.5); },
};