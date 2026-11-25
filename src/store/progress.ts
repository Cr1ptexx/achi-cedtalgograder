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

export function markResult(code: string, allPassed: boolean) {
  logEvent(allPassed ? 'ac' : 'sub', code);
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
