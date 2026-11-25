/** assemble components of the given kinds, then shuffle the node labels */
function build(H, r, kinds) {
  const edges = []; let n = 0;
  for (const [kind, size] of kinds) {
    const base = n; n += size;
    if (kind === 'path') for (let i = 0; i + 1 < size; i++) edges.push([base + i, base + i + 1]);
    if (kind === 'cycle') for (let i = 0; i < size; i++) edges.push([base + i, base + (i + 1) % size]);
    if (kind === 'star') for (let i = 1; i < size; i++) edges.push([base, base + i]);
    if (kind === 'tree') for (const [a, b] of H.tree(r, size)) edges.push([base + a, base + b]);
    if (kind === 'dense') for (const [a, b] of H.edges(r, 0, size - 1, size * 2)) edges.push([base + a, base + b]);
  }
  const lab = H.shuffle(r, H.range(n));
  const es = H.shuffle(r, edges).map(([a, b]) => (r() < 0.5 ? [lab[a], lab[b]] : [lab[b], lab[a]]));
  return `${n} ${es.length}\n${es.map((x) => x.join(' ')).join('\n')}${es.length ? '\n' : ''}`;
}
export default {
  checker: 'exact',
  samples: [
    ['3 2\n0 1\n0 2\n', '1\n'],
    ['3 2\n1 0\n0 2\n', '1\n'],
    ['3 0\n', '3\n'],
    // The PDF prints 2 here, but 2-3-4 is a triangle (a cycle, so not a line graph) and the grader's own tests agree with 1.
    ['5 4\n0 1\n2 3\n3 4\n4 2\n', '1\n'],
    ['6 2\n1 2\n3 4\n', '4\n'],
    ['4 6\n0 1\n0 2\n0 3\n1 2\n1 3\n2 3\n', '0\n'],
  ],
  gen: (H) => {
    const r = H.rng(62);
    const many = (kind, size, count) => Array.from({ length: count }, () => [kind, size]);
    return [
      build(H, r, [['path', 2]]),
      build(H, r, [['path', 5], ['cycle', 4], ['star', 4], ['path', 1], ['path', 3]]),
      build(H, r, [['tree', 12]]),
      build(H, r, [['path', 20000]]),
      build(H, r, [...many('path', 7, 200), ...many('cycle', 5, 100), ...many('star', 6, 50), ...many('path', 1, 100)]),
      build(H, r, [...many('path', 3, 3000), ...many('tree', 5, 500)]),
      build(H, r, [['cycle', 20000]]),
      build(H, r, [...many('dense', 6, 20), ['path', 40]]),
    ];
  },
  small: (H, r) => {
    const kinds = Array.from({ length: H.int(r, 1, 3) }, () => [H.pick(r, ['path', 'cycle', 'star', 'tree', 'path']), H.int(r, 3, 4)]);
    return build(H, r, kinds);
  },
};