import { useState } from 'react';

const SEC = { year: 365 * 24 * 3600 };

function human(ops: number): { text: string; tone: 'ok' | 'slow' | 'never' } {
  const s = ops / 1e9; // 10^9 simple operations per second
  if (!isFinite(s) || s > 4.4e17) return { text: 'นานกว่าอายุจักรวาล', tone: 'never' };
  if (s < 1e-3) return { text: 'ทันที', tone: 'ok' };
  if (s < 1) return { text: `${(s * 1000).toFixed(0)} มิลลิวินาที`, tone: 'ok' };
  if (s < 60) return { text: `${s.toFixed(1)} วินาที`, tone: s <= 2 ? 'ok' : 'slow' };
  if (s < 3600) return { text: `${(s / 60).toFixed(1)} นาที`, tone: 'slow' };
  if (s < 86400) return { text: `${(s / 3600).toFixed(1)} ชั่วโมง`, tone: 'slow' };
  if (s < SEC.year) return { text: `${(s / 86400).toFixed(1)} วัน`, tone: 'slow' };
  const y = s / SEC.year;
  return { text: y < 1e6 ? `${y.toLocaleString('en-US', { maximumFractionDigits: 0 })} ปี` : `${y.toExponential(1).replace('e+', '×10^')} ปี`, tone: 'never' };
}

const sci = (x: number) => (!isFinite(x) ? '∞' : x < 1e6 ? Math.round(x).toLocaleString('en-US') : x.toExponential(2).replace('e+', '×10^'));
const fact = (n: number) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };

const ROWS: { name: string; f: (n: number) => number; cls: string }[] = [
  { name: 'log n', f: (n) => Math.log2(n), cls: 'P' },
  { name: 'n', f: (n) => n, cls: 'P' },
  { name: 'n log n', f: (n) => n * Math.log2(n), cls: 'P' },
  { name: 'n²', f: (n) => n * n, cls: 'P' },
  { name: 'n³', f: (n) => n ** 3, cls: 'P' },
  { name: '2ⁿ', f: (n) => 2 ** n, cls: 'EXP' },
  { name: 'n!', f: (n) => fact(n), cls: 'EXP' },
];

export default function GrowthViz() {
  const [n, setN] = useState(25);
  return (
    <div className="viz">
      <div className="card" style={{ padding: 16 }}>
        <label className="ctl" style={{ width: '100%' }}>
          <span>ขนาดข้อมูล n =</span>
          <input type="range" className="range" min={2} max={100} value={n} onChange={(e) => setN(+e.target.value)} aria-label="ขนาดข้อมูล n" style={{ flex: 1, minWidth: 160 }} />
          <b className="mono" style={{ minWidth: 36 }}>{n}</b>
        </label>
        <p className="small muted" style={{ margin: '8px 0 0' }}>สมมติเครื่องทำได้ 10⁹ ขั้นต่อวินาที (ประมาณเวลาที่ grader ให้ต่อข้อ)</p>
      </div>
      <table className="table">
        <thead><tr><th>ฟังก์ชันเวลา</th><th>จำนวนขั้น</th><th>ใช้เวลา</th></tr></thead>
        <tbody>
          {ROWS.map((r) => {
            const ops = r.f(n), h = human(ops);
            return (
              <tr key={r.name}>
                <td className="mono">{r.name}</td>
                <td className="mono small">{sci(ops)}</td>
                <td style={{ color: h.tone === 'never' ? 'var(--red)' : h.tone === 'slow' ? 'var(--marker-ink)' : 'var(--green)', fontWeight: 600 }}>{h.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="step-note" aria-live="polite">
        {n <= 20 ? 'n เล็ก ๆ แบบนี้ทุกตัวยังพอไหว ลองเลื่อน n ขึ้นไปดูว่าตัวไหนเริ่มพัง' : n <= 40 ? 'ถึง n ≈ 30–40 ฟังก์ชันแบบ 2ⁿ เริ่มช้าจนใช้ไม่ได้ ขณะที่ n³ ยังทันที' : 'ที่ n ระดับนี้ 2ⁿ และ n! เกินความเป็นไปได้ไปไกลมาก เพราะแบบพหุนามต่างจากแบบเอกซ์โพเนนเชียลที่ "อัตราการโต" ไม่ใช่แค่ค่าคงที่'}
      </div>
    </div>
  );
}
