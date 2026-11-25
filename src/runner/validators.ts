// Output validators for problems that accept more than one correct answer.
// This file is imported both by the browser app and by scripts/build-tests.mjs
// (Node strips the types), so it must stay dependency-free and use erasable syntax only.

export type Violation = { line: number; expected: string; got: string };
export type Validator = (input: string, output: string) => Violation | null;

const tokens = (s: string) => s.split(/\s+/).filter(Boolean);
/** line = -1 tells the UI to show "what the rule requires" instead of a line diff */
const bad = (expected: string, got: string): Violation => ({ line: -1, expected, got });

/** K Connected City: K distinct cities (1..N) whose induced subgraph is connected. Any such set is accepted. */
const kConnectedCity: Validator = (input, output) => {
  const nums = tokens(input).map(Number);
  const [n, m, k] = nums;
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (let i = 0; i < m; i++) { const u = nums[3 + 2 * i], v = nums[4 + 2 * i]; adj[u].push(v); adj[v].push(u); }

  const out = tokens(output);
  if (out.length !== k) return bad(`ตัวเลข ${k} ตัว`, `${out.length} ตัว`);
  const set = new Set<number>();
  for (const t of out) {
    const x = Number(t);
    if (!Number.isInteger(x) || x < 1 || x > n) return bad(`หมายเลขเมืองระหว่าง 1 ถึง ${n}`, t);
    if (set.has(x)) return bad('เมืองที่ไม่ซ้ำกัน', `เมือง ${x} ซ้ำ`);
    set.add(x);
  }
  const start = set.values().next().value as number;
  const seen = new Set<number>([start]);
  const stack = [start];
  while (stack.length) {
    const v = stack.pop() as number;
    for (const u of adj[v]) if (set.has(u) && !seen.has(u)) { seen.add(u); stack.push(u); }
  }
  if (seen.size !== k) {
    const lost = [...set].find((x) => !seen.has(x));
    return bad('ทุกเมืองที่เลือกเดินถึงกันได้โดยไม่ผ่านเมืองอื่น', `เมือง ${lost} เดินไปหาเมือง ${start} ไม่ได้ถ้าผ่านเฉพาะเมืองที่เลือก`);
  }
  return null;
};

export const validators: Record<string, Validator> = {
  'k-connected-city': kConnectedCity,
};
