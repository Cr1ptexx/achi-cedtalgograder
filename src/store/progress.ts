import { useSyncExternalStore } from 'react';

// Per-browser progress. Everything is wrapped in try/catch because storage can
// be unavailable (private mode, blocked site data).
export type Status = 'todo' | 'tried' | 'solved';

const PREFIX = 'algo-lab:';
const listeners = new Set<() => void>();
let version = 0;

function read(key: string): string | null {
  try { return localStorage.getItem(PREFIX + key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(PREFIX + key, value); } catch { /* ignore */ }
  version++;
  listeners.forEach((l) => l());
}

export function getStatus(code: string): Status {
  const v = read(`status:${code}`);
  return v === 'solved' || v === 'tried' ? v : 'todo';
}

export function markResult(code: string, allPassed: boolean, passed = allPassed ? 1 : 0, total = 1) {
  logEvent(allPassed ? 'ac' : 'sub', code);
  saveBestScore(code, passed, total);
  if (getStatus(code) === 'solved') return; // never downgrade
  if (allPassed) write(`solvedAt:${code}`, String(Date.now()));
  write(`status:${code}`, allPassed ? 'solved' : 'tried');
}

export function loadCode(code: string): string | null { return read(`code:${code}`); }
export function saveCode(code: string, src: string) {
  try { localStorage.setItem(PREFIX + `code:${code}`, src); } catch { /* ignore */ }
}

/** Re-render when any status changes. */
export function useProgressVersion(): number {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => version,
  );
}

/** LeetCode practice items the user has ticked off (links only; we never see their LeetCode account). */
export function isLcDone(slug: string): boolean { return read(`lc:${slug}`) === '1'; }
export function setLcDone(slug: string, done: boolean) {
  if (done && !isLcDone(slug)) logEvent('lc', slug);
  write(`lc:${slug}`, done ? '1' : '0');
}

/** Simple on/off marks (reviewed a chapter, got a Big-O drill right). */
export function getFlag(key: string): boolean { return read(`flag:${key}`) === '1'; }
export function setFlag(key: string, on: boolean) { write(`flag:${key}`, on ? '1' : '0'); }

// ---------- activity log (feeds the heat map on the progress page) ----------
// One entry per action: [timestamp ms, kind, id]. Capped so storage stays small.
export type LogKind = 'sub' | 'ac' | 'lc' | 'quiz';
export type LogEntry = [number, LogKind, string];
const LOG_CAP = 4000;

export function getLog(): LogEntry[] {
  try {
    const v = JSON.parse(read('log') ?? '[]');
    return Array.isArray(v) ? (v as LogEntry[]) : [];
  } catch { return []; }
}
export function logEvent(kind: LogKind, id: string) {
  const log = getLog();
  log.push([Date.now(), kind, id]);
  write('log', JSON.stringify(log.slice(-LOG_CAP)));
}
export function solvedAt(code: string): number | null {
  const v = Number(read(`solvedAt:${code}`));
  return v > 0 ? v : null;
}

// ---------- score: how many test cases passed (best submission) ----------
export type Score = { passed: number; total: number };
export function getScore(code: string): Score | null {
  const m = (read(`score:${code}`) ?? '').match(/^(\d+)\/(\d+)$/);
  return m && +m[2] > 0 ? { passed: +m[1], total: +m[2] } : null;
}
function saveBestScore(code: string, passed: number, total: number) {
  if (total <= 0) return;
  const cur = getScore(code);
  // keep the best ratio; a changed test count (new tests added later) is compared by ratio
  if (cur && cur.passed / cur.total >= passed / total) return;
  write(`score:${code}`, `${passed}/${total}`);
}

// ---------- redo mark and a private note about what went wrong ----------
export function getRedo(code: string): boolean { return read(`redo:${code}`) === '1'; }
export function setRedo(code: string, on: boolean) { write(`redo:${code}`, on ? '1' : '0'); }
export function getNote(code: string): string { return read(`note:${code}`) ?? ''; }
export function setNote(code: string, text: string) { write(`note:${code}`, text); }

// ---------- backup: export / import everything this site keeps in the browser ----------
const BACKUP_MAGIC = 'algo-lab-backup';

export function exportProgress(): string {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) data[k.slice(PREFIX.length)] = localStorage.getItem(k) ?? '';
    }
  } catch { /* ignore */ }
  return JSON.stringify({ app: BACKUP_MAGIC, version: 1, exportedAt: new Date().toISOString(), data }, null, 1);
}

/** Replaces all saved progress with the backup. Returns the number of keys restored, or throws on a bad file. */
export function importProgress(text: string): number {
  let obj: unknown;
  try { obj = JSON.parse(text); } catch { throw new Error('ไฟล์นี้ไม่ใช่ JSON'); }
  const o = obj as { app?: string; data?: Record<string, unknown> };
  if (!o || o.app !== BACKUP_MAGIC || typeof o.data !== 'object' || o.data === null) throw new Error('ไม่ใช่ไฟล์สำรองของ Algo Lab');
  const entries = Object.entries(o.data).filter(([, v]) => typeof v === 'string') as [string, string][];
  try {
    const old: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) old.push(k); }
    old.forEach((k) => localStorage.removeItem(k));
    entries.forEach(([k, v]) => localStorage.setItem(PREFIX + k, v));
  } catch { throw new Error('เขียนข้อมูลลงเบราว์เซอร์ไม่ได้'); }
  version++;
  listeners.forEach((l) => l());
  return entries.length;
}

// ---------- mock exam session ----------
export type MockSession = { codes: string[]; start: number; durationMs: number; results: Record<string, [number, number]>; ended?: boolean };
export function getMock(): MockSession | null {
  try {
    const v = JSON.parse(read('mock') ?? 'null');
    return v && Array.isArray(v.codes) ? (v as MockSession) : null;
  } catch { return null; }
}
export function setMock(m: MockSession | null) { write('mock', m ? JSON.stringify(m) : 'null'); }
/** True while a session exists, is not ended, and time is left. */
export function mockActive(m = getMock()): m is MockSession {
  return !!m && !m.ended && Date.now() < m.start + m.durationMs;
}
/** Keep the best result per problem during the session (only while it is running). */
export function recordMock(code: string, passed: number, total: number) {
  const m = getMock();
  if (!mockActive(m) || !m.codes.includes(code)) return;
  const cur = m.results[code];
  if (!cur || passed / total > cur[0] / cur[1]) m.results[code] = [passed, total];
  setMock(m);
}
