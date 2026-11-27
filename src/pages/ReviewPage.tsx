import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { catalog } from '../data/catalog';
import { chapters } from '../data/chapters';
import { byEase } from '../data/ratings';
import { exportProgress, getFlag, getNote, getRedo, getStatus, importProgress, useProgressVersion } from '../store/progress';
import { DifficultyBadge } from '../components/Difficulty';
import { ScoreChip } from '../components/ScoreChip';
import { quizKey } from '../components/Quiz';

export default function ReviewPage() {
  useProgressVersion();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const redo = catalog.filter((p) => getRedo(p.code) || getStatus(p.code) === 'tried').sort(byEase);
  const wrongQuiz = chapters.flatMap((c) => c.quiz.filter((q) => getFlag(quizKey(q.q))).map((q) => ({ c, q })));

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `algo-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg({ ok: true, text: 'บันทึกไฟล์สำรองแล้ว เก็บไว้ในที่ที่หาเจอ (เช่น Drive)' });
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!confirm('นำเข้าจะแทนที่ความก้าวหน้า โค้ด และโน้ตทั้งหมดในเบราว์เซอร์นี้ ดำเนินการต่อ?')) return;
    try {
      const n = importProgress(await f.text());
      setMsg({ ok: true, text: `นำเข้าสำเร็จ ${n} รายการ` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <header className="ch-head">
        <h1>ทบทวนก่อนสอบ</h1>
        <p>รวมสิ่งที่ควรกลับมาดู: ข้อที่ลองแล้วยังไม่ผ่านหรือติ๊กทำซ้ำ พร้อมโน้ตของคุณเอง และคำถามเช็กความเข้าใจที่เคยตอบผิด</p>
      </header>

      <section className="card review-sec">
        <h2>โจทย์ที่ควรทำซ้ำ <span className="muted small">{redo.length} ข้อ</span></h2>
        {redo.length === 0 ? <p className="muted">ยังไม่มีข้อที่ต้องทบทวน</p> : (
          <ul className="review-list">
            {redo.map((p) => {
              const note = getNote(p.code).trim();
              return (
                <li key={p.code}>
                  <div className="review-row">
                    <Link to={`/p/${p.code}`}>{p.title}</Link>
                    <DifficultyBadge code={p.code} />
                    <ScoreChip code={p.code} />
                    {getRedo(p.code) && <span className="redo-tag">↻ ทำซ้ำ</span>}
                  </div>
                  {note && <div className="small note-line" style={{ whiteSpace: 'pre-wrap' }}>✎ {note}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card review-sec">
        <h2>คำถามที่เคยตอบผิด <span className="muted small">{wrongQuiz.length} ข้อ</span></h2>
        {wrongQuiz.length === 0 ? <p className="muted">ยังไม่มี (ตอบถูกแล้วระบบจะเอาออกเอง)</p> : (
          <ul className="review-list">
            {wrongQuiz.map(({ c, q }) => (
              <li key={quizKey(q.q)}>
                <div className="review-row"><span>{q.q}</span></div>
                <div className="small muted">เฉลย: {q.choices[q.answer]} · {q.why}</div>
                <Link className="small" to={`/ch/${c.slug}`}>ไปที่บท {c.num} {c.title} →</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card review-sec">
        <h2>สำรองข้อมูล</h2>
        <p className="muted small">โค้ด คะแนน โน้ต และความก้าวหน้าเก็บอยู่ในเบราว์เซอร์นี้เท่านั้น ถ้าล้างข้อมูลหรือเปลี่ยนเครื่องจะหาย ส่งออกเป็นไฟล์ไว้แล้วนำเข้าที่เครื่องใหม่ได้</p>
        <div className="review-row">
          <button className="btn primary" onClick={download}>ส่งออกเป็นไฟล์ JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>นำเข้าจากไฟล์</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {msg && <div className={`notice ${msg.ok ? '' : 'bad'}`} role="status">{msg.text}</div>}
      </section>
    </>
  );
}
