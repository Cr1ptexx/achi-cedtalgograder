function cells(H, r, R, C, k) {
  const seen = new Set(), out = [];
  const cap = R * C;
  k = Math.min(k, cap);
  if (cap <= 4 * k) { // dense: pick from all cells
    const all = H.shuffle(r, Array.from({ length: cap }, (_, i) => i)).slice(0, k);
    return all.map((i) => [Math.floor(i / C) + 1, (i % C) + 1]);
  }
  while (out.length < k) { const p = H.int(r, 1, R), q = H.int(r, 1, C), key = p * 2000000000 + q; if (seen.has(key)) continue; seen.add(key); out.push([p, q]); }
  return out;
}
function inst(H, r, R, C, k, Q) {
  const fav = cells(H, r, R, C, k);
  const qs = Array.from({ length: Q }, () => (r() < 0.1 ? H.pick(r, fav) : [H.int(r, 1, R), H.int(r, 1, C)]));
  return `${R} ${C} ${fav.length}\n${fav.map((x) => x.join(' ')).join('\n')}\n${Q}\n${qs.map((x) => x.join(' ')).join('\n')}\n`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 3 1\n2 2\n1\n1 1\n', '4\n'],
    ['3 3 2\n2 3\n3 2\n1\n2 3\n', '0\n'],
    ['3 3 2\n3 1\n2 3\n2\n2 2\n1 2\n', '1\n4\n'],
    ['4 2 3\n3 2\n4 1\n2 2\n2\n3 1\n2 1\n', '1\n1\n'],
    ['2 5 1\n1 3\n2\n1 2\n1 4\n', '1\n9\n'],
  ],
  gen: (H) => {
    const r = H.rng(1589);
    return [
      '1 1 1\n1 1\n1\n1 1\n', '1000000000 1000000000 1\n1 1\n2\n1000000000 1000000000\n1 1\n', inst(H, r, 3, 3, 3, 5), inst(H, r, 50, 50, 20, 100), inst(H, r, 1000000000, 1000000000, 100, 100),
      inst(H, r, 1000000000, 1000000000, 8000, 8000), inst(H, r, 1, 1000000000, 8000, 8000), inst(H, r, 1000000000, 1, 8000, 8000), inst(H, r, 300, 300, 12000, 12000),
    ];
  },
  small: (H, r) => { const R = H.int(r, 1, 6), C = H.int(r, 1, 6); return inst(H, r, R, C, H.int(r, 1, R * C), H.int(r, 1, 6)); },
};