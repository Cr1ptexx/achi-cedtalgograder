import type { LogEntry, LogKind } from './progress';

export const pad = (n: number) => String(n).padStart(2, '0');
/** local calendar day, e.g. 2026-11-25 */
export const dayKey = (t: number | Date) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** How much each action counts toward a day's heat. */
const WEIGHT: Record<LogKind, number> = { sub: 1, ac: 3, lc: 2, quiz: 1 };

export function perDay(log: LogEntry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const [t, kind] of log) m.set(dayKey(t), (m.get(dayKey(t)) ?? 0) + WEIGHT[kind]);
  return m;
}

/** 0 = nothing, 1–4 = darker */
export const heatLevel = (score: number) => (score <= 0 ? 0 : score <= 2 ? 1 : score <= 5 ? 2 : score <= 9 ? 3 : 4);

export function streaks(days: Set<string>, now = new Date()): { current: number; longest: number } {
  // current: walk back from today (a quiet today does not break the streak yet)
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let current = 0;
  while (days.has(dayKey(d))) { current++; d.setDate(d.getDate() - 1); }

  const sorted = [...days].sort();
  let longest = 0, run = 0, prev: Date | null = null;
  for (const k of sorted) {
    const [y, mo, da] = k.split('-').map(Number);
    const cur = new Date(y, mo - 1, da);
    if (prev) {
      const next = new Date(prev); next.setDate(next.getDate() + 1);
      run = dayKey(next) === k ? run + 1 : 1;
    } else run = 1;
    longest = Math.max(longest, run);
    prev = cur;
  }
  return { current, longest };
}

export const XP_PER_LEVEL = 100;
export const levelOf = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export function rankName(level: number): string {
  if (level < 3) return 'ผู้เริ่มต้น';
  if (level < 6) return 'นักลองผิดลองถูก';
  if (level < 10) return 'นักแก้โจทย์';
  if (level < 14) return 'นักออกแบบอัลกอริทึม';
  return 'ปรมาจารย์';
}

/** Fake activity for the "preview" toggle: deterministic, last ~26 weeks. */
export function demoLog(now = Date.now()): LogEntry[] {
  let s = 12345;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const out: LogEntry[] = [];
  const kinds: LogKind[] = ['sub', 'sub', 'ac', 'ac', 'lc', 'quiz'];
  for (let back = 0; back < 180; back++) {
    const burst = back < 9 ? 0.15 : back % 7 === 5 || back % 7 === 6 ? 0.55 : 0.4; // weekends quieter
    if (rnd() < burst) continue;
    const n = 1 + Math.floor(rnd() * rnd() * 9);
    for (let i = 0; i < n; i++) out.push([now - back * 86400000 - Math.floor(rnd() * 40000000), kinds[Math.floor(rnd() * kinds.length)], 'demo']);
  }
  return out.sort((a, b) => a[0] - b[0]);
}
