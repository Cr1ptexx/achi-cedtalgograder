/** open nodes always form a connected graph containing 1 and n, so a route exists whatever is closed */
function inst(H, r, n, extra, k, wmax) {
  const interior = H.shuffle(r, H.range(n - 2, 2));
  const closed = interior.slice(0, Math.min(k, interior.length));
  const closedSet = new Set(closed);
  const open = [1, n, ...interior.filter((x) => !closedSet.has(x))];
  const order = H.shuffle(r, open);
  const have = new Set(), es = [];
  const add = (a, b) => { if (a === b) return; const x = Math.min(a, b), y = Math.max(a, b); const key = x * 1000003 + y; if (have.has(key)) return; have.add(key); es.push([a, b, H.int(r, 1, wmax)]); };
  for (let i = 1; i < order.length; i++) add(order[H.int(r, 0, i - 1)], order[i]);
  for (const c of closed) add(c, H.int(r, 1, n));                      // closed cities have roads too
  for (let g = 0; es.length < n - 1 + extra && g < extra * 20 + 100; g++) add(H.int(r, 1, n), H.int(r, 1, n));
  const lines = [`${n} ${es.length} ${closed.length}`];
  if (closed.length) lines.push(closed.join(' '));
  for (const e of H.shuffle(r, es)) lines.push(e.join(' '));
  return lines.join('\n') + '\n';
}
export default {
  checker: 'exact',
  samples: [
    ['4 5 0\n1 2 3\n2 3 4\n3 4 2\n1 3 10\n2 4 20\n', '9\n'],
    ['5 6 2\n3 4\n1 2 5\n2 3 3\n3 5 2\n1 4 1\n4 5 2\n2 5 15\n', '20\n'],
  ],
  gen: (H) => {
    const r = H.rng(1734);
    return [
      inst(H, r, 3, 0, 0, 10), inst(H, r, 3, 2, 1, 10), inst(H, r, 12, 10, 3, 20), inst(H, r, 100, 300, 20, 1000), inst(H, r, 500, 2000, 100, 1000000), inst(H, r, 500, 2000, 0, 1000000),
      inst(H, r, 6000, 12000, 1500, 1000000000), inst(H, r, 8000, 24000, 0, 1000000000), inst(H, r, 8000, 16000, 5000, 1000),
    ];
  },
  small: (H, r) => { const n = H.int(r, 3, 9); return inst(H, r, n, H.int(r, 0, 2 * n), H.int(r, 0, n - 2), 9); },
};