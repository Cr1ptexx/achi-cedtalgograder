import { Link } from 'react-router-dom';
import { useState } from 'react';
import { catalog, GRADER_BASE } from '../data/catalog';
import { chapters, chapterBySlug } from '../data/chapters';
import { problemByCode } from '../data/problems';
import { ratingOf, STATS_DATE, type Level } from '../data/ratings';
import type { CatalogEntry } from '../data/types';
import { getStatus, isLcDone, useProgressVersion, type Status } from '../store/progress';
import { leetcodeByChapter } from '../data/leetcode';
import StatusDot from '../components/StatusDot';
import { DifficultyBadge, WorthStars } from '../components/Difficulty';

const EXAM = { slug: 'exam', num: '★', title: 'ข้อสอบปลายภาคเก่า', thaiTitle: 'รวมหลายบท ปี 66–68' };
type Sort = 'chapter' | 'worth' | 'easy';

export default function PlanPage() {
  useProgressVersion();
  const [status, setStatus] = useState<'all' | Status>('all');
  const [level, setLevel] = useState<0 | Level>(0);
  const [sort, setSort] = useState<Sort>('chapter');

  const lcAll = Object.values(leetcodeByChapter).flat();
  const lcDone = lcAll.filter((x) => isLcDone(x.slug)).length;
  const total = catalog.length;
  const solved = catalog.filter((p) => getStatus(p.code) === 'solved').length;
  const tried = catalog.filter((p) => getStatus(p.code) === 'tried').length;
  const pass = (p: CatalogEntry) =>
    (status === 'all' || getStatus(p.code) === status) && (level === 0 || ratingOf(p.code)?.level === level);
  const visible = catalog.filter(pass);

  return (
    <>
      <header className="ch-head">
        <h1>โจทย์ทั้งหมด</h1>
        <p>รวมโจทย์ algorithm ทุกข้อบน grader พร้อมระดับความยากและความน่าทำ ข้อที่มีป้าย "ทำในเว็บได้" เขียนและตรวจได้ที่นี่</p>
        <div className="plan-sum">
          <div className="progress big grow"><div style={{ width: `${(solved / total) * 100}%` }} /></div>
          <span className="small muted">ผ่าน {solved} · ลองแล้ว {tried} · ยังไม่ทำ {total - solved - tried} จาก {total} ข้อ · LeetCode {lcDone}/{lcAll.length}</span>
        </div>

        <div className="filters">
          <div className="seg" role="group" aria-label="กรองตามสถานะ">
            {(['all', 'todo', 'tried', 'solved'] as const).map((f) => (
              <button key={f} className={status === f ? 'on' : ''} onClick={() => setStatus(f)}>
                {{ all: 'ทุกสถานะ', todo: 'ยังไม่ทำ', tried: 'ลองแล้ว', solved: 'ผ่านแล้ว' }[f]}
              </button>
            ))}
          </div>
          <div className="seg" role="group" aria-label="กรองตามความยาก">
            {([0, 1, 2, 3] as const).map((l) => (
              <button key={l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>
                {['ทุกระดับ', 'ง่าย', 'กลาง', 'ยาก'][l]}
              </button>
            ))}
          </div>
          <label className="small muted sort">เรียงตาม
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="chapter">บทเรียน</option>
              <option value="worth">น่าทำมากไปน้อย</option>
              <option value="easy">ง่ายไปยาก</option>
            </select>
          </label>
        </div>

        <details className="how">
          <summary>ระดับความยากและความน่าทำคิดจากอะไร</summary>
          <ul>
            <li><b>ความยาก</b> มาจากสถิติบน grader ({STATS_DATE}): จำนวนครั้งที่ส่งเฉลี่ยต่อคน ต่ำกว่า 2.7 ครั้ง = ง่าย, 2.7–4 = กลาง, เกิน 4 = ยาก ข้อที่มี "?" มีคนลองไม่ถึง 60 คน ค่าอาจไม่แม่น</li>
            <li><b>ความน่าทำ</b> ★★★ ควรทำก่อน, ★★ ควรทำ, ★ ทำถ้ามีเวลา ดูจากที่มาของโจทย์ (ข้อสอบปลายภาคปีล่าสุดสูงสุด รองลงมาคือแบบฝึกหัดหลักของบทและข้อสอบปี 64 ขึ้นไป ข้อสอบเก่ากว่าปี 62 ต่ำสุด) แล้วบวกเพิ่มถ้าเพื่อนฝึกกันเยอะ (500 คนขึ้นไป) หรือลดลงถ้าแทบไม่มีคนทำ (ไม่ถึง 150 คน)</li>
            <li>ชี้เมาส์ที่ดาวหรือแถบความยากเพื่อดูเหตุผลของแต่ละข้อ</li>
          </ul>
        </details>
      </header>

      {visible.length === 0 && <p className="muted">ไม่มีโจทย์ที่ตรงกับตัวกรองนี้ ลองเปลี่ยนสถานะหรือระดับความยาก</p>}

      {sort === 'chapter' ? (
        [...chapters.filter((c) => catalog.some((p) => p.chapter === c.slug)), EXAM].map((g) => {
          const items = visible.filter((p) => p.chapter === g.slug);
          if (!items.length) return null;
          return (
            <section key={g.slug} className="plan-group">
              <h2><span className="ch-num">{g.num}</span> {g.title} <span className="muted small">{g.thaiTitle}</span></h2>
              <PlanTable items={items} />
            </section>
          );
        })
      ) : (
        <section className="plan-group">
          <PlanTable items={sortFlat(visible, sort)} showChapter />
        </section>
      )}
    </>
  );
}

function sortFlat(items: CatalogEntry[], sort: Sort) {
  const r = (p: CatalogEntry) => ratingOf(p.code);
  return [...items].sort((a, b) =>
    sort === 'worth'
      ? (r(b)?.stars ?? 0) - (r(a)?.stars ?? 0) || (r(a)?.tries ?? 9) - (r(b)?.tries ?? 9)
      : (r(a)?.tries ?? 9) - (r(b)?.tries ?? 9));
}

function PlanTable({ items, showChapter = false }: { items: CatalogEntry[]; showChapter?: boolean }) {
  return (
    <table className="table plan-table">
      <thead>
        <tr>
          <th className="w-dot"><span className="sr-only">สถานะ</span></th>
          <th>โจทย์</th>
          <th className="w-lvl">ความยาก</th>
          <th className="w-worth">น่าทำ</th>
          <th className="w-go"><span className="sr-only">ทำที่ไหน</span></th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => {
          const built = problemByCode.get(p.code);
          const ch = chapterBySlug.get(p.chapter);
          return (
            <tr key={p.code}>
              <td className="w-dot"><StatusDot status={getStatus(p.code)} /></td>
              <td>
                {built ? <Link to={`/p/${p.code}`} className="prob-title">{p.title}</Link> : <span className="prob-title">{p.title}</span>}
                <div className="small muted">
                  {showChapter && ch && p.chapter !== 'exam' ? `บท ${ch.num} ${ch.title}, ` : ''}{ratingOf(p.code)?.source}
                </div>
              </td>
              <td className="w-lvl"><DifficultyBadge code={p.code} /></td>
              <td className="w-worth"><WorthStars code={p.code} /></td>
              <td className="w-go right">
                {built
                  ? <Link className="pill ok" to={`/p/${p.code}`}>ทำในเว็บได้</Link>
                  : <a className="small" href={`${GRADER_BASE}/main/list`} target="_blank" rel="noreferrer">grader ↗</a>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
