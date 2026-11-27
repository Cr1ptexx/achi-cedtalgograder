import { Link } from 'react-router-dom';
import { useState } from 'react';
import { catalog } from '../data/catalog';
import { ASSIGNED, KIND_LABEL, type AssignedItem, type AssignedKind } from '../data/assigned';
import { dateLabel, daysUntil } from '../data/exams';
import { byEase } from '../data/ratings';
import { getStatus, useProgressVersion } from '../store/progress';
import StatusDot from '../components/StatusDot';
import { DifficultyBadge } from '../components/Difficulty';
import { RedoMark, ScoreChip } from '../components/ScoreChip';

const WEEKDAY = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
type Filter = 'all' | 'todo' | AssignedKind;

const titleOf = new Map(catalog.map((p) => [p.code, p.title]));
const weekday = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return WEEKDAY[new Date(y, m - 1, d).getDay()]; };

export default function AssignedPage() {
  useProgressVersion();
  const [filter, setFilter] = useState<Filter>('all');

  const solved = (it: AssignedItem) => getStatus(it.code) === 'solved';
  // a problem can appear on two dates (e.g. homework, then the final practice set): count it once
  const codes = [...new Set(ASSIGNED.map((i) => i.code))];
  const total = codes.length;
  const done = codes.filter((c) => getStatus(c) === 'solved').length;
  const byKind = (k: AssignedKind) => ({ done: ASSIGNED.filter((i) => i.kind === k && solved(i)).length, all: ASSIGNED.filter((i) => i.kind === k).length });
  const cls = byKind('class'), home = byKind('home'), practice = byKind('practice');

  // next problem to do: oldest unfinished day first, easiest first inside the day
  const open = ASSIGNED.filter((i) => !solved(i));
  const firstDate = open.map((i) => i.date).sort()[0];
  const next = open.length ? open.filter((i) => i.date === firstDate).sort((a, b) => byEase(a, b))[0] : null;

  const dates = [...new Set(ASSIGNED.map((i) => i.date))].sort();
  const keep = (it: AssignedItem) => filter === 'all' || (filter === 'todo' ? !solved(it) : it.kind === filter);

  return (
    <>
      <header className="ch-head">
        <h1>ตารางทำโจทย์</h1>
        <p>โจทย์ที่ได้รับมอบหมายตามวัน แบ่งเป็น "คาบบ่าย" (ทำในคาบ) กับ "การบ้าน" กดชื่อข้อเพื่อเขียนและตรวจในหน้าเว็บได้เลย</p>

        <div className="as-sum">
          <div className="as-count"><b>{done}</b><span>/ {total} ข้อผ่านแล้ว</span></div>
          <div className="grow">
            <div className="progress big"><div style={{ width: `${(done / total) * 100}%` }} /></div>
            <div className="small muted">คาบบ่าย {cls.done}/{cls.all} · การบ้าน {home.done}/{home.all} · ซ้อมสอบ {practice.done}/{practice.all}</div>
          </div>
          {next ? <Link className="btn primary" to={`/p/${next.code}`}>ข้อถัดไป: {titleOf.get(next.code)}</Link> : <span className="pill ok">ครบทุกข้อแล้ว</span>}
        </div>

        <div className="seg" role="group" aria-label="กรองรายการ">
          {([['all', 'ทั้งหมด'], ['todo', 'ยังไม่ผ่าน'], ['class', 'คาบบ่าย'], ['home', 'การบ้าน'], ['practice', 'ซ้อมสอบ']] as const).map(([k, label]) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
      </header>

      <div className="as-days">
        {dates.map((date) => {
          const all = ASSIGNED.filter((i) => i.date === date);
          const shown = all.filter(keep);
          if (!shown.length) return null;
          const dDone = all.filter(solved).length;
          const days = daysUntil(date);
          const complete = dDone === all.length;
          const tag = complete ? { t: 'ครบแล้ว ✓', c: 'ok' }
            : days === 0 ? { t: 'วันนี้', c: 'now' }
              : days < 0 ? { t: `เลยมา ${-days} วัน`, c: 'late' }
                : { t: days === 1 ? 'พรุ่งนี้' : `อีก ${days} วัน`, c: '' };
          const [, m, d] = date.split('-').map(Number);
          return (
            <section key={date} className={`card as-day ${complete ? 'done' : ''}`}>
              <div className="as-head">
                <div className="as-date" aria-label={dateLabel(date)}><span>{weekday(date)}</span><b>{d}</b><i>{['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][m - 1]}</i></div>
                <div className="grow">
                  <h2 className="as-topic">{all[0].topic}</h2>
                  <div className="small muted">{dDone}/{all.length} ข้อ</div>
                </div>
                <span className={`as-tag ${tag.c}`}>{tag.t}</span>
              </div>
              {(['class', 'home', 'practice'] as const).map((k) => {
                const rows = shown.filter((i) => i.kind === k);
                if (!rows.length) return null;
                return (
                  <div key={k} className="as-group">
                    <div className="as-kind">{KIND_LABEL[k]}</div>
                    {rows.map((it) => (
                      <Link key={it.code} to={`/p/${it.code}`} className="as-row">
                        <StatusDot status={getStatus(it.code)} />
                        <span className="grow">
                          <span className="prob-title">{titleOf.get(it.code) ?? it.code}</span>
                          <span className="small muted as-code"> {it.code}</span>
                          <RedoMark code={it.code} showNote={false} />
                        </span>
                        <ScoreChip code={it.code} />
                        <DifficultyBadge code={it.code} />
                      </Link>
                    ))}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      <p className="small muted">ตารางนี้คัดจากตารางที่ได้รับมอบหมาย (เฉพาะโจทย์ algorithm) ถ้ามีวันอื่นเพิ่ม แก้ที่ <code>src/data/assigned.ts</code></p>
    </>
  );
}
