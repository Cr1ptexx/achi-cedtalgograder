import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { catalog } from '../data/catalog';
import { summary } from '../store/stats';
import { rankName, XP_PER_LEVEL } from '../store/stats';
import WeekStrip from '../components/WeekStrip';
import { getStatus, useProgressVersion } from '../store/progress';
import ExamCard from '../components/ExamCard';

export default function Home() {
  useProgressVersion();
  const { solved, tried, total, lcDone, lcTotal, xp, level, into, streak, week } = summary();
  const next = chapters.find((c) => c.ready && catalog.some((p) => p.chapter === c.slug && getStatus(p.code) !== 'solved')) ?? chapters[0];

  return (
    <>
      <section className="hero">
        <h1>Algo Lab</h1>
        <p>เว็บฝึกวิชา Algorithm สรุปแนวคิดทีละบท มีตัวจำลองให้กดดู และโจทย์ C++ ที่เขียนกับตรวจได้ในหน้าเว็บ</p>

        <div className="hero-board">
          <div className="hero-tickets">
            <ExamCard id="grader" />
            <ExamCard id="paper" />
          </div>
          <div className="card hero-progress">
            <div className="hero-count"><b>{solved}</b><span>จาก {total} ข้อผ่านแล้ว</span></div>
            <div className="lvl-line">
              <div className="lvl-line-h"><b>เลเวล {level}</b> <span className="muted small">{rankName(level)} · {xp} XP</span></div>
              <div className="progress" role="progressbar" aria-valuenow={into} aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-label="ไปเลเวลถัดไป"><div style={{ width: `${into}%` }} /></div>
            </div>
            <div className="wk-row">
              <WeekStrip week={week} />
              <span className="small muted">{streak > 0 ? `ฝึกต่อเนื่อง ${streak} วัน` : 'ยังไม่ได้ฝึกวันนี้'}</span>
            </div>
            <div className="small muted">ลองแล้ว {tried} ข้อ · ยังไม่ทำ {total - solved - tried} ข้อ · LeetCode {lcDone}/{lcTotal}</div>
            <Link className="btn primary" to={`/ch/${next.slug}`}>
              {solved > 0 ? `เรียนต่อ: บท ${next.num} ${next.title}` : 'เริ่มบทแรก'}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="path-head">
          <h2>เส้นทางเรียน</h2>
          <span className="muted small">ผ่านแล้ว {solved} จาก {total} ข้อ</span>
        </div>
        <ol className="path">
          {chapters.filter((c) => c.slug !== 'exam').map((c) => {
            const probs = catalog.filter((p) => p.chapter === c.slug);
            const done = probs.filter((p) => getStatus(p.code) === 'solved').length;
            const pct = probs.length ? Math.round((done / probs.length) * 100) : 0;
            const complete = probs.length > 0 && done === probs.length;
            const body = (
              <>
                <div className="path-title">{c.title}<span className="th">{c.thaiTitle}</span></div>
                <p className="path-blurb">{c.ready ? c.blurb : 'บทนี้ยังไม่มีบทเรียนในเว็บ ฝึกโจทย์ของบทได้จากหน้าแผนการเรียน'}</p>
              </>
            );
            return (
              <li key={c.slug} className={`path-item ${c.ready ? 'ready' : ''} ${complete ? 'done' : ''}`}>
                <span className="path-num">{complete ? '✓' : c.num}</span>
                {c.ready ? <Link className="path-body" to={`/ch/${c.slug}`}>{body}</Link> : <div className="path-body">{body}</div>}
                <div className="path-meta">
                  {c.ready ? <span className="pill ok">พร้อมเรียน</span> : <span className="pill">ยังไม่เปิด</span>}
                  {probs.length > 0 && (
                    <>
                      <span className="small muted">{done}/{probs.length} ข้อ</span>
                      <div className="progress"><div style={{ width: `${pct}%` }} /></div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
