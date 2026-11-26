import { getNote, getRedo, getScore } from '../store/progress';

/** Best result so far as "passed/total test cases", with a small fill bar. Callers re-render via useProgressVersion. */
export function ScoreChip({ code }: { code: string }) {
  const s = getScore(code);
  if (!s) return <span className="score none" title="ยังไม่เคยส่งตรวจ">–</span>;
  const kind = s.passed === s.total ? 'full' : s.passed === 0 ? 'zero' : 'part';
  const tip = `ผ่าน ${s.passed} จาก ${s.total} เทสเคส (ครั้งที่ดีที่สุด)`;
  return (
    <span className={`score ${kind}`} title={tip} aria-label={tip}>
      <b>{s.passed}/{s.total}</b>
      <i aria-hidden="true"><u style={{ width: `${(s.passed / s.total) * 100}%` }} /></i>
    </span>
  );
}

/** "redo" mark plus the first line of the user's own note. */
export function RedoMark({ code, showTag = true, showNote = true }: { code: string; showTag?: boolean; showNote?: boolean }) {
  const redo = getRedo(code);
  const note = getNote(code).trim();
  if (!redo && !note) return null;
  const first = note.split('\n')[0];
  return (
    <>
      {showTag && redo && <span className="redo-tag" title="ทำเครื่องหมายไว้ว่าจะทำซ้ำ">↻ ทำซ้ำ</span>}
      {showNote && note && <div className="small note-line" title={note}>✎ {first.length > 70 ? `${first.slice(0, 70)}…` : first}</div>}
    </>
  );
}
