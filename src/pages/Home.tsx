import { Link } from 'react-router-dom';
import { chapters } from '../data/chapters';
import { catalog } from '../data/catalog';
import { getStatus, useProgressVersion } from '../store/progress';
import HeroSort from '../components/HeroSort';

export default function Home() {
  useProgressVersion();
  const total = catalog.length;
  const solved = catalog.filter((p) => getStatus(p.code) === 'solved').length;
  const next = chapters.find((c) => c.ready && catalog.some((p) => p.chapter === c.slug && getStatus(p.code) !== 'solved')) ?? chapters[0];

  return (
    <>
      <section className="hero">
        <div>
          <h1>เรียน Algorithm ด้วยการกดดูทีละขั้น แล้วลงมือเขียนเอง</h1>
          <p>
            แต่ละบทสรุปแนวคิดจากสไลด์ของวิชา มีตัวจำลองที่เห็นโค้ดวิ่งไปทีละบรรทัด
            แล้วต่อด้วยโจทย์จาก grader ที่เขียน C++ และตรวจได้ในหน้าเว็บทันที
          </p>
          <div className="hero-cta">
            <Link className="btn primary" to={`/ch/${next.slug}`}>
              {solved > 0 ? `เรียนต่อ: บท ${next.num} ${next.title}` : 'เริ่มบทแรก'}
            </Link>
            <Link className="btn" to="/plan">ดูโจทย์ทั้งหมด {total} ข้อ</Link>
          </div>
        </div>
        <HeroSort />
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
