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
  if (getStatus(code) === 'solved') return; // never downgrade
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
