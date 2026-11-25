function inst(H, r, n, extra, k, wmax, unit) {
  const have = new Set(), es = [];
  const add = (a, b) => { if (a > b) [a, b] = [b, a]; if (a === b || have.has(a * 1024 + b)) return; have.add(a * 1024 + b); es.push([a, b, unit ? 1 : H.int(r, 1, wmax)]); };
  const order = H.shuffle(r, H.range(n, 1));
  for (let i = 1; i < n; i++) add(order[H.int(r, 0, i - 1)], order[i]);
  const target = Math.min(n * (n - 1) / 2, n - 1 + extra);
  for (let g = 0; es.length < target && g < target * 20 + 100; g++) add(H.int(r, 1, n), H.int(r, 1, n));
  const s = H.shuffle(r, H.range(n, 1)).slice(0, k);
  return `${n} ${es.length} ${k}\n${s.join(' ')}\n${H.shuffle(r, es).map((e) => e.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 3 3\n1 2 3\n2 3 7\n1 2 15\n1 3 4\n', '11\n'],
    ['4 6 4\n1 2 3 4\n1 2 38\n1 4 97\n2 4 47\n3 4 38\n2 3 24\n1 3 75\n', '100\n'],
    ['5 4 2\n3 5\n1 2 22\n2 3 78\n3 4 30\n4 5 39\n', '69\n'],
    ['5 5 3\n2 3 5\n1 2 1\n2 3 7\n3 4 250\n4 5 18\n1 5 4\n', '12\n'],
    ['14 25 3\n8 11 6\n2 9 28\n10 13 710\n2 3 997\n4 8 13\n7 11 934\n5 10 351\n3 12 946\n3 8 323\n5 11 193\n7 12 83\n5 6 959\n9 10 719\n2 8 508\n1 7 394\n12 14 94\n8 14 791\n4 13 522\n2 12 335\n4 10 487\n8 13 26\n4 12 52\n1 4 806\n5 9 344\n5 12 211\n1 6 905\n', '1621\n'],
  ],
  gen: (H) => {
    const r = H.rng(672);
    return [inst(H, r, 2, 0, 2, 1000), inst(H, r, 8, 100, 8, 1000), inst(H, r, 30, 60, 5, 1000), inst(H, r, 100, 100, 8, 1, true), inst(H, r, 200, 3000, 8, 1000), inst(H, r, 500, 0, 8, 1000), inst(H, r, 500, 1500, 8, 1000), inst(H, r, 500, 12000, 8, 1000), inst(H, r, 500, 600, 8, 3), inst(H, r, 60, 1710, 8, 1000)];
  },
  small: (H, r) => { const n = H.int(r, 2, 9); return inst(H, r, n, H.int(r, 0, n * 2), H.int(r, 2, Math.min(n, 6)), 20); },
};