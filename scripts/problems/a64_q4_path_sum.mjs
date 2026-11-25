// Weighted undirected graph, 8 queries "is there a simple path of total weight K?"
function graph(H, r, n, m, wmax, mode = 'random') {
  const have = new Set(), edges = [];
  const add = (a, b) => {
    if (a === b) return;
    [a, b] = a < b ? [a, b] : [b, a];
    const key = a * 100 + b;
    if (have.has(key) || edges.length >= m) return;
    have.add(key); edges.push([a, b, H.int(r, 1, wmax)]);
  };
  if (mode === 'ring') for (let i = 0; i < n; i++) add(i, (i + 1) % n);
  if (mode === 'tree') for (let i = 1; i < n; i++) add(H.int(r, 0, i - 1), i);
  let guard = 0;
  while (edges.length < m && guard++ < 10000) add(H.int(r, 0, n - 1), H.int(r, 0, n - 1));
  return edges;
}

/** weight of a random simple path (random walk that never revisits) */
function randomPathSum(H, r, n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b, w] of edges) { adj[a].push([b, w]); adj[b].push([a, w]); }
  let v = H.int(r, 0, n - 1), sum = 0;
  const seen = new Set([v]);
  const steps = H.int(r, 1, n - 1);
  for (let s = 0; s < steps; s++) {
    const opts = adj[v].filter(([u]) => !seen.has(u));
    if (!opts.length) break;
    const [u, w] = H.pick(r, opts);
    seen.add(u); sum += w; v = u;
  }
  return sum;
}

function build(H, r, n, m, wmax, kmax, mode, yesCount) {
  const edges = graph(H, r, n, m, wmax, mode);
  const ks = [];
  for (let i = 0; i < 8; i++) {
    const s = i < yesCount ? randomPathSum(H, r, n, edges) : H.int(r, 1, kmax);
    ks.push(Math.min(Math.max(s, 1), kmax));
  }
  const order = H.shuffle(r, ks);
  return `${n} ${edges.length}\n${order.join(' ')}\n` + edges.map((e) => e.join(' ')).join('\n') + '\n';
}

export default {
  checker: 'exact',
  samples: [
    ['4 4\n10 20 30 40 50 60 70 80\n0 1 10\n0 2 15\n1 2 5\n0 3 35\n', 'YES\nYES\nNO\nNO\nYES\nNO\nNO\nNO\n'],
  ],
  gen: (H) => {
    const r = H.rng(64);
    return [
      '2 1\n10 1 2 3 4 5 6 7\n0 1 10\n',
      build(H, r, 8, 28, 50, 400, 'random', 4),          // complete graph on 8 nodes
      build(H, r, 9, 36, 30, 250, 'random', 3),          // complete graph on 9 nodes, mostly NO
      build(H, r, 10, 45, 20, 190, 'random', 6),         // complete graph on 10 nodes
      build(H, r, 20, 19, 1000, 20000, 'tree', 5),       // 20 nodes, a tree
      build(H, r, 20, 20, 1000, 20000, 'ring', 4),       // 20 nodes, one big cycle
      build(H, r, 20, 28, 1000, 20000, 'ring', 5),       // cycle plus a few chords
      build(H, r, 20, 24, 600, 20000, 'tree', 2),
      build(H, r, 14, 18, 100, 1400, 'ring', 3),
      build(H, r, 12, 14, 1000, 11000, 'tree', 0),       // all NO
    ];
  },
  small: (H, r) => {
    const n = H.int(r, 2, 7), pairs = n * (n - 1) / 2;
    return build(H, r, n, H.int(r, 1, pairs), 9, 40, 'random', H.int(r, 0, 6));
  },
};
