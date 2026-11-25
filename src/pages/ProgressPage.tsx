import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { catalog } from '../data/catalog';
import { chapters } from '../data/chapters';
import { problemByCode } from '../data/problems';
import { LEVEL_NAME, ratingOf, type Level } from '../data/ratings';
import { leetcodeByChapter } from '../data/leetcode';
import { getLog, getStatus, isLcDone, useProgressVersion, type LogEntry } from '../store/progress';
import { demoLog, dayKey, levelOf, perDay, rankName, streaks, XP_PER_LEVEL } from '../store/stats';
import Heatmap from '../components/Heatmap';

const LC_XP = { Easy: 5, Medium: 10, Hard: 15 } as const;
const KIND_TEXT = { sub: 'ส่งตรวจ', ac: 'ผ่านทุกชุด', lc: 'ทำ LeetCode', quiz: 'ตอบ quiz ถูก' } as const;
const EXAM = { slug: 'exam', num: '★', title: 'ข้อสอบปลายภาคเก่า' };

const titleOf = (id: string) =>
  catalog.find((p) => p.code === id)?.title ??
  Object.values(leetcodeByChapter).flat().find((x) => x.slug === id)?.title ?? id;

export default function ProgressPage() {
  useProgressVersion();
  const [demo, setDemo] = useState(false);
  const real = getLog();
  const log: LogEntry[] = useMemo(() => (demo ? demoLog() : real), [demo, real]);
  const days = useMemo(() => perDay(log), [log]);
  const st = useMemo(() => streaks(new Set(days.keys())), [days]);
  const thisWeek = useMemo(() => {
    const since = Date.now() - 7 * 86400000;
    return log.filter(([t, k]) => t > since && k === 'ac').length;
  }, [log]);

  // experience: solved problems by difficulty + ticked LeetCode items
  const solved = catalog.filter((p) => getStatus(p.code) === 'solved');
  const lcDone = Object.values(leetcodeByChapter).flat().filter((x) => isLcDone(x.slug));
  const xp = solved.reduce((s, p) => s + 10 * (ratingOf(p.code)?.level ?? 1), 0) + lcDone.reduce((s, x) => s + LC_XP[x.difficulty], 0);
  const level = levelOf(xp);
  const into = xp % XP_PER_LEVEL;

  const byLevel = ([1, 2, 3] as Level[]).map((l) => {
    const all = catalog.filter((p) => ratingOf(p.code)?.level === l);
    return { l, total: all.length, done: all.filter((p) => getStatus(p.code) === 'solved').length };
  });
  const tracks = [...chapters.filter((c) => catalog.some((p) => p.chapter === c.slug)), EXAM].map((c) => {
    const items = catalog.filter((p) => p.chapter === c.slug);
    const lc = leetcodeByChapter[c.slug] ?? [];
    return { c, items, done: items.filter((p) => getStatus(p.code) === 'solved').length, lcTotal: lc.length, lcDone: lc.filter((x) => isLcDone(x.slug)).length };
  });
  const recent = [...log].reverse().slice(0, 8);

  return (
    <>
      <header className="ch-head">
        <h1>ความก้าวหน้า</h1>
        <p>ดูว่าฝึกไปแค่ไหน สม่ำเสมอแค่ไหน และบทไหนยังเหลือ ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น</p>
      </header>

      <section className="card lvl-card">
        <div className="lvl-badge" aria-hidden="true">{level}</div>
        <div className="grow">
          <div className="lvl-title">เลเวล {level} · {rankName(level)}</div>
          <div className="progress big" role="progressbar" aria-valuenow={into} aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-label="ความคืบหน้าไปเลเวลถัดไป">
            <div style={{ width: `${into}%` }} />
          </div>
          <div className="small muted">{xp} XP · อีก {XP_PER_LEVEL - into} XP ถึงเลเวลถัดไป (โจทย์ผ่าน = 10 / 20 / 30 ตามความยาก, LeetCode = 5 / 10 / 15)</div>
        </div>
      </section>

      <div className="plan-stats">
        <div className="stat"><b>{st.current}<small className="muted"> วัน</small></b><span>ฝึกต่อเนื่องตอนนี้</span></div>
        <div className="stat"><b>{st.longest}<small className="muted"> วัน</small></b><span>ต่อเนื่องนานสุด</span></div>
        <div className="stat"><b>{thisWeek}</b><span>ผ่านใน 7 วันนี้</span></div>
        <div className="stat"><b>{solved.length}<small className="muted">/{catalog.length}</small></b><span>โจทย์ที่ผ่าน</span></div>
      </div>

      <section className="card" style={{ padding: 18 }}>
        <div className="hm-head">
          <h2 style={{ margin: 0 }}>ปฏิทินการฝึก</h2>
          <label className="small muted"><input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} /> ดูตัวอย่างด้วยข้อมูลสมมติ</label>
        </div>
        {demo && <p className="small muted" style={{ margin: '4px 0 0' }}>ข้อมูลสมมติเพื่อดูหน้าตา ไม่ได้บันทึกและไม่นับเป็นความก้าวหน้าจริง</p>}
        <Heatmap perDay={days} />
        {!demo && real.length === 0 && (
          <p className="small muted" style={{ margin: '10px 0 0' }}>ยังไม่มีกิจกรรมที่บันทึก ปฏิทินเริ่มนับตั้งแต่ v0.2.1: ส่งตรวจโจทย์ ตอบ quiz ถูก หรือติ๊ก LeetCode แล้วช่องของวันนี้จะสว่างขึ้น (โจทย์ที่ผ่านไว้ก่อนหน้านี้ยังนับในสถานะ แต่ไม่มีวันที่)</p>
        )}
      </section>

      <h2 style={{ marginTop: 28 }}>เส้นทางแต่ละบท</h2>
      <div className="tracks">
        {tracks.map(({ c, items, done, lcTotal, lcDone: lcd }) => (
          <div key={c.slug} className={`card track ${done === items.length ? 'full' : ''}`}>
            <div className="track-h">
              <span className="ch-num">{c.num}</span>
              <Link to={c.slug === 'exam' ? '/plan' : `/ch/${c.slug}`} className="prob-title">{c.title}</Link>
              <span className="grow" />
              {done === items.length && <span className="pill ok">จบบท ✓</span>}
              <span className="small muted mono">{done}/{items.length}</span>
            </div>
            <div className="pips" aria-label={`ผ่าน ${done} จาก ${items.length} ข้อ`}>
              {items.map((p) => {
                const s = getStatus(p.code);
                const tip = `${p.title} · ${ratingOf(p.code) ? LEVEL_NAME[ratingOf(p.code)!.level] : ''} · ${{ todo: 'ยังไม่ทำ', tried: 'ลองแล้ว', solved: 'ผ่านแล้ว' }[s]}`;
                const cls = `pip ${s} lv${ratingOf(p.code)?.level ?? 1}`;
                return problemByCode.has(p.code)
                  ? <Link key={p.code} to={`/p/${p.code}`} className={cls} title={tip} aria-label={tip} />
                  : <span key={p.code} className={cls} title={tip} />;
              })}
            </div>
            {lcTotal > 0 && <div className="small muted">LeetCode {lcd}/{lcTotal}</div>}
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginTop: 28 }}>
        <section>
          <h2>แยกตามความยาก</h2>
          <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
            {byLevel.map(({ l, total, done }) => (
              <div key={l}>
                <div className="small" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{LEVEL_NAME[l]}</span><span className="mono muted">{done}/{total}</span></div>
                <div className={`progress big lvbar lv${l}`}><div style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2>ล่าสุด</h2>
          <div className="card" style={{ padding: 8 }}>
            {recent.length === 0 ? <p className="muted small" style={{ margin: 10 }}>ยังไม่มีกิจกรรม</p> : (
              <ul className="recent">
                {recent.map(([t, kind, id], k) => (
                  <li key={k}>
                    <span className={`dot ${kind}`} aria-hidden="true" />
                    <span className="grow">{KIND_TEXT[kind]}{id !== 'demo' && kind !== 'quiz' ? ` · ${titleOf(id)}` : ''}</span>
                    <span className="muted small mono">{dayKey(t).slice(5)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
