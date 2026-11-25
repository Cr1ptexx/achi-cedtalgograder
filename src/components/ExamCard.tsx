import { Link } from 'react-router-dom';
import { dateLabel, daysUntil, examProgress, type ExamId } from '../data/exams';
import { EXAMS } from '../data/exams';
import { useProgressVersion } from '../store/progress';

/** Countdown to one exam, with how much of its study path is done. */
export default function ExamCard({ id }: { id: ExamId }) {
  useProgressVersion();
  const exam = EXAMS.find((e) => e.id === id)!;
  const days = daysUntil(exam.date);
  const { done, total } = examProgress(id);
  const unit = id === 'grader' ? 'ข้อ' : 'หัวข้อ';
  const label = days > 1 ? 'วัน' : days === 1 ? 'พรุ่งนี้' : days === 0 ? 'วันนี้' : 'สอบแล้ว';

  return (
    <Link to={`/exam?tab=${id}`} className={`exam-card ${days < 0 ? 'past' : days <= 3 ? 'soon' : ''}`}>
      <div className="exam-days">
        {days > 1 && <b>{days}</b>}
        <span>{days > 1 ? `${label}` : label}</span>
      </div>
      <div className="exam-info">
        <div className="exam-name">{exam.title}</div>
        <div className="small muted">{dateLabel(exam.date)} · {exam.kind}</div>
        <div className="progress"><div style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        <div className="small muted">{id === 'grader' ? 'ผ่านแล้ว' : 'ทบทวนแล้ว'} {done}/{total} {unit}</div>
      </div>
    </Link>
  );
}
