function inst(H, r, v, e) {
  const es = H.edges(r, 1, v, e);
  return `${v} ${es.length}\n${es.map((x) => x.join(' ')).join('\n')}${es.length ? '\n' : ''}`;
}
export default {
  checker: 'exact',
  samples: [
    ['4 3\n1 2\n2 3\n3 1\n', '2\n'],
    ['5 0\n', '5\n'],
    ['5 1\n1 2\n', '4\n'],
    ['5 2\n1 2\n4 5\n', '3\n'],
    ['10 7\n1 2\n2 3\n3 4\n1 3\n2 4\n5 6\n6 7\n', '5\n'],
  ],
  gen: (H) => {
    const r = H.rng(60);
    const chain = (n) => `${n} ${n - 1}\n${Array.from({ length: n - 1 }, (_, i) => `${i + 1} ${i + 2}`).join('\n')}\n`;
    return ['1 0\n', '2 1\n1 2\n', inst(H, r, 20, 10), inst(H, r, 200, 150), inst(H, r, 10000, 3000), inst(H, r, 10000, 6000), inst(H, r, 10000, 10000), chain(10000), inst(H, r, 3000, 10000)];
  },
  small: (H, r) => { const v = H.int(r, 1, 9); return inst(H, r, v, H.int(r, 0, v * (v - 1) / 2)); },
};