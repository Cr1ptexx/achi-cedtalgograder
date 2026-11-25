import { validators } from './validators';

// Main-thread client for public/runner/worker.js.
// One long-lived "compile" worker keeps clang warm; a separate "exec" worker
// runs the user's binary and is killed + replaced when a test hits the time limit.

export type TestCase = { input: string; output: string };

export type Verdict = 'AC' | 'WA' | 'TLE' | 'RE';

export type TestResult = {
  index: number;
  verdict: Verdict;
  ms: number;
  stdout: string;
  error?: string;
  firstDiff?: { line: number; expected: string; got: string };
};

export type CompileResult = { ok: true; wasm: ArrayBuffer; log: string } | { ok: false; log: string };

type WorkerReply = {
  type: string;
  ok?: boolean;
  log?: string;
  wasm?: ArrayBuffer;
  stdout?: string;
  error?: string | null;
  ms?: number;
};
type Pending = { resolve: (v: WorkerReply) => void; reject: (e: unknown) => void };

const WORKER_URL = `${import.meta.env.BASE_URL}runner/worker.js`;

class WorkerHandle {
  worker: Worker;
  ready: Promise<void>;
  private pending = new Map<number, Pending>();
  private nextId = 1;

  constructor(mode: 'compile' | 'exec') {
    this.worker = new Worker(WORKER_URL);
    this.ready = new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') return resolve();
        const p = this.pending.get(m.id);
        if (m.type === 'fatal') {
          if (p) { this.pending.delete(m.id); p.reject(new Error(m.error)); }
          else reject(new Error(m.error));
          return;
        }
        if (p) { this.pending.delete(m.id); p.resolve(m); }
      };
      this.worker.onerror = (e) => reject(new Error(e.message || 'worker failed to load'));
    });
    this.worker.postMessage({ type: 'init', mode });
  }

  call(msg: Record<string, unknown>, transfer: Transferable[] = []): Promise<WorkerReply> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...msg, id }, transfer);
    });
  }

  kill() {
    this.worker.terminate();
    for (const p of this.pending.values()) p.reject(new Error('killed'));
    this.pending.clear();
  }
}

/** Lines compared after trimming trailing spaces; trailing blank lines ignored (grader-style). */
export function normalize(s: string): string[] {
  const lines = s.replace(/\r\n?/g, '\n').split('\n').map((l) => l.trimEnd());
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/** exact: line by line · lines-any-order: ignore line order · float: numbers may differ by max(1e-4, 1e-7 relative)
 *  (the grader prints 4 decimals and accepts 0.00001% error, so 1e-4 absolute covers the rounding of the expected value) */
export type Checker = 'exact' | 'lines-any-order' | 'float' | 'custom';

const NUM = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
function sameLineFloat(x: string, y: string): boolean {
  if (x === y) return true;
  const p = x.split(/\s+/), q = y.split(/\s+/);
  if (p.length !== q.length) return false;
  return p.every((t, i) => {
    if (t === q[i]) return true;
    if (!NUM.test(t) || !NUM.test(q[i])) return false;
    const u = +t, v = +q[i];
    return Math.abs(u - v) <= Math.max(1e-4, 1e-7 * Math.max(Math.abs(u), Math.abs(v)));
  });
}

export function compareOutput(
  expected: string, got: string, checker: Checker = 'exact',
  ctx?: { input: string; validator?: string },
): TestResult['firstDiff'] | null {
  if (checker === 'custom') {
    // Several answers are correct: a validator checks the output against the input instead.
    const v = ctx?.validator ? validators[ctx.validator] : undefined;
    return v ? v(ctx!.input, got) : { line: -1, expected: 'ตัวตรวจของข้อนี้', got: 'ไม่พบตัวตรวจ' };
  }
  let a = normalize(expected), b = normalize(got);
  if (checker === 'float') {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i] === undefined || b[i] === undefined || !sameLineFloat(a[i], b[i])) {
        return { line: i + 1, expected: a[i] ?? '(ไม่มีบรรทัดนี้)', got: b[i] ?? '(ไม่มีบรรทัดนี้)' };
      }
    }
    return null;
  }
  if (checker === 'lines-any-order') {
    // Order doesn't matter: compare as sorted multisets of lines.
    a = [...a].sort(); b = [...b].sort();
    if (a.length !== b.length) {
      return { line: Math.min(a.length, b.length) + 1, expected: `${a.length} บรรทัด`, got: `${b.length} บรรทัด` };
    }
    const i = a.findIndex((x, k) => x !== b[k]);
    if (i === -1) return null;
    const missing = a.find((x) => !b.includes(x));
    return { line: 0, expected: missing ?? a[i], got: missing ? '(ไม่มีบรรทัดนี้ในผลของคุณ)' : b[i] };
  }
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return { line: i + 1, expected: a[i] ?? '(ไม่มีบรรทัดนี้)', got: b[i] ?? '(ไม่มีบรรทัดนี้)' };
  }
  return null;
}

/** Turn raw WebAssembly trap messages into something a student can act on. */
export function explainError(raw: string): string {
  const m = raw.match(/exited with code (\d+)/);
  if (m) return `โปรแกรมจบด้วย exit code ${m[1]} (ไม่ใช่ 0) — เช่น return ค่าอื่นจาก main หรือเรียก exit/abort`;
  if (/unreachable|abort/i.test(raw)) return 'โปรแกรมหยุดกลางคัน — มักเกิดจาก exception เช่น vector.at() เกินขอบเขต หรือ assert ไม่ผ่าน';
  if (/out of bounds/i.test(raw)) return 'เข้าถึงหน่วยความจำนอกขอบเขต — เช็ก index ของ array/vector';
  if (/call stack|stack overflow|too much recursion/i.test(raw)) return 'stack เต็ม — recursion ลึกเกินไปหรือไม่มีจุดหยุด';
  if (/divide by zero|integer divide/i.test(raw)) return 'หารด้วยศูนย์';
  if (/memory|grow/i.test(raw)) return 'ใช้หน่วยความจำเกิน';
  return raw;
}

class CppRunner {
  private compiler: WorkerHandle | null = null;
  private executor: WorkerHandle | null = null;
  private key = 0;

  /** Start loading clang (~tens of MB, cached by the browser after the first visit). */
  warmUp(): Promise<void> {
    if (!this.compiler) this.compiler = new WorkerHandle('compile');
    return this.compiler.ready;
  }

  private execWorker(): WorkerHandle {
    if (!this.executor) this.executor = new WorkerHandle('exec');
    return this.executor;
  }

  async compile(code: string): Promise<CompileResult> {
    await this.warmUp();
    const r = await this.compiler!.call({ type: 'compile', code });
    return r.ok && r.wasm ? { ok: true, wasm: r.wasm, log: r.log ?? '' } : { ok: false, log: r.log ?? '' };
  }

  async runTests(
    wasm: ArrayBuffer,
    tests: TestCase[],
    onResult: (r: TestResult) => void,
    timeLimitMs = 2000,
    checker: Checker = 'exact',
    validator?: string,
  ): Promise<TestResult[]> {
    const key = ++this.key;
    const results: TestResult[] = [];
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      const w = this.execWorker();
      await w.ready;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<'TLE'>((res) => { timer = setTimeout(() => res('TLE'), timeLimitMs); });
      // Send a copy: the worker caches the compiled module by key.
      const run = w.call({ type: 'exec', key, wasm: wasm.slice(0), input: t.input });
      const r: WorkerReply | 'TLE' = await Promise.race([run, timeout])
        .catch((e) => ({ type: 'result', error: String(e), stdout: '', ms: 0 }));
      clearTimeout(timer);

      let result: TestResult;
      if (r === 'TLE') {
        w.kill();
        this.executor = null;
        result = { index: i, verdict: 'TLE', ms: timeLimitMs, stdout: '' };
      } else {
        const ms = r.ms ?? 0, stdout = r.stdout ?? '';
        if (r.error) {
          result = { index: i, verdict: 'RE', ms, stdout, error: explainError(r.error) };
        } else {
          const diff = compareOutput(t.output, stdout, checker, { input: t.input, validator });
          result = diff
            ? { index: i, verdict: 'WA', ms, stdout, firstDiff: diff }
            : { index: i, verdict: 'AC', ms, stdout };
        }
      }
      results.push(result);
      onResult(result);
    }
    return results;
  }
}

export const runner = new CppRunner();
