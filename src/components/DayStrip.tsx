import { Link } from 'react-router-dom';
import { EXAMS, type ExamId } from '../data/exams';

const WEEKDAY = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** One cell per day from today to the last exam, exam days marked. Reads like a page torn from a planner. */
export default function DayStrip({ active }: { active?: ExamId }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examOn = new Map(EXAMS.map((e) => [e.date, e]));
  const dates = EXAMS.map((e) => e.date).sort();
  const last = dates[dates.length - 1];
  const [ly, lm, ld] = last.split('-').map(Number);
  const end = new Date(ly, lm - 1, ld);

  const days: Date[] = [];
  for (let d = new Date(today); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) days.push(d);
  if (days.length === 0) return null;

  return (
    <ol className="day-strip" aria-label="ปฏิทินนับถอยหลังถึงวันสอบ">
      {days.map((d, i) => {
        const exam = examOn.get(key(d));
        const month = i === 0 || d.getDate() === 1 ? MONTH[d.getMonth()] : '';
        const cls = ['day', i === 0 ? 'today' : '', exam ? 'exam' : '', exam && active === exam.id ? 'active' : ''].join(' ');
        const inner = (
          <>
            <span className="day-month">{month}</span>
            <span className="day-wd">{WEEKDAY[d.getDay()]}</span>
            <b>{d.getDate()}</b>
            <span className="day-tag">{exam ? (exam.id === 'grader' ? 'grader' : 'กระดาษ') : i === 0 ? 'วันนี้' : ''}</span>
          </>
        );
        return (
          <li key={key(d)} className={cls} style={{ animationDelay: `${i * 28}ms` }}>
            {exam ? <Link to={`/exam?tab=${exam.id}`} title={exam.title}>{inner}</Link> : <div>{inner}</div>}
          </li>
        );
      })}
    </ol>
  );
}
