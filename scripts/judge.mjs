// Local judge for the practice folders made by make-practice.mjs.
//   node judge.mjs <problem folder> [--samples] [--only 3] [--noopt]
// Compiles <folder>/<code>.cpp with g++, runs every test in <folder>/tests and prints AC / WA / TLE / RE.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const pos = [];
for (let i = 0; i < args.length; i++) { if (args[i] === '--only') { i++; continue; } if (!args[i].startsWith('--')) pos.push(args[i]); }
const dir = resolve(pos[0] ?? '.');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const meta = JSON.parse(readFileSync(join(dir, 'problem.json'), 'utf8'));
const src = join(dir, `${meta.code}.cpp`);
if (!existsSync(src)) { console.error(`ไม่พบ ${src}`); process.exit(2); }

const C = process.stdout.isTTY || process.env.FORCE_COLOR
  ? { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' }
  : { g: '', r: '', y: '', d: '', b: '', x: '' };

// ---------- compile ----------
const buildDir = join(dir, '.build');
mkdirSync(buildDir, { recursive: true });
const exe = join(buildDir, 'sol.exe');
const gpp = process.env.GPP || 'g++';
const cflags = ['-std=c++17', flag('--noopt') ? '-O0' : '-O2', '-static', '-Wall', '-Wno-sign-compare'];
console.log(`${C.d}$ ${gpp} ${cflags.join(' ')} ${basename(src)}${C.x}`);
const cc = spawnSync(gpp, [...cflags, src, '-o', exe], { encoding: 'utf8' });
if (cc.status !== 0) {
  console.log(`${C.r}${C.b}Compile Error${C.x}`);
  console.log(cc.stderr || cc.stdout);
  process.exit(1);
}
if (cc.stderr.trim()) console.log(`${C.y}${cc.stderr.trim()}${C.x}\n`);

// ---------- checkers ----------
const lines = (s) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).reduceRight((a, l) => (a.length === 0 && l === '' ? a : [l, ...a]), []);
const sameFloat = (a, b) => {
  const x = a.trim().split(/\s+/), y = b.trim().split(/\s+/);
  if (x.length !== y.length) return false;
  return x.every((t, i) => {
    const p = Number(t), q = Number(y[i]);
    if (Number.isNaN(p) || Number.isNaN(q)) return t === y[i];
    return Math.abs(p - q) <= Math.max(1e-4, 1e-7 * Math.abs(p));
  });
};
let validators = null;
async function check(test, got) {
  const checker = meta.checker;
  if (checker === 'custom') {
    validators ??= (await import(new URL('./validators.ts', import.meta.url).href)).validators;
    const v = validators[meta.validator]?.(test.input, got);
    return v ? `${v.expected} ← ได้ ${v.got}` : null;
  }
  const a = lines(test.output), b = lines(got);
  if (checker === 'lines-any-order') {
    const sa = [...a].sort(), sb = [...b].sort();
    if (sa.length !== sb.length) return `ต้องมี ${sa.length} บรรทัด ได้ ${sb.length} บรรทัด`;
    const i = sa.findIndex((l, k) => l !== sb[k]);
    return i === -1 ? null : `บรรทัดที่ควรมี "${sa[i]}" ไม่ตรงกับ "${sb[i]}"`;
  }
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const same = checker === 'float' ? sameFloat(a[i] ?? '', b[i] ?? '') : a[i] === b[i];
    if (!same) return `บรรทัด ${i + 1}: ต้องได้ "${short(a[i] ?? '(ไม่มี)')}" แต่ได้ "${short(b[i] ?? '(ไม่มี)')}"`;
  }
  return null;
}
const short = (s) => (s.length > 70 ? s.slice(0, 70) + '…' : s);

// ---------- run ----------
const testDir = join(dir, 'tests');
let names = readdirSync(testDir).filter((f) => f.endsWith('.in')).map((f) => f.slice(0, -3));
names.sort((p, q) => rank(p) - rank(q) || p.localeCompare(q, undefined, { numeric: true }));
function rank(n) { return n.startsWith('s') ? 0 : n.startsWith('g') ? 1 : 2; }
if (flag('--samples')) names = names.filter((n) => n.startsWith('s'));
if (only) names = names.filter((n) => n === only);

const limit = meta.timeLimitMs ?? 2000;
console.log(`${C.b}${meta.title}${C.x} ${C.d}(${meta.code}) · checker ${meta.checker} · limit ${limit / 1000}s · ${names.length} tests${C.x}\n`);

let ac = 0, firstBad = null;
for (const name of names) {
  const test = { input: readFileSync(join(testDir, `${name}.in`), 'utf8'), output: readFileSync(join(testDir, `${name}.out`), 'utf8') };
  const t0 = process.hrtime.bigint();
  const r = spawnSync(exe, [], { input: test.input, encoding: 'utf8', timeout: limit * 2, maxBuffer: 256 * 1024 * 1024 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let verdict, note = '';
  if (r.error && r.error.code === 'ETIMEDOUT') { verdict = 'TLE'; }
  else if (r.status !== 0) { verdict = 'RE'; note = r.signal ? `signal ${r.signal}` : `exit code ${r.status}`; }
  else if (ms > limit) { verdict = 'TLE'; }
  else { note = (await check(test, r.stdout)) ?? ''; verdict = note ? 'WA' : 'AC'; }
  if (verdict === 'AC') ac++; else firstBad ??= { name, verdict, note, test, got: r.stdout };
  const col = verdict === 'AC' ? C.g : verdict === 'TLE' ? C.y : C.r;
  const sz = test.input.length > 2048 ? `${(test.input.length / 1024).toFixed(0)}KB` : '';
  console.log(`  ${col}${verdict.padEnd(3)}${C.x} ${name.padEnd(5)} ${C.d}${ms.toFixed(0).padStart(5)} ms ${sz}${C.x} ${note}`);
}

console.log(`\n${ac === names.length ? C.g : C.r}${C.b}${ac}/${names.length} ผ่าน${C.x}`);
if (firstBad && firstBad.test.input.length < 400) {
  console.log(`\n${C.d}--- ชุด ${firstBad.name}: input ---${C.x}\n${firstBad.test.input.trimEnd()}\n${C.d}--- ที่ถูก ---${C.x}\n${firstBad.test.output.trimEnd()}\n${C.d}--- ที่โปรแกรมคุณพิมพ์ ---${C.x}\n${firstBad.got.trimEnd()}`);
}
process.exit(ac === names.length ? 0 : 1);
