function inst(H, r, N, M, K, o = {}) {
  const mat = (f) => Array.from({ length: N }, () => Array.from({ length: M }, f).join(' ')).join('\n');
  const x = o.xlt ? null : 1;
  if (o.xlt) { // X < Y everywhere
    const X = Array.from({ length: N }, () => Array.from({ length: M }, () => H.int(r, 1, 499)));
    const Y = X.map((row) => row.map((v) => H.int(r, v + 1, 1000)));
    const Z = Array.from({ length: N }, () => Array.from({ length: M }, () => H.int(r, 0, o.zmax ?? 1000)));
    const s = (m) => m.map((row) => row.join(' ')).join('\n');
    return `${N} ${M} ${K}\n${s(X)}\n${s(Y)}\n${s(Z)}\n`;
  }
  const pmax = o.pmax ?? 1000, zmax = o.zmax ?? 1000;
  if (o.same) { // every NPC has identical buy prices and identical sell prices
    const xs = Array.from({ length: M }, () => H.int(r, 1, pmax)), ys = Array.from({ length: M }, () => H.int(r, 1, pmax));
    const rep = (v) => Array.from({ length: N }, () => v.join(' ')).join('\n');
    return `${N} ${M} ${K}\n${rep(xs)}\n${rep(ys)}\n${mat(() => H.int(r, 0, zmax))}\n`;
  }
  return `${N} ${M} ${K}\n${mat(() => H.int(r, 1, pmax))}\n${mat(() => H.int(r, 1, pmax))}\n${mat(() => H.int(r, 0, zmax))}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 2 3\n1 5\n2 1\n5 3\n2 7\n1 3\n4 2\n1 1\n2 1\n0 3\n', '14\n'],
    ['4 3 32\n461 710 494\n890 729 824\n279 507 263\n100 750 869\n212 167 25\n521 792 154\n563 425 361\n252 211 638\n509 150 252\n748 939 476\n795 793 515\n626 412 641\n', '14816\n'],
  ],
  gen: (H) => {
    const r = H.rng(681);
    return [
      inst(H, r, 1, 3, 5), inst(H, r, 5, 1, 4, {}), inst(H, r, 6, 4, 0), inst(H, r, 8, 8, 1), inst(H, r, 10, 10, 7), inst(H, r, 20, 20, 1000000000, { same: true }),
      inst(H, r, 50, 40, 1000000000), inst(H, r, 100, 100, 30000), inst(H, r, 200, 150, 400000, { xlt: true }), inst(H, r, 300, 100, 1000000000, { zmax: 1000 }), inst(H, r, 1000, 1, 100000), inst(H, r, 1, 1000, 100),
    ];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 4), H.int(r, 1, 3), H.int(r, 0, 12), { pmax: 9, zmax: 4 }),
};