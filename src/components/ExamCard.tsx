import { Link } from 'react-router-dom';
import { dateLabel, daysUntil, EXAMS, examProgress, type ExamId } from '../data/exams';
import { useProgressVersion } from '../store/progress';

/** Exam "ticket": the stub counts the days, the body shows how much of the path is done. */
export default function ExamCard({ id, link = true }: { id: ExamId; link?: boolean }) {
  useProgressVersion();
  const exam = EXAMS.find((e) => e.id === id)!;
  const days = daysUntil(exam.date);
  const { done, total } = examProgress(id);
  const word = days > 1 ? 'วัน' : days === 1 ? 'พรุ่งนี้' : days === 0 ? 'วันนี้' : 'สอบแล้ว';
  const state = days < 0 ? 'past' : days <= 3 ? 'soon' : '';

  const body = (
    <>
      <div className="ticket-stub">
        {days > 1 && <b>{days}</b>}
        <span>{word}</span>
      </div>
      <div className="ticket-body">
        <div className="ticket-name">{exam.title}</div>
        <div className="small muted">{dateLabel(exam.date)} · {exam.kind}</div>
        <div className="progress"><div style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        <div className="small muted">{id === 'grader' ? 'ผ่านแล้ว' : 'ทบทวนแล้ว'} {done} จาก {total} {id === 'grader' ? 'ข้อ' : 'หัวข้อ'}</div>
      </div>
    </>
  );
  return link
    ? <Link to={`/exam?tab=${id}`} className={`ticket ${state}`}>{body}</Link>
    : <div className={`ticket ${state}`}>{body}</div>;
}
