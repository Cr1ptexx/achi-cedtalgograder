import type { ReactNode } from 'react';
import { G_EDGES, G_NODES } from './graphData';

export type CellItem = { v: string | number; cls?: string; idx?: string | number };

/** A row of boxes, e.g. an array. cls: cmp | hit | done | dim | bad */
export function Cells({ items }: { items: CellItem[] }) {
  return (
    <div className="cells" aria-hidden="true">
      {items.map((c, k) => (
        <div key={k} className={`cell ${c.cls ?? ''}`}>
          <b>{c.v}</b>
          {c.idx !== undefined && <i>{c.idx}</i>}
        </div>
      ))}
    </div>
  );
}

/** A DP / distance table with row and column headers. */
export function Grid({ rows, cols, cells, corner }: {
  rows: (string | number)[];
  cols: (string | number)[];
  cells: { v: string | number; cls?: string }[][];
  corner?: ReactNode;
}) {
  return (
    <div className="grid-wrap" aria-hidden="true">
      <table className="grid-tbl">
        <thead>
          <tr><th>{corner}</th>{cols.map((c, k) => <th key={k}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {cells.map((r, i) => (
            <tr key={i}>
              <th>{rows[i]}</th>
              {r.map((c, j) => <td key={j} className={c.cls ?? ''}>{c.v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GraphSvg({ nodeCls, edgeCls, label, showW = true }: {
  nodeCls: Record<string, string>;
  edgeCls: Record<string, string>; // key "A-B"
  label?: Record<string, string | number>;
  showW?: boolean;
}) {
  const pos = Object.fromEntries(G_NODES.map((n) => [n.id, n]));
  return (
    <svg className="gsvg" viewBox="0 0 380 245" role="img" aria-label="กราฟตัวอย่าง 7 ปม">
      {G_EDGES.map((e) => {
        const p = pos[e.a], q = pos[e.b], key = `${e.a}-${e.b}`;
        return (
          <g key={key} className={`g-edge ${edgeCls[key] ?? ''}`}>
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
            {showW && <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 5}>{e.w}</text>}
          </g>
        );
      })}
      {G_NODES.map((n) => (
        <g key={n.id} className={`g-node ${nodeCls[n.id] ?? ''}`}>
          <circle cx={n.x} cy={n.y} r={17} />
          <text x={n.x} y={n.y + 5} textAnchor="middle">{n.id}</text>
          {label && label[n.id] !== undefined && <text className="g-lab" x={n.x} y={n.y - 24} textAnchor="middle">{label[n.id]}</text>}
        </g>
      ))}
    </svg>
  );
}

export function Chips({ title, items, cls }: { title: string; items: (string | number)[]; cls?: string }) {
  return (
    <div className="chips-row">
      <span className="chips-t">{title}</span>
      {items.length === 0 ? <span className="muted small">ว่าง</span> : items.map((x, k) => <span key={k} className={`chip2 ${cls ?? ''}`}>{x}</span>)}
    </div>
  );
}
