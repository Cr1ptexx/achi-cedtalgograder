import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { chapters } from '../data/chapters';
import { BIGO_CHOICES, BIGO_DRILLS, BIGO_FORMULAS, type Drill } from '../data/bigo-drills';
import { dateLabel, drillKey, EXAMS, graderStages, PICKS_PER_CHAPTER, reviewKey, type ExamId } from '../data/exams';
import ExamCard from '../components/ExamCard';
import DayStrip from '../components/DayStrip';
import { getFlag, getStatus, logEvent, setFlag, useProgressVersion } from '../store/progress';
import { problemByCode } from '../data/problems';
import StatusDot from '../components/StatusDot';
import { DifficultyBadge, WorthStars } from '../components/Difficulty';

export default function ExamPage() {
  const [params, setParams] = useSearchParams();
  useProgressVersion();
  const tab: ExamId = params.get('tab') === 'paper' ? 'paper' : 'grader';
  return (
    <>
      <header className="ch-head">
        <h1>เส้นทางสอบ</h1>
        <p>สองรอบสอบ สองเส้นทาง รอบแรกเขียนโค้ดบน grader รอบที่สองเป็นข้อสอบกระดาษ เน้นทฤษฎีกับการคำนวณ Big-O</p>
      </header>

      <div className="seg exam-tabs" role="tablist" aria-label="เลือกรอบสอบ">
        {EXAMS.map((e) => (
          <button key={e.id} role="tab" aria-selected={tab === e.id} className={tab === e.id ? 'on' : ''} onClick={() => setParams({ tab: e.id }, { replace: true })}>
            {e.title} · {dateLabel(e.date)}
          </button>
        ))}
      </div>

      <DayStrip active={tab} />
      <div className="exam-ticket"><ExamCard id={tab} link={false} /></div>

      {tab === 'grader' ? <GraderPath /> : <PaperPath />}
    </>
  );
}

// ---------- exam 1 ----------
function GraderPath() {
  const stages = graderStages();
  const next = stages.flatMap((s) => s.items).find((p) => getStatus(p.code) !== 'solved');
  return (
    <>
      {next && (
        <Link className="btn primary next-cta" to={`/p/${next.code}`}>ทำข้อต่อไป: {next.title}</Link>
      )}
      <p className="muted">
        เรียงตามบทของวิชา แต่ละบทเลือก {PICKS_PER_CHAPTER} ข้อที่น่าทำที่สุด (ดาวมากสุด แล้วดูจำนวนเพื่อนที่ฝึกประกอบ) เรียงจากง่ายไปยาก ท้ายสุดคือข้อสอบปลายภาคเก่าไว้ซ้อมจริง
        ข้ออื่นทำเพิ่มได้ที่ <Link to="/plan">แผนการเรียน</Link>
      </p>
      <ol className="stage-list">
        {stages.map((s) => {
          const solved = s.items.filter((p) => getStatus(p.code) === 'solved').length;
          return (
            <li key={s.slug} className={`stage ${solved === s.items.length ? 'done' : ''}`}>
              <span className="stage-num">{solved === s.items.length ? '✓' : s.num}</span>
              <div className="stage-main">
                <div className="stage-head">
                  <h2>{s.title} <span className="muted small">{s.thaiTitle}</span></h2>
                  <span className="small muted stage-count">{solved}/{s.items.length} ข้อ</span>
                  {s.chapter && <Link className="btn small" to={`/ch/${s.slug}`}>อ่านบทนี้</Link>}
                </div>
                <ul className="stage-items">
                  {s.items.map((p) => (
                    <li key={p.code} className={next?.code === p.code ? 'next' : ''}>
                      <StatusDot status={getStatus(p.code)} />
                      {problemByCode.get(p.code) ? <Link to={`/p/${p.code}`} className="prob-title">{p.title}</Link> : <span className="prob-title">{p.title}</span>}
                      {next?.code === p.code && <span className="pill next-pill">ข้อต่อไป</span>}
                      <span className="grow" />
                      <DifficultyBadge code={p.code} />
                      <WorthStars code={p.code} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

// ---------- exam 2 ----------
function PaperPath() {
  return (
    <>
      <section className="zone">
        <h2>คำนวณ Big-O <span className="muted small">ตอบถูก {BIGO_DRILLS.filter((d) => getFlag(drillKey(d.id))).length}/{BIGO_DRILLS.length} ข้อ</span></h2>
        <p className="zone-intro">
          ข้อสอบกระดาษมักให้โค้ดลูปซ้อนหรือ recurrence แล้วถามว่าใช้เวลาเท่าไร วิธีทำ: นับว่าบรรทัดในสุดทำกี่ครั้งเป็นผลรวม แล้วตัดค่าคงที่กับพจน์ต่ำออก
          ถ้าเป็น recurrence ให้ใช้ Master theorem (เทียบ f(n) กับ n^(log_b a)) หรือกางต้นไม้ดู
        </p>
        <table className="table formulas">
          <thead><tr><th>สูตร</th><th>ค่า</th><th>ใช้เมื่อ</th></tr></thead>
          <tbody>
            {BIGO_FORMULAS.map((f) => <tr key={f.name}><td>{f.name}</td><td className="mono small">{f.formula}</td><td className="muted small">{f.note}</td></tr>)}
          </tbody>
        </table>
        <div className="note-box">
          <b>Master theorem</b> สำหรับ T(n) = a·T(n/b) + f(n) ให้เทียบ f(n) กับ n^(log_b a):
          ถ้า f(n) เล็กกว่า (แบบ polynomial) ได้ Θ(n^(log_b a)) · ถ้าเท่ากันได้ Θ(n^(log_b a) · log n) · ถ้า f(n) ใหญ่กว่าได้ Θ(f(n))
        </div>
        <div className="quiz-list drill-grid">
          {BIGO_DRILLS.map((d, k) => <DrillCard key={d.id} drill={d} n={k + 1} />)}
        </div>
      </section>

      <section className="zone">
        <h2>ทบทวนทฤษฎีทีละบท</h2>
        <p className="zone-intro">ต่อบท: อ่านสรุป ทำ quiz ดูตารางความซับซ้อนกับจุดที่พลาดบ่อย แล้วติ๊กเมื่อทบทวนเสร็จ</p>
        <ol className="stage-list">
          {chapters.map((c) => {
            const on = getFlag(reviewKey(c.slug));
            return (
              <li key={c.slug} className={`stage ${on ? 'done' : ''}`}>
                <span className="stage-num">{on ? '✓' : c.num}</span>
                <div className="stage-main">
                  <div className="stage-head">
                    <h2>{c.title} <span className="muted small">{c.thaiTitle}</span></h2>
                    <span className="grow" />
                    <Link className="btn small" to={`/ch/${c.slug}`}>อ่านบทนี้</Link>
                    <label className="review-check">
                      <input type="checkbox" checked={on} onChange={(e) => setFlag(reviewKey(c.slug), e.target.checked)} /> ทบทวนแล้ว
                    </label>
                  </div>
                  <details className="how">
                    <summary>ตารางความซับซ้อนและจุดที่พลาดบ่อย</summary>
                    <table className="table">
                      <tbody>{c.complexity.map((r) => <tr key={r.name}><td>{r.name}</td><td className="mono small">{r.time}</td><td className="muted small">{r.note}</td></tr>)}</tbody>
                    </table>
                    <ul className="pitfalls">{c.pitfalls.map((p) => <li key={p}>{p}</li>)}</ul>
                  </details>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

function DrillCard({ drill, n }: { drill: Drill; n: number }) {
  const [pick, setPick] = useState<number | null>(null);
  const answered = pick !== null;
  const right = pick === drill.answer;
  const pickChoice = (k: number) => {
    setPick(k);
    if (k === drill.answer) {
      logEvent('quiz', drill.id);
      setFlag(drillKey(drill.id), true);
    }
  };
  return (
    <div className="card quiz">
      <div className="quiz-q"><span className="quiz-n">{n}</span>{drill.ask}{getFlag(drillKey(drill.id)) && <span className="pill ok" style={{ marginLeft: 'auto' }}>ตอบถูกแล้ว</span>}</div>
      <pre className="code" style={{ margin: '0 0 12px' }}>{drill.code}</pre>
      <div className="quiz-choices drill-choices">
        {BIGO_CHOICES.map((c, k) => {
          const state = !answered ? '' : k === drill.answer ? 'right' : k === pick ? 'wrong' : 'off';
          return <button key={c} className={`choice ${state}`} disabled={answered} onClick={() => pickChoice(k)}>{c}</button>;
        })}
      </div>
      {answered && (
        <div className={`quiz-why ${right ? 'right' : 'wrong'}`}>
          <b>{right ? 'ถูกต้อง ✓' : `ยังไม่ใช่ คำตอบคือ ${BIGO_CHOICES[drill.answer]}`}</b> {drill.why}
          <button className="link" onClick={() => setPick(null)}>ลองใหม่</button>
        </div>
      )}
    </div>
  );
}
