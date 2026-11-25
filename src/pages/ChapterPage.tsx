import { Link, useParams } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { chapterBySlug, chapters } from '../data/chapters';
import { catalog, GRADER_BASE } from '../data/catalog';
import { problemByCode } from '../data/problems';
import type { ChapterSlug } from '../data/types';
import Quiz from '../components/Quiz';
import { getStatus, isLcDone, setLcDone, useProgressVersion } from '../store/progress';
import { leetcodeByChapter, type LeetCodeItem } from '../data/leetcode';
import StatusDot from '../components/StatusDot';
import { DifficultyBadge, WorthStars } from '../components/Difficulty';
import { ratingOf } from '../data/ratings';

const viz = {
  permutation: lazy(() => import('../components/PermutationViz')),
  sorting: lazy(() => import('../components/SortingViz')),
  master: lazy(() => import('../components/viz/MasterViz')),
  dandc: lazy(() => import('../components/viz/DivideViz')),
  dp: lazy(() => import('../components/viz/DpViz')),
  greedy: lazy(() => import('../components/viz/GreedyViz')),
  graph: lazy(() => import('../components/viz/GraphViz')),
  shortest: lazy(() => import('../components/viz/ShortestViz')),
  queens: lazy(() => import('../components/viz/QueensViz')),
  growth: lazy(() => import('../components/viz/GrowthViz')),
};

// The five zones are a study sequence, so they are numbered.
const ZONES = [
  ['concept', 'แนวคิด'],
  ['play', 'ลองเล่น'],
  ['quiz', 'เช็กความเข้าใจ'],
  ['cost', 'ความซับซ้อน'],
  ['problems', 'โจทย์แนะนำ'],
  ['leetcode', 'ฝึกเพิ่มบน LeetCode'],
] as const;

export default function ChapterPage() {
  const { slug } = useParams();
  const ch = chapterBySlug.get(slug as ChapterSlug);
  const [zone, setZone] = useState<string>('concept');
  useProgressVersion();

  useEffect(() => {
    const els = ZONES.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setZone(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slug]);

  if (!ch) return <p>ไม่พบบทนี้ <Link to="/">กลับหน้าแรก</Link></p>;
  const probs = catalog.filter((p) => p.chapter === ch.slug);
  const lc = leetcodeByChapter[ch.slug] ?? [];
  const ci = chapters.findIndex((c) => c.slug === ch.slug);
  const prevCh = chapters[ci - 1], nextCh = chapters[ci + 1];
  const zones = lc.length ? ZONES : ZONES.slice(0, -1);

  if (!ch.ready) {
    return (
      <>
        <ChapterHead num={ch.num} title={ch.title} thai={ch.thaiTitle} blurb={ch.blurb} />
        <ProblemList probs={probs} />
      </>
    );
  }
  const Viz = ch.visualizer ? viz[ch.visualizer] : null;

  return (
    <>
      <ChapterHead num={ch.num} title={ch.title} thai={ch.thaiTitle} blurb={ch.blurb} />
      <div className="ch-layout">
        <nav className="rail" aria-label="ส่วนของบทเรียน">
          {zones.map(([id, label], k) => (
            <a key={id} href={`#${id}`} className={zone === id ? 'on' : ''} aria-current={zone === id ? 'true' : undefined}
              onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span className="zone-k">{k + 1}</span>{label}
            </a>
          ))}
        </nav>

        <div>
          <section id="concept" className="zone">
            <h2><span className="zone-k">1</span>แนวคิด</h2>
            <div className="notes">
              <div className="note-grid">
                {ch.concepts.map((c, k) => (
                  <article key={c.title} className="note-item">
                    <span className="n">{k + 1}</span>
                    <h3>{c.title}</h3>
                    <p>{c.body}</p>
                    {c.code && <pre className="code">{c.code}</pre>}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="play" className="zone">
            <h2><span className="zone-k">2</span>ลองเล่น</h2>
            <p className="zone-intro">กดทีละขั้นแล้วดูบรรทัดที่ไฮไลต์ในโค้ดด้านขวา ว่าตอนนี้โปรแกรมทำอะไรอยู่</p>
            <div className="card">{Viz && <Suspense fallback={<p className="muted">กำลังโหลดตัวจำลอง…</p>}><Viz /></Suspense>}</div>
          </section>

          <section id="quiz" className="zone">
            <h2><span className="zone-k">3</span>เช็กความเข้าใจ</h2>
            <Quiz items={ch.quiz} />
          </section>

          <section id="cost" className="zone">
            <h2><span className="zone-k">4</span>ความซับซ้อนและจุดที่มักพลาด</h2>
            <div className="two-col">
              <table className="table">
                <thead><tr><th>แบบ</th><th>เวลา</th><th>หมายเหตุ</th></tr></thead>
                <tbody>{ch.complexity.map((r) => <tr key={r.name}><td>{r.name}</td><td className="mono small">{r.time}</td><td className="muted small">{r.note}</td></tr>)}</tbody>
              </table>
              <ul className="pitfalls">{ch.pitfalls.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          </section>

          <section id="problems" className="zone">
            <h2><span className="zone-k">5</span>โจทย์แนะนำ</h2>
            <ProblemList probs={probs} />
          </section>

          {lc.length > 0 && (
            <section id="leetcode" className="zone">
              <h2><span className="zone-k">6</span>ฝึกเพิ่มบน LeetCode</h2>
              <p className="zone-intro">โจทย์ LeetCode ที่ใช้แนวคิดและระดับใกล้เคียงกับโจทย์ในบทนี้ กดชื่อเพื่อไปทำบน LeetCode (เปิดแท็บใหม่) แล้วกลับมาติ๊กว่าทำแล้ว ระดับ Easy / Medium / Hard เป็นของ LeetCode เอง ไม่ได้เทียบกับระดับบน grader ตรง ๆ</p>
              <div className="prob-list">
                {lc.map((x) => <LeetCodeRow key={x.slug} item={x} />)}
              </div>
            </section>
          )}

          <nav className="ch-pager" aria-label="ไปบทอื่น">
            {prevCh ? <Link to={`/ch/${prevCh.slug}`}>← บท {prevCh.num} {prevCh.title}</Link> : <span />}
            {nextCh ? <Link to={`/ch/${nextCh.slug}`} className="next">บท {nextCh.num} {nextCh.title} →</Link> : <Link to="/exam" className="next">ไปเส้นทางสอบ →</Link>}
          </nav>
        </div>
      </div>
    </>
  );
}

const LC_WORD = { Easy: 'ง่าย', Medium: 'กลาง', Hard: 'ยาก' } as const;

function LeetCodeRow({ item }: { item: LeetCodeItem }) {
  const done = isLcDone(item.slug);
  const similar = catalog.find((p) => p.code === item.grader);
  const built = similar && problemByCode.get(similar.code);
  return (
    <div className={`card lc-row ${done ? 'done' : ''}`}>
      <label className="lc-check">
        <input type="checkbox" checked={done} onChange={(e) => setLcDone(item.slug, e.target.checked)} />
        <span className="sr-only">ทำข้อ {item.title} แล้ว</span>
      </label>
      <div className="grow">
        <a className="prob-title" href={`https://leetcode.com/problems/${item.slug}/`} target="_blank" rel="noreferrer">
          {item.id}. {item.title} <span aria-hidden="true">↗</span>
        </a>
        <div className="small muted">เทคนิค: {item.technique}</div>
        {similar && (
          <div className="small muted">
            คล้ายกับ {built ? <Link to={`/p/${similar.code}`}>{similar.title}</Link> : similar.title}: {item.why}
          </div>
        )}
      </div>
      <span className={`lc-lvl lc-${item.difficulty.toLowerCase()}`} title={`ระดับตามที่ LeetCode ติดป้ายไว้: ${item.difficulty}`}>{LC_WORD[item.difficulty]}</span>
    </div>
  );
}

function ChapterHead({ num, title, thai, blurb }: { num: string; title: string; thai: string; blurb: string }) {
  return (
    <header className="ch-head">
      <Link to="/" className="back">ทุกบท</Link>
      <div className="ch-head-row">
        <span className="ch-num big">{num}</span>
        <div><h1>{title}</h1><div className="muted">{thai}</div></div>
      </div>
      <p>{blurb}</p>
    </header>
  );
}

function ProblemList({ probs }: { probs: typeof catalog }) {
  if (probs.length === 0) return <p className="muted">บทนี้เป็นเรื่องทฤษฎี ไม่มีโจทย์เขียนโค้ดบน grader ลองทำแบบฝึกหัดในส่วน "เช็กความเข้าใจ" แทน</p>;
  return (
    <div className="prob-list">
      {probs.map((p) => {
        const built = problemByCode.get(p.code);
        const info = (
          <>
            <StatusDot status={getStatus(p.code)} />
            <div className="grow"><div className="prob-title">{p.title}</div><div className="muted small">{ratingOf(p.code)?.source ?? p.code}</div></div>
            <div className="prob-rate"><DifficultyBadge code={p.code} /><WorthStars code={p.code} /></div>
          </>
        );
        return built ? (
          <Link key={p.code} to={`/p/${p.code}`} className="card prob-row">
            {info}
            <span className="go">เขียนโค้ด</span>
          </Link>
        ) : (
          <a key={p.code} href={`${GRADER_BASE}/main/list`} target="_blank" rel="noreferrer" className="card prob-row ext">
            {info}
            <span className="small muted">ทำบน grader ↗</span>
          </a>
        );
      })}
    </div>
  );
}
