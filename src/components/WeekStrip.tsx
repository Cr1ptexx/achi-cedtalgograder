import { summary } from '../store/stats';

type Day = ReturnType<typeof summary>['week'][number];

/** The last 7 days only: one tile each, darker = more done. Quiet by design. */
export default function WeekStrip({ week }: { week: Day[] }) {
  return (
    <ol className="wk" aria-label="กิจกรรม 7 วันที่ผ่านมา">
      {week.map((d) => (
        <li key={d.key} className={`wk-day l${d.lv} ${d.today ? 'today' : ''}`}
          title={`${d.date}: ${d.score ? `${d.score} แต้มกิจกรรม` : 'ยังไม่มีกิจกรรม'}`}>
          <span>{d.wd}</span>
          <i aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}
