import { Link } from 'react-router-dom';
import { dateLabel, daysUntil, EXAMS, examProgress, type ExamId } from '../data/exams';

/** Compact exam countdown for the home page: D-day number, date, and progress of that exam's path. */
export default function ExamCountdown({ id }: { id: ExamId }) {
  const exam = EXAMS.find((e) => e.id === id)!;
  const days = daysUntil(exam.date);
  const { done, total } = examProgress(id);
  const dday = days > 0 ? `D-${days}` : days === 0 ? 'D-DAY' : 'DONE';
  const state = days < 0 ? 'past' : days <= 3 ? 'soon' : '';
  return (
    <Link to={`/exam?tab=${id}`} className={`cd ${state}`}>
      <span className="cd-day">{dday}</span>
      <span className="cd-body">
        <span className="cd-name">{exam.title}</span>
        <span className="cd-meta">{dateLabel(exam.date)} · {exam.kind}</span>
        <span className="cd-bar"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
        <span className="cd-meta">{done}/{total} {id === 'grader' ? 'ข้อ' : 'หัวข้อ'}</span>
      </span>
    </Link>
  );
}
