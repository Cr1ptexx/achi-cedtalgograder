import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { catalog } from '../data/catalog';
import { ASSIGNED } from '../data/assigned';
import { byEase, ratingOf } from '../data/ratings';
import { getMock, mockActive, setMock, useProgressVersion, type MockSession } from '../store/progress';
import { DifficultyBadge } from '../components/Difficulty';

const title = (code: string) => catalog.find((p) => p.code === code)?.title ?? code;
const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return `${h ? h + ':' : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(r).padStart(2, '0')}`;
};

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

const PRESETS = [
  { id: 'final', label: 'ชุดซ้อม Final (6 ข้อ)', mins: 180 },
  { id: 'mix', label: 'สุ่ม 3 ข้อ: ง่าย 1 กลาง 1 ยาก 1', mins: 90 },
  { id: 'hard', label: 'สุ่ม 3 ข้อระดับกลาง–ยาก', mins: 90 },
] as const;

function pick(id: (typeof PRESETS)[number]['id']): string[] {
  if (id === 'final') return ASSIGNED.filter((a) => a.kind === 'practice').map((a) => a.code);
  const lvl = (n: number) => shuffle(catalog.filter((p) => ratingOf(p.code)?.level === n));
  if (id === 'mix') return [1, 2, 3].map((n) => lvl(n)[0]?.code).filter(Boolean) as string[];
  return shuffle(catalog.filter((p) => (ratingOf(p.code)?.level ?? 1) >= 2)).slice(0, 3).map((p) => p.code);
}

export default function MockPage() {
  useProgressVersion();
  const m = getMock();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  if (m && !mockActive(m)) return <Summary m={m} onClear={() => setMock(null)} />;
  if (m) return <Running m={m} left={m.start + m.durationMs - now} />;

  return (
    <>
      <header className="ch-head">
        <h1>จำลองสอบ grader</h1>
        <p>จับเวลาแบบสอบจริง: ปิดคำใบ้ ส่งตรวจได้ไม่จำกัด เมื่อหมดเวลาจะสรุปว่าผ่านกี่เทสเคสในแต่ละข้อ ใช้โจทย์และตัวตรวจชุดเดียวกับในเว็บ</p>
      </header>
      <section className="card review-sec">
        <h2>เลือกชุดและเวลา</h2>
        <div className="review-row" style={{ marginTop: 12 }}>
          {PRESETS.map((p) => (
            <button key={p.id} className="btn primary" onClick={() => { setMock({ codes: pick(p.id).sort((a, b) => byEase({ code: a }, { code: b })), start: Date.now(), durationMs: p.mins * 60000, results: {} }); }}>
              {p.label} · {p.mins} นาที
            </button>
          ))}
        </div>
        <p className="muted small">กดชุดไหน เวลาเริ่มนับทันที ข้อสอบจริงใช้เวลาประมาณ 3 ชั่วโมงสำหรับ 6 ข้อ</p>
      </section>
    </>
  );
}

function Running({ m, left }: { m: MockSession; left: number }) {
  const end = () => { if (confirm('จบการสอบตอนนี้และดูสรุป?')) setMock({ ...m, ended: true }); };
  return (
    <>
      <header className="ch-head">
        <h1>กำลังสอบ <span className={`mock-time ${left < 300000 ? 'low' : ''}`}>{fmt(left)}</span></h1>
        <p>ส่งตรวจในหน้าแต่ละข้อ ระบบจะจำคะแนนที่ดีที่สุดของแต่ละข้อไว้ให้ในสรุป</p>
      </header>
      <section className="card review-sec">
        <ul className="review-list">
          {m.codes.map((c) => {
            const r = m.results[c];
            return (
              <li key={c}>
                <div className="review-row">
                  <Link to={`/p/${c}`}>{title(c)}</Link>
                  <DifficultyBadge code={c} />
                  <span className="small muted">{r ? `${r[0]}/${r[1]}` : 'ยังไม่ส่ง'}</span>
                  {r && r[0] === r[1] && <span className="small">✓</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <button className="btn" onClick={end}>จบการสอบ</button>
      </section>
    </>
  );
}

function Summary({ m, onClear }: { m: MockSession; onClear: () => void }) {
  const full = m.codes.filter((c) => m.results[c] && m.results[c][0] === m.results[c][1]).length;
  const used = Math.min(m.durationMs, (m.ended ? Date.now() : m.start + m.durationMs) - m.start);
  return (
    <>
      <header className="ch-head">
        <h1>สรุปผลจำลองสอบ</h1>
        <p>ผ่านเต็ม {full}/{m.codes.length} ข้อ · ใช้เวลาไม่เกิน {fmt(used)} จาก {fmt(m.durationMs)}</p>
      </header>
      <section className="card review-sec">
        <ul className="review-list">
          {m.codes.map((c) => {
            const r = m.results[c];
            return (
              <li key={c}>
                <div className="review-row">
                  <Link to={`/p/${c}`}>{title(c)}</Link>
                  <DifficultyBadge code={c} />
                  <span className="small">{r ? `${r[0]}/${r[1]} เทสเคส` : 'ไม่ได้ส่ง'}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="review-row">
          <button className="btn primary" onClick={onClear}>เริ่มชุดใหม่</button>
          <Link className="btn" to="/review">ไปหน้าทบทวน</Link>
        </div>
      </section>
    </>
  );
}
