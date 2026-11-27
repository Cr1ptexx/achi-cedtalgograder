import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { catalog } from '../data/catalog';
import { summary } from '../store/stats';
import { rankName, XP_PER_LEVEL } from '../store/stats';
import WeekStrip from '../components/WeekStrip';
import { getStatus, useProgressVersion } from '../store/progress';
import ExamCountdown from '../components/ExamCountdown';
import XpBar from '../components/XpBar';

export default function Home() {
  useProgressVersion();
  const { solved, tried, total, lcDone, lcTotal, xp, level, into, streak, week } = summary();
  const next = chapters.find((c) => c.ready && catalog.some((p) => p.chapter === c.slug && getStatus(p.code) !== 'solved')) ?? chapters[0];

  return (
    <>
      <section className="hero">
        <div className="hero-kicker"><span className="dot-live" aria-hidden="true" />algorithms · visualized · judged in your browser</div>
        <h1>Algo Lab</h1>
        <p>สรุปแนวคิดทีละบท กดดูอัลกอริทึมทำงานทีละขั้น แล้วเขียน C++ ส่งตรวจได้ในหน้าเว็บ</p>

        <div className="hero-board">
          <div className="hero-exams">
            <ExamCountdown id="grader" />
            <ExamCountdown id="paper" />
          </div>
          <div className="card hero-progress">
            <div className="hp-top">
              <div className="hp-solved"><b>{solved}</b><span>/ {total}</span><em>solved</em></div>
              <div className="hp-level">
                <span className="lv-badge">LV {level}</span>
                <span className="lv-rank">{rankName(level)}</span>
              </div>
            </div>
            <div className="hp-xp">
              <XpBar value={into} max={XP_PER_LEVEL} label="ไปเลเวลถัดไป" />
              <div className="hp-xp-meta"><span>{xp} XP</span><span>{XP_PER_LEVEL - into} XP to LV {level + 1}</span></div>
            </div>
            <div className="wk-row">
              <WeekStrip week={week} />
              <span className="small muted">{streak > 0 ? `streak ${streak} วัน` : 'ยังไม่ได้ฝึกวันนี้'}</span>
            </div>
            <dl className="hp-stats">
              <div><dt>ลองแล้ว</dt><dd>{tried}</dd></div>
              <div><dt>ยังไม่ทำ</dt><dd>{total - solved - tried}</dd></div>
              <div><dt>LeetCode</dt><dd>{lcDone}/{lcTotal}</dd></div>
            </dl>
            <Link className="btn primary hp-cta" to={`/ch/${next.slug}`}>
              {solved > 0 ? `เรียนต่อ: บท ${next.num} ${next.title}` : 'เริ่มบทแรก'} <span aria-hidden="true">→</span>
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
