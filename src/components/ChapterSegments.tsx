import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { catalog } from '../data/catalog';
import { getStatus } from '../store/progress';

/** One segment per chapter, filled by how many of its problems are solved. */
export default function ChapterSegments() {
  return (
    <div className="segments" role="list" aria-label="ความคืบหน้าแยกตามบท">
      {chapters.map((c) => {
        const probs = catalog.filter((p) => p.chapter === c.slug);
        const done = probs.filter((p) => getStatus(p.code) === 'solved').length;
        const pct = probs.length ? (done / probs.length) * 100 : 0;
        const tip = `บท ${c.num} ${c.title}: ผ่าน ${done}/${probs.length} ข้อ`;
        return (
          <Link key={c.slug} role="listitem" to={`/ch/${c.slug}`} className={`seg-cell ${probs.length && done === probs.length ? 'full' : ''}`} title={tip} aria-label={tip}>
            <span className="seg-bar"><i style={{ width: `${pct}%` }} /></span>
            <span className="seg-num">{c.num}</span>
          </Link>
        );
      })}
    </div>
  );
}
