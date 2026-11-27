function inst(H, r, n, mode) {
  let a;
  if (mode === 'sorted') a = Array.from({ length: n }, () => H.int(r, -1000000000, 1000000000)).sort((x, y) => x - y);
  else if (mode === 'bits') a = Array.from({ length: n }, () => H.int(r, 0, 1));
  else if (mode === 'equal') a = Array(n).fill(7);
  else if (mode === 'reversed') a = Array.from({ length: n }, () => H.int(r, -1000000000, 1000000000)).sort((x, y) => y - x);
  else a = Array.from({ length: n }, () => H.int(r, -1000000000, 1000000000));
  return `${n}\n${a.join(' ')}\n`;
}
export default {
  checker: 'exact',
  samples: [['3\n3 1 2\n', '2\n'], ['5\n0 1 1 0 1\n', '4\n'], ['7\n0 0 0 0 0 0 0\n', '9\n']],
  gen: (H) => {
    const r = H.rng(1733);
    return ['1\n5\n', '2\n2 1\n', inst(H, r, 15, 'random'), inst(H, r, 1000, 'random'), inst(H, r, 1000, 'sorted'), inst(H, r, 1000, 'bits'), inst(H, r, 40000, 'random'), inst(H, r, 40000, 'sorted'), inst(H, r, 40000, 'reversed'), inst(H, r, 40000, 'bits'), inst(H, r, 40000, 'equal')];
  },
  small: (H, r) => inst(H, r, H.int(r, 1, 20), H.pick(r, ['random', 'bits', 'equal', 'sorted'])),
};