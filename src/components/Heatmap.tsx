import { useMemo } from 'react';
import { dayKey, heatLevel } from '../store/stats';

const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DOW = ['', 'จ', '', 'พ', '', 'ศ', ''];

/** GitHub-style calendar: columns are weeks (Sunday first), rows are days. */
export default function Heatmap({ perDay, weeks = 26 }: { perDay: Map<string, number>; weeks?: number }) {
  const { cols, total, activeDays } = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    start.setDate(start.getDate() - (weeks - 1) * 7 - start.getDay());
    const cols: { day: Date; key: string; score: number; future: boolean }[][] = [];
    let total = 0, activeDays = 0;
    const d = new Date(start);
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        const key = dayKey(d);
        const score = perDay.get(key) ?? 0;
        const future = d > today;
        if (!future) { total += score; if (score) activeDays++; }
        col.push({ day: new Date(d), key, score, future });
        d.setDate(d.getDate() + 1);
      }
      cols.push(col);
    }
    return { cols, total, activeDays };
  }, [perDay, weeks]);

  return (
    <div className="hm-wrap">
      <div className="hm-scroll">
        <div className="hm" style={{ gridTemplateColumns: `28px repeat(${weeks}, 14px)` }} role="img"
          aria-label={`ปฏิทินกิจกรรม ${weeks} สัปดาห์ล่าสุด ทำงานไป ${activeDays} วัน`}>
          <div />
          {cols.map((col, w) => {
            const first = col.find((c) => c.day.getDate() === 1);
            return <div key={w} className="hm-month">{first ? MONTHS[first.day.getMonth()] : ''}</div>;
          })}
          {Array.from({ length: 7 }, (_, r) => (
            <div key={`r${r}`} style={{ display: 'contents' }}>
              <div className="hm-dow">{DOW[r]}</div>
              {cols.map((col, w) => {
                const c = col[r];
                if (c.future) return <div key={w} className="hm-cell hide" />;
                const lv = heatLevel(c.score);
                const label = `${c.day.getDate()} ${MONTHS[c.day.getMonth()]} ${c.day.getFullYear() + 543}: ${c.score ? `${c.score} แต้มกิจกรรม` : 'ไม่มีกิจกรรม'}`;
                return <div key={w} className={`hm-cell l${lv}`} title={label} />;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="hm-foot">
        <span className="muted small">{activeDays} วันที่มีกิจกรรม · รวม {total} แต้ม</span>
        <span className="hm-legend small muted">น้อย<i className="hm-cell l0" /><i className="hm-cell l1" /><i className="hm-cell l2" /><i className="hm-cell l3" /><i className="hm-cell l4" />มาก</span>
      </div>
    </div>
  );
}
