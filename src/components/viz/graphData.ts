export type GNode = { id: string; x: number; y: number };
export type GEdge = { a: string; b: string; w: number };

/** Small fixed weighted graph used by the graph and shortest-path chapters. */
export const G_NODES: GNode[] = [
  { id: 'A', x: 50, y: 50 }, { id: 'B', x: 170, y: 28 }, { id: 'C', x: 300, y: 55 },
  { id: 'D', x: 90, y: 150 }, { id: 'E', x: 205, y: 125 }, { id: 'F', x: 330, y: 150 }, { id: 'G', x: 180, y: 215 },
];
export const G_EDGES: GEdge[] = [
  { a: 'A', b: 'B', w: 4 }, { a: 'A', b: 'D', w: 2 }, { a: 'B', b: 'C', w: 6 }, { a: 'B', b: 'D', w: 5 },
  { a: 'B', b: 'E', w: 3 }, { a: 'C', b: 'E', w: 7 }, { a: 'C', b: 'F', w: 4 }, { a: 'D', b: 'E', w: 8 },
  { a: 'D', b: 'G', w: 9 }, { a: 'E', b: 'F', w: 1 }, { a: 'E', b: 'G', w: 5 }, { a: 'F', b: 'G', w: 3 },
];

export const edgeKey = (u: string, v: string) => (u < v ? `${u}-${v}` : `${v}-${u}`);

export function adjacency() {
  const adj: Record<string, { to: string; w: number }[]> = {};
  for (const n of G_NODES) adj[n.id] = [];
  for (const e of G_EDGES) { adj[e.a].push({ to: e.b, w: e.w }); adj[e.b].push({ to: e.a, w: e.w }); }
  for (const k of Object.keys(adj)) adj[k].sort((p, q) => p.to.localeCompare(q.to));
  return adj;
}
