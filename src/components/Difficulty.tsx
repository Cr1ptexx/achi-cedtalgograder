import { LEVEL_NAME, ratingOf, type Level } from '../data/ratings';

/** Difficulty bars + word, from grader tries-per-person. */
export function DifficultyBadge({ code, showWord = true }: { code: string; showWord?: boolean }) {
  const r = ratingOf(code);
  if (!r) return null;
  const tip = `${LEVEL_NAME[r.level]}: ${r.why || 'ประเมินจากสถิติบน grader'} · เพื่อนส่งเฉลี่ย ${r.tries.toFixed(1)} ครั้งต่อคน (${r.people} คน)`;
  return (
    <span className={`lvl lvl-${r.level}`} title={tip} aria-label={tip}>
      <span className="diff" aria-hidden="true">{[1, 2, 3].map((k) => <i key={k} className={k <= r.level ? 'on' : ''} />)}</span>
      {showWord && <span className="lvl-word">{LEVEL_NAME[r.level]}</span>}
    </span>
  );
}

/** Worth-doing stars, with the reasons in the tooltip. */
export function WorthStars({ code, showReason = false }: { code: string; showReason?: boolean }) {
  const r = ratingOf(code);
  if (!r) return null;
  const tip = `${['', 'ทำถ้ามีเวลา', 'ควรทำ', 'ควรทำก่อน'][r.stars]} (${r.stars}/3): ${r.reasons.join(', ')}`;
  return (
    <span className="worth" title={tip} aria-label={tip}>
      <span className="stars" aria-hidden="true">{[1, 2, 3].map((k) => <span key={k} className={k <= r.stars ? 'on' : ''}>★</span>)}</span>
      {showReason && <span className="worth-why">{r.reasons[0]}</span>}
    </span>
  );
}

export default function Difficulty({ level }: { level: Level }) {
  return (
    <span className="diff" title={`ความยาก: ${LEVEL_NAME[level]}`} aria-label={`ความยาก ${LEVEL_NAME[level]}`}>
      {[1, 2, 3].map((k) => <i key={k} className={k <= level ? 'on' : ''} />)}
    </span>
  );
}
