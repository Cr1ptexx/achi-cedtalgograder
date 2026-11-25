import type { LogEntry, LogKind } from './progress';
import { catalog } from '../data/catalog';
import { leetcodeByChapter } from '../data/leetcode';
import { ratingOf } from '../data/ratings';
import { getLog, getStatus, isLcDone } from './progress';

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

// ---------- one-shot summary used by the home page ----------
const LC_XP = { Easy: 5, Medium: 10, Hard: 15 } as const;
const WD = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export function summary() {
  const solved = catalog.filter((p) => getStatus(p.code) === 'solved').length;
  const tried = catalog.filter((p) => getStatus(p.code) === 'tried').length;
  const lcAll = Object.values(leetcodeByChapter).flat();
  const lcDone = lcAll.filter((x) => isLcDone(x.slug)).length;
  const xp =
    catalog.filter((p) => getStatus(p.code) === 'solved').reduce((s, p) => s + 10 * (ratingOf(p.code)?.level ?? 1), 0) +
    lcAll.filter((x) => isLcDone(x.slug)).reduce((s, x) => s + LC_XP[x.difficulty], 0);
  const level = levelOf(xp);

  const days = perDay(getLog());
  const streak = streaks(new Set(days.keys())).current;
  const now = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    const score = days.get(dayKey(d)) ?? 0;
    return { key: dayKey(d), wd: WD[d.getDay()], date: d.getDate(), score, lv: heatLevel(score), today: i === 6 };
  });
  return { solved, tried, total: catalog.length, lcDone, lcTotal: lcAll.length, xp, level, into: xp % XP_PER_LEVEL, streak, week };
}
