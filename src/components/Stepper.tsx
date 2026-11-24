import type { useStepper } from './useStepper';

export function StepperControls({ s }: { s: ReturnType<typeof useStepper> }) {
  const { i, setI, playing, setPlaying, speed, setSpeed, total, next, prev, toggle } = s;
  return (
    <div className="viz-controls">
      <div className="stepper">
        <button className="btn icon" onClick={() => { setPlaying(false); setI(0); }} aria-label="กลับไปขั้นแรก" title="ขั้นแรก (Home)">⏮</button>
        <button className="btn icon" onClick={prev} disabled={i === 0} aria-label="ถอยหนึ่งขั้น" title="ถอย (←)">◀</button>
        <button className="btn primary" onClick={toggle} style={{ minWidth: 112, justifyContent: 'center' }}>
          {playing ? '❚❚ หยุด' : i >= total - 1 ? '↺ เล่นใหม่' : '▶ เล่นอัตโนมัติ'}
        </button>
        <button className="btn icon" onClick={next} disabled={i >= total - 1} aria-label="ไปขั้นถัดไป" title="ถัดไป (→)">▶</button>
        <button className="btn icon" onClick={() => { setPlaying(false); setI(total - 1); }} aria-label="ไปขั้นสุดท้าย" title="ขั้นสุดท้าย (End)">⏭</button>
        <input
          className="range" type="range" min={0} max={Math.max(0, total - 1)} value={i}
          onChange={(e) => { setPlaying(false); setI(+e.target.value); }} aria-label="เลื่อนไปขั้นที่ต้องการ"
        />
        <span className="count">{i + 1}/{total}</span>
        <select className="select" value={speed} onChange={(e) => setSpeed(+e.target.value)} aria-label="ความเร็วตอนเล่นอัตโนมัติ">
          <option value={1200}>ช้า</option>
          <option value={650}>ปกติ</option>
          <option value={250}>เร็ว</option>
        </select>
      </div>
      <div className="stepper-hint">
        คลิกที่กล่องนี้แล้วใช้คีย์บอร์ด: <span className="kbd">←</span><span className="kbd">→</span> ทีละขั้น
        <span className="kbd">Space</span> เล่น/หยุด <span className="kbd">Home</span><span className="kbd">End</span> ต้น/ท้าย
      </div>
    </div>
  );
}

/** Pseudo-code with the current line highlighted, plus live variables. */
export function CodePanel({ title, lines, active, vars }: {
  title: string;
  lines: string[];
  active: number | null;
  vars?: [string, string | number][];
}) {
  return (
    <div className="code-panel" aria-label={`โค้ด ${title}`}>
      <div className="ttl">{title}</div>
      {lines.map((l, k) => (
        <div key={k} className={`code-line ${active === k ? 'hl' : ''}`} aria-current={active === k ? 'step' : undefined}>
          <span className="ln">{k + 1}</span><span>{l}</span>
        </div>
      ))}
      {vars && vars.length > 0 && (
        <div className="vars" aria-label="ค่าตัวแปรตอนนี้">
          {vars.map(([k, v]) => <span key={k} className="var">{k} = <b>{v}</b></span>)}
        </div>
      )}
    </div>
  );
}
