function inst(H, r, n, e) { const es = H.edges(r, 0, n - 1, e); return `${n} ${es.length}\n${es.map((x) => (r() < 0.5 ? x : [x[1], x[0]]).join(' ')).join('\n')}${es.length ? '\n' : ''}`; }
const ring = (n) => `${n} ${n}\n${Array.from({ length: n }, (_, i) => `${i} ${(i + 1) % n}`).join('\n')}\n`;
const complete = (n) => { const es = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) es.push(`${i} ${j}`); return `${n} ${es.length}\n${es.join('\n')}\n`; };
export default {
  checker: 'exact',
  samples: [['4 6\n0 1\n0 2\n0 3\n1 2\n1 3\n2 3\n', '4\n']],
  gen: (H) => {
    const r = H.rng(73);
    return [
      '1 0\n', '5 0\n', '2 1\n0 1\n', ring(7), ring(10), complete(9), inst(H, r, 10, 20), inst(H, r, 20, 60),
      inst(H, r, 30, 90), inst(H, r, 40, 120), inst(H, r, 50, 100), inst(H, r, 50, 300),
    ];
  },
  small: (H, r) => { const n = H.int(r, 1, 7); return inst(H, r, n, H.int(r, 0, n * (n - 1) / 2)); },
};