import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { problemByCode } from '../data/problems';
import { chapterBySlug } from '../data/chapters';
import { catalog, GRADER_BASE } from '../data/catalog';
import { runner, type Checker, type TestCase, type TestResult } from '../runner/cppRunner';
import type { TestFile } from '../data/types';
import { getMock, getStatus, loadCode, markResult, mockActive, recordMock, saveCode } from '../store/progress';
import { DifficultyBadge, WorthStars } from '../components/Difficulty';
import ReviewBox from '../components/ReviewBox';
import { ratingOf } from '../data/ratings';

type Phase = 'idle' | 'loading' | 'compiling' | 'running' | 'done' | 'ce';
type Tab = 'results' | 'custom';

const VERDICT: Record<TestResult['verdict'], string> = {
  AC: 'ผ่าน', WA: 'คำตอบผิด', TLE: 'เกินเวลา', RE: 'โปรแกรมหยุดกลางคัน',
};
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

// Where the original PDF is known to be wrong, so nobody loses time on it.
const PDF_NOTES: Record<string, string> = {
  a62_q2a_line_graph: 'หมายเหตุ: ตัวอย่างหนึ่งใน PDF ต้นฉบับระบุคำตอบ 2 แต่ 2-3-4 เป็นวงสามเหลี่ยม (ไม่ใช่กราฟเส้นตรง) คำตอบที่ถูกคือ 1 ซึ่งตรงกับเทสของ grader รายการตัวอย่างด้านล่างใช้ค่านี้',
  ex00e5: 'หมายเหตุ: ตัวอย่างใน PDF ต้นฉบับพิมพ์ผลลัพธ์ไม่ครบ รายการตัวอย่างด้านล่างเป็นฉบับที่ตรงกับเทสของ grader',
};

export default function ProblemPage() {
  const { code = '' } = useParams();
  const p = problemByCode.get(code);
  const [src, setSrc] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [compilerReady, setCompilerReady] = useState(false);
  const [compilerError, setCompilerError] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [runSet, setRunSet] = useState<TestCase[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [failedOnce, setFailedOnce] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [tab, setTab] = useState<Tab>('results');
  const [stmtTab, setStmtTab] = useState<'pdf' | 'summary'>('pdf');
  const [customIn, setCustomIn] = useState('');
  const [customOut, setCustomOut] = useState<{ text: string; note: string; bad: boolean } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dark = useDarkMode();
  const [testFile, setTestFile] = useState<TestFile | null>(null);
  const [testErr, setTestErr] = useState(false);
  const [checker, setChecker] = useState<Checker>('exact');
  const [validator, setValidator] = useState<string | undefined>();

  useEffect(() => {
    if (!p) return;
    setSrc(loadCode(p.code) ?? p.starter);
    setResults([]); setPhase('idle'); setFailedOnce(false); setHintsShown(0); setTab('results'); setCustomOut(null);
    setCustomIn(p.statement?.samples[0]?.input ?? '');
    setTestFile(null); setTestErr(false);
    fetch(`${import.meta.env.BASE_URL}tests/${p.code}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((f: TestFile) => { setTestFile(f); setChecker(f.checker); setValidator(f.validator); })
      .catch(() => setTestErr(true));
  }, [p]);

  useEffect(() => {
    runner.warmUp().then(() => setCompilerReady(true)).catch((e) => setCompilerError(String(e)));
  }, []);

  const samples = useMemo(() => p?.statement?.samples ?? testFile?.tests.slice(0, 1) ?? [], [p, testFile]);
  const counts = useMemo(() => {
    const c = { sample: 0, grader: 0, generated: 0 };
    testFile?.tests.forEach((t) => { c[t.source]++; });
    return c;
  }, [testFile]);

  const inMock = mockActive(getMock()) && !!getMock()?.codes.includes(code);
  const busy = phase === 'loading' || phase === 'compiling' || phase === 'running';

  async function run(tests: TestCase[], isSubmit: boolean) {
    if (!p) return;
    setTab('results');
    setResults([]); setOpen(null); setLog(''); setRunSet(tests);
    setPhase(compilerReady ? 'compiling' : 'loading');
    try {
      const c = await runner.compile(src);
      if (!c.ok) { setLog(c.log); setPhase('ce'); setFailedOnce(true); if (isSubmit) { markResult(p.code, false, 0, tests.length); recordMock(p.code, 0, tests.length); } return; }
      setLog(c.log);
      setPhase('running');
      const rs = await runner.runTests(c.wasm, tests, (r) => setResults((prev) => [...prev, r]), p.timeLimitMs, checker, validator);
      setPhase('done');
      const allOk = rs.every((r) => r.verdict === 'AC');
      if (!allOk) setFailedOnce(true);
      if (isSubmit && allOk && getStatus(p.code) !== 'solved') { setXpToast(10 * (ratingOf(p.code)?.level ?? 1)); setTimeout(() => setXpToast(null), 2200); }
      if (isSubmit) { const ok = rs.filter((r) => r.verdict === 'AC').length; markResult(p.code, allOk, ok, rs.length); recordMock(p.code, ok, rs.length); }
      const firstBad = rs.find((r) => r.verdict !== 'AC');
      if (firstBad) setOpen(firstBad.index);
    } catch (e) {
      setLog(String(e)); setPhase('ce');
    }
  }

  async function runCustom() {
    if (!p) return;
    setTab('custom');
    setCustomOut({ text: '', note: compilerReady ? 'กำลังคอมไพล์…' : 'กำลังโหลด compiler…', bad: false });
    setPhase(compilerReady ? 'compiling' : 'loading');
    try {
      const c = await runner.compile(src);
      if (!c.ok) { setCustomOut({ text: c.log, note: 'คอมไพล์ไม่ผ่าน', bad: true }); setPhase('idle'); return; }
      setPhase('running');
      const [r] = await runner.runTests(c.wasm, [{ input: customIn, output: '' }], () => {}, p.timeLimitMs);
      const note = r.verdict === 'TLE' ? `เกินเวลา ${p.timeLimitMs / 1000} วินาที` : r.error ? r.error : `รันเสร็จใน ${r.ms.toFixed(0)} ms`;
      setCustomOut({ text: r.stdout, note, bad: r.verdict === 'TLE' || r.verdict === 'RE' });
    } catch (e) {
      setCustomOut({ text: String(e), note: 'เกิดข้อผิดพลาด', bad: true });
    }
    setPhase('idle');
  }

  // Ctrl/⌘+Enter = run examples, Ctrl/⌘+Shift+Enter = submit. Capture phase so the editor doesn't eat it.
  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  keys.current = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || busy) return;
    e.preventDefault(); e.stopPropagation();
    if (e.shiftKey) { if (testFile) run(testFile.tests, true); }
    else if (tab === 'custom') runCustom();
    else run(samples, false);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, []);

  if (!p) return <p>ไม่พบโจทย์นี้ <Link to="/plan">ไปหน้าโจทย์ทั้งหมด</Link></p>;
  // the exam set has no chapter page of its own; it lives on the plan page
  const ch = chapterBySlug.get(p.chapter);
  const back = ch
    ? { to: `/ch/${ch.slug}`, label: `บท ${ch.num} ${ch.title}` }
    : { to: '/plan', label: 'ข้อสอบปลายภาคเก่า' };

  // next problem in the same chapter, so you can keep going without going back to a list
  const sibs = catalog.filter((x) => x.chapter === p.chapter);
  const nextProb = sibs[sibs.findIndex((x) => x.code === p.code) + 1];

  const onChange = (v: string) => {
    setSrc(v);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCode(p.code, v), 400);
  };

  const passed = results.filter((r) => r.verdict === 'AC').length;
  const allPassed = phase === 'done' && passed === runSet.length;
  const compilerState = compilerError ? 'bad' : compilerReady ? 'ok' : '';

  return (
    <div className="ide">
      <section className="ide-left card">
        <Link to={back.to} className="small">{back.label}</Link>
        <h1 className="prob-h1">{p.title}</h1>
        <div className="meta-row">
          <span className="muted small">{p.code}</span>
          <a className="small" href={`${GRADER_BASE}/main/list`} target="_blank" rel="noreferrer">เปิดบน grader ↗</a>
          {nextProb && <Link className="small" to={`/p/${nextProb.code}`}>ข้อถัดไป: {nextProb.title} →</Link>}
        </div>
        {inMock && <div className="notice">โหมดจำลองสอบ: ปิดคำใบ้ · <Link to="/mock">กลับไปดูเวลาและรายการข้อ</Link></div>}
        <RatingLine code={p.code} />

        <div className="seg stmt-tabs" role="tablist" aria-label="รูปแบบโจทย์">
          <button role="tab" aria-selected={stmtTab === 'pdf'} className={stmtTab === 'pdf' ? 'on' : ''} onClick={() => setStmtTab('pdf')}>โจทย์จริง (PDF)</button>
          <button role="tab" aria-selected={stmtTab === 'summary'} className={stmtTab === 'summary' ? 'on' : ''} onClick={() => setStmtTab('summary')}>สรุปโดยย่อ</button>
        </div>

        {stmtTab === 'pdf' ? (
          <div className="pdf-box">
            <iframe key={p.code} className="pdf-frame" title={`โจทย์ ${p.title} (ไฟล์ต้นฉบับ)`}
              src={`${import.meta.env.BASE_URL}statements/${p.code}.pdf#view=FitH&toolbar=0`} />
            <div className="pdf-links small">
              <a href={`${import.meta.env.BASE_URL}statements/${p.code}.pdf`} target="_blank" rel="noreferrer">เปิด PDF เต็มหน้าจอ ↗</a>
              <span className="muted">ถ้าไม่ขึ้นในกรอบ (เช่น บนมือถือ) ให้กดลิงก์นี้</span>
            </div>
            {PDF_NOTES[p.code] && <div className="notice">{PDF_NOTES[p.code]}</div>}
          </div>
        ) : p.statement ? (
          <div className="statement">
            <h3>โจทย์</h3><p>{p.statement.task}</p>
            <h3>ข้อมูลนำเข้า</h3><p>{p.statement.input}</p>
            <h3>ข้อมูลส่งออก</h3><p>{p.statement.output}</p>
            {p.statement.constraints && (<><h3>ขอบเขต</h3><p>{p.statement.constraints}</p></>)}
            <p className="muted small">สรุปโดยผู้จัดทำเว็บ ใช้ฉบับ PDF เป็นหลักเมื่อมีข้อสงสัย</p>
          </div>
        ) : (
          <div className="notice">ข้อนี้ยังไม่มีสรุปโจทย์ในเว็บ ดูโจทย์จริงที่แท็บ PDF</div>
        )}

        <h3>ตัวอย่าง</h3>
        {samples.map((t, k) => (
          <div key={k} className="sample">
            <div>
              <div className="io-head"><span className="label">input</span>
                <button className="copy-btn" onClick={() => { setCustomIn(t.input); setTab('custom'); }}>ใช้ลองรัน</button>
              </div>
              <pre className="io">{t.input}</pre>
            </div>
            <div><div className="io-head"><span className="label">output</span></div><pre className="io">{t.output}</pre></div>
          </div>
        ))}
        <p className="muted small">
          {testFile
            ? <>ตรวจจริงด้วย {testFile.tests.length} ชุด: ตัวอย่างในโจทย์ {counts.sample}, จาก grader {counts.grader}, สร้างเพิ่ม {counts.generated}. </>
            : testErr ? 'โหลดชุดทดสอบไม่สำเร็จ ลองรีเฟรชหน้า. ' : 'กำลังโหลดชุดทดสอบ… '}
          {testFile?.dropped ? `ข้ามอีก ${testFile.dropped} ชุดที่หนักเกินไปสำหรับเบราว์เซอร์ (ลองบน grader ได้). ` : ''}
          จำกัดเวลา {p.timeLimitMs / 1000} วินาทีต่อชุด
          {checker === 'lines-any-order' && ' และไม่สนลำดับบรรทัด'}
          {checker === 'custom' && ' ข้อนี้ตอบได้หลายแบบ ระบบตรวจว่าคำตอบของคุณตรงเงื่อนไขของโจทย์ ไม่ได้เทียบกับคำตอบเดียว'}
          {checker === 'float' &&' และยอมให้ทศนิยมคลาดเคลื่อนได้ 0.0001 (หรือ 0.00001% ถ้าตัวเลขใหญ่)'}
        </p>

        {failedOnce && !inMock && (
          <div className="hint-box">
            {p.hints.length === 0 ? (
              <p className="muted small">ข้อนี้ยังไม่มีคำใบ้</p>
            ) : (
              <>
                {p.hints.slice(0, hintsShown).map((h, k) => (
                  <div key={k} className="hint"><b>คำใบ้ {k + 1}</b> {h}</div>
                ))}
                {hintsShown < p.hints.length && (
                  <button className="btn hint-btn" onClick={() => setHintsShown(hintsShown + 1)}>
                    💡 {hintsShown === 0 ? 'ติดอยู่? ดูคำใบ้' : 'ดูคำใบ้ถัดไป'} ({hintsShown + 1}/{p.hints.length})
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <ReviewBox key={p.code} code={p.code} />
      </section>

      <section className="ide-right">
        <div className="card editor-card">
          <div className="editor-bar">
            <span className="small muted">main.cpp (C++17) · บันทึกอัตโนมัติ</span>
            <button className="btn ghost small" onClick={() => { if (confirm('ล้างโค้ดกลับเป็นเทมเพลตเริ่มต้น?')) onChange(p.starter); }}>รีเซ็ตโค้ด</button>
          </div>
          <CodeMirror value={src} onChange={onChange} extensions={[cpp()]} theme={dark ? 'dark' : 'light'} height="100%" className="cm" basicSetup={{ tabSize: 4 }} />
        </div>

        <div className="run-bar">
          <span className="small muted">
            <span className={`status-dot ${compilerState}`} />
            {compilerError ? 'โหลด compiler ไม่สำเร็จ ลองรีเฟรชหน้า' : compilerReady ? 'compiler พร้อม' : 'กำลังโหลด compiler (ครั้งแรกใช้เวลาสักครู่)'}
          </span>
          <div className="grow" />
          <button className="btn" disabled={busy} onClick={() => (tab === 'custom' ? runCustom() : run(samples, false))}
            title={`${MOD}+Enter`}>
            {tab === 'custom' ? 'รันด้วย input นี้' : 'รันตัวอย่าง'} <span className="kbd">{MOD}+Enter</span>
          </button>
          <button className={`btn primary submit-btn ${busy ? 'busy' : ''}`} disabled={busy || !testFile} onClick={() => testFile && run(testFile.tests, true)}
            title={`${MOD}+Shift+Enter`}>
            ส่งตรวจทุกชุด <span className="kbd">{MOD}+⇧+Enter</span>
          </button>
        </div>

        <div className="card results">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'results'} className={tab === 'results' ? 'on' : ''} onClick={() => setTab('results')}>ผลตรวจ</button>
            <button role="tab" aria-selected={tab === 'custom'} className={tab === 'custom' ? 'on' : ''} onClick={() => setTab('custom')}>ลอง input เอง</button>
          </div>
          <div className="tab-body">
            {tab === 'custom' ? (
              <div className="io2">
                <div>
                  <div className="label">input</div>
                  <textarea className="textarea" rows={6} value={customIn} onChange={(e) => setCustomIn(e.target.value)} spellCheck={false} aria-label="input ที่จะใช้รัน" />
                </div>
                <div>
                  <div className="label">ผลลัพธ์ {customOut && <span className={customOut.bad ? '' : 'muted'} style={customOut.bad ? { color: 'var(--red)' } : undefined}>— {customOut.note}</span>}</div>
                  <pre className="io" style={{ minHeight: 140 }}>{customOut ? clip(customOut.text) || '(ไม่มีผลลัพธ์)' : 'กด "รันด้วย input นี้" เพื่อดูผล'}</pre>
                </div>
              </div>
            ) : (
              <>
                {phase === 'idle' && (
                  <p className="muted" style={{ margin: 0 }}>
                    "รันตัวอย่าง" ลองกับตัวอย่างในโจทย์ ส่วน "ส่งตรวจทุกชุด" ตรวจจริงและบันทึกความคืบหน้า
                  </p>
                )}
                {phase === 'loading' && <p className="muted">กำลังโหลด compiler…</p>}
                {phase === 'compiling' && <p className="muted">กำลังคอมไพล์…</p>}
                {phase === 'ce' && (<><div className="verdict-banner bad">คอมไพล์ไม่ผ่าน — ดูบรรทัดที่ error ด้านล่าง</div><pre className="io log">{log}</pre></>)}
                {(phase === 'running' || phase === 'done') && (
                  <>
                    {xpToast !== null && <div className="xp-toast" role="status">+{xpToast} XP</div>}
                    <div className={`verdict-banner ${allPassed ? 'good' : phase === 'done' ? 'bad' : ''}`}>
                      {phase === 'running' ? `กำลังตรวจ ${results.length}/${runSet.length}` : allPassed ? `ผ่านทั้งหมด ${passed}/${runSet.length}` : `ผ่าน ${passed} จาก ${runSet.length} ชุด — กดที่ชุดสีแดงเพื่อดูว่าต่างตรงไหน`}
                    </div>
                    <div className="tc-strip">
                      {runSet.map((_, k) => {
                        const r = results[k];
                        return (
                          <button key={k} className={`tc ${r ? r.verdict : 'pending'} ${open === k ? 'open' : ''}`}
                            onClick={() => setOpen(open === k ? null : k)} title={r ? `ชุดที่ ${k + 1}: ${VERDICT[r.verdict]}` : 'รอตรวจ'}
                            aria-label={r ? `ชุดที่ ${k + 1} ${VERDICT[r.verdict]}` : `ชุดที่ ${k + 1} รอตรวจ`}>
                            {r ? (r.verdict === 'AC' ? '✓' : r.verdict) : k + 1}
                          </button>
                        );
                      })}
                    </div>
                    {open !== null && results[open] && <TestDetail t={runSet[open]} r={results[open]} onTry={(inp) => { setCustomIn(inp); setTab('custom'); }} />}
                    {log && <details className="small"><summary>คำเตือนจาก compiler</summary><pre className="io log">{log}</pre></details>}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Follows the site theme toggle and the OS setting. */
function useDarkMode() {
  const read = () => {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark' || t === 'light') return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setDark(read());
    mq.addEventListener('change', on);
    window.addEventListener('algo-lab:theme', on);
    return () => { mq.removeEventListener('change', on); window.removeEventListener('algo-lab:theme', on); };
  }, []);
  return dark;
}

function RatingLine({ code }: { code: string }) {
  const r = ratingOf(code);
  if (!r) return null;
  return (
    <div className="rating-line">
      <div><DifficultyBadge code={code} /><span className="small muted">{r.why ? `${r.why} · ` : ''}เพื่อนส่งเฉลี่ยคนละ {r.tries.toFixed(1)} ครั้ง ({r.people} คน)</span></div>
      <div><WorthStars code={code} /><span className="small muted">{r.reasons.join(', ')}</span></div>
    </div>
  );
}

function clip(s: string, n = 1500) { return s.length > n ? s.slice(0, n) + `\n… (แสดง ${n} ตัวอักษรแรก)` : s; }

function TestDetail({ t, r, onTry }: { t: TestCase; r: TestResult; onTry: (input: string) => void }) {
  return (
    <div className="tc-detail">
      <div className="io-head">
        <span><b>ชุดที่ {r.index + 1}</b> {VERDICT[r.verdict]} <span className="muted small">{r.ms.toFixed(0)} ms</span></span>
        {t.input.length < 20000 && <button className="copy-btn" onClick={() => onTry(t.input)}>เอา input นี้ไปลองรันเอง</button>}
      </div>
      {r.firstDiff && (
        <div className="diffline">
          {r.firstDiff.line === -1
            ? <>เงื่อนไขของโจทย์: <code>{r.firstDiff.expected}</code> แต่ <code>{r.firstDiff.got}</code></>
            : r.firstDiff.line > 0
            ? <>บรรทัดที่ {r.firstDiff.line} ควรเป็น <code>{r.firstDiff.expected}</code> แต่ได้ <code>{r.firstDiff.got}</code></>
            : <>ต้องมีบรรทัด <code>{r.firstDiff.expected}</code> แต่ <code>{r.firstDiff.got}</code></>}
        </div>
      )}
      {r.verdict === 'TLE' && <div className="diffline">โปรแกรมทำงานนานเกินเวลาที่กำหนด ลองคิดว่ามีกิ่งไหนตัดทิ้งได้ หรือมีลูปที่ไม่จบ</div>}
      {r.error && <div className="diffline">{r.error}</div>}
      <div className="io3">
        <div><div className="label">input</div><pre className="io">{clip(t.input)}</pre></div>
        <div><div className="label">คำตอบที่ถูก</div><pre className="io">{clip(t.output)}</pre></div>
        <div><div className="label">ผลของคุณ</div><pre className="io">{clip(r.stdout)}</pre></div>
      </div>
    </div>
  );
}
