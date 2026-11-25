// Builds an offline practice folder for VS Code:
//   node scripts/make-practice.mjs [target dir] [workspace root]
// target default  D:/DataAlgo/algo        (one folder per problem, with starter .cpp, statement.pdf, tests/)
// workspace root  default = parent of target (where .vscode/ and .cedt-grader.json live)
// Existing solution files are never overwritten.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(process.argv[2] ?? 'D:/DataAlgo/algo');
const ws = resolve(process.argv[3] ?? dirname(target));
const read = (p) => readFileSync(join(root, p), 'utf8');

// ---------- data from the site's source files (regex: they are TypeScript) ----------
const catalog = [...read('src/data/catalog.ts').matchAll(/\{ code: '([^']+)', title: '([^']+)', graderId: (\d+), chapter: '([^']+)'/g)]
  .map((m) => ({ code: m[1], title: m[2], graderId: +m[3], chapter: m[4] }));

const limits = {};
const files = ['src/data/problems.ts', ...readdirSync(join(root, 'src/data/problem-sets')).map((f) => `src/data/problem-sets/${f}`)];
for (const f of files) {
  let cur = null;
  for (const line of read(f).split('\n')) {
    const c = line.match(/\bcode: '([^']+)'/);
    if (c) cur = c[1];
    const t = line.match(/timeLimitMs: (\d+)/);
    if (t && cur) { limits[cur] = +t[1]; cur = null; }
  }
}

const CHAPTERS = {
  'brute-force': '01-brute-force', sorting: '02-sorting', recursion: '03-recursion', 'divide-conquer': '04-divide-conquer',
  dp: '05-dp', greedy: '06-greedy', graph: '07-graph', 'shortest-path': '08-shortest-path', search: '09-search', exam: '10-exam-past-papers',
};
const CH_TITLE = {
  'brute-force': 'Brute Force', sorting: 'Sorting', recursion: 'Recursion & Analysis', 'divide-conquer': 'Divide & Conquer', dp: 'Dynamic Programming',
  greedy: 'Greedy', graph: 'Graph', 'shortest-path': 'Shortest Path & MST', search: 'State-space Search', exam: 'ข้อสอบปลายภาคเก่า ปี 66–68',
};

// ---------- tools + VS Code config ----------
mkdirSync(join(target, 'tools'), { recursive: true });
copyFileSync(join(root, 'scripts/judge.mjs'), join(target, 'tools/judge.mjs'));
copyFileSync(join(root, 'src/runner/validators.ts'), join(target, 'tools/validators.ts'));

const starter = (p, ch, rel) => `// ${p.title}  ·  ${p.code}  ·  grader #${p.graderId}
// ${CH_TITLE[ch]}  ·  โจทย์: statement.pdf  ·  https://cedt-grader.nattee.net
//
// ตรวจในเครื่อง: Terminal > Run Task > "Judge" (หรือ Ctrl+Shift+B)
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`;

let made = 0, kept = 0, noPdf = [];
const cedt = { version: 1, files: {} };
const index = {};

for (const p of catalog) {
  const dir = join(target, CHAPTERS[p.chapter], p.code);
  mkdirSync(join(dir, 'tests'), { recursive: true });

  // tests from the site's built JSON: samples (s*), grader (g*), generated (x*)
  const tf = JSON.parse(read(`public/tests/${p.code}.json`));
  const n = { sample: 0, grader: 0, generated: 0 };
  const pre = { sample: 's', grader: 'g', generated: 'x' };
  for (const t of tf.tests) {
    const name = `${pre[t.source]}${++n[t.source]}`;
    writeFileSync(join(dir, 'tests', `${name}.in`), t.input.endsWith('\n') ? t.input : t.input + '\n');
    writeFileSync(join(dir, 'tests', `${name}.out`), t.output.endsWith('\n') ? t.output : t.output + '\n');
  }
  writeFileSync(join(dir, 'problem.json'), JSON.stringify({
    code: p.code, title: p.title, graderId: p.graderId, chapter: p.chapter,
    checker: tf.checker, validator: tf.validator, timeLimitMs: limits[p.code] ?? 2000,
    tests: { sample: n.sample, grader: n.grader, generated: n.generated, droppedHeavy: tf.dropped ?? 0 },
  }, null, 2) + '\n');

  const pdf = join(root, '_source/statements', `${p.code}.pdf`);
  if (existsSync(pdf)) copyFileSync(pdf, join(dir, 'statement.pdf')); else noPdf.push(p.code);

  const sol = join(dir, `${p.code}.cpp`);
  if (existsSync(sol)) kept++; else { writeFileSync(sol, starter(p, p.chapter)); made++; }

  cedt.files[relative(ws, sol).replace(/\\/g, '/')] = { problemId: p.graderId, name: p.code, baseUrl: 'https://cedt-grader.nattee.net' };
  (index[p.chapter] ??= []).push({ ...p, rel: relative(target, sol).replace(/\\/g, '/'), tests: tf.tests.length });
}

// ---------- merge .cedt-grader.json (keep existing entries) ----------
const cedtPath = join(ws, '.cedt-grader.json');
if (existsSync(cedtPath)) {
  try { const old = JSON.parse(readFileSync(cedtPath, 'utf8')); cedt.files = { ...old.files, ...cedt.files }; } catch { /* keep generated */ }
}
writeFileSync(cedtPath, JSON.stringify(cedt, null, 2) + '\n');

// ---------- .vscode ----------
mkdirSync(join(ws, '.vscode'), { recursive: true });
const gpp = 'C:\\msys64\\ucrt64\\bin\\g++.exe';
const tasksPath = join(ws, '.vscode/tasks.json');
let existing = [];
if (existsSync(tasksPath)) { try { existing = JSON.parse(readFileSync(tasksPath, 'utf8')).tasks ?? []; } catch { /* ignore */ } }
const rel = relative(ws, target).replace(/\\/g, '/');
const mine = [
  {
    label: 'Judge: ทุกชุดทดสอบ', type: 'shell', command: 'node',
    args: [`\${workspaceFolder}/${rel}/tools/judge.mjs`, '${fileDirname}'],
    group: { kind: 'build', isDefault: true }, presentation: { reveal: 'always', panel: 'shared', clear: true }, problemMatcher: ['$gcc'],
    detail: 'คอมไพล์ไฟล์ที่เปิดอยู่ แล้วรันกับทุกเทส (ตัวอย่าง + grader + ที่สร้างเพิ่ม)',
  },
  {
    label: 'Judge: เฉพาะตัวอย่าง', type: 'shell', command: 'node',
    args: [`\${workspaceFolder}/${rel}/tools/judge.mjs`, '${fileDirname}', '--samples'],
    group: 'build', presentation: { reveal: 'always', panel: 'shared', clear: true }, problemMatcher: ['$gcc'],
  },
  {
    label: 'Run: พิมพ์ input เอง (Ctrl+Z แล้ว Enter เพื่อจบ)', type: 'shell',
    command: `& "${gpp}" -std=c++17 -O2 -static "\${file}" -o "\${fileDirname}\\.build\\run.exe"; & "\${fileDirname}\\.build\\run.exe"`,
    options: { shell: { executable: 'powershell.exe', args: ['-NoProfile', '-Command'] } },
    group: 'build', presentation: { reveal: 'always', panel: 'dedicated', focus: true },
  },
];
const keep = existing.filter((t) => !mine.some((m) => m.label === t.label));
writeFileSync(tasksPath, JSON.stringify({ version: '2.0.0', tasks: [...mine, ...keep] }, null, 4) + '\n');

writeFileSync(join(ws, '.vscode/c_cpp_properties.json'), JSON.stringify({
  version: 4,
  configurations: [{ name: 'Win32 g++ (C++17)', compilerPath: gpp, cStandard: 'c17', cppStandard: 'c++17', intelliSenseMode: 'windows-gcc-x64', includePath: ['${workspaceFolder}/**'] }],
}, null, 4) + '\n');

// ---------- README ----------
let md = `# Algo practice

เตรียมไว้ให้ทำโจทย์ algorithm ของ grader ใน VS Code ตรวจในเครื่องได้ก่อนส่งจริง

## วิธีใช้

1. เปิดโฟลเดอร์ \`${ws}\` ใน VS Code
2. เลือกไฟล์ \`<ชื่อข้อ>.cpp\` ในโฟลเดอร์ของข้อนั้น (เปิด \`statement.pdf\` ข้าง ๆ เพื่ออ่านโจทย์)
3. เขียนโค้ด แล้วกด **Ctrl+Shift+B** = ตรวจกับทุกเทส หรือ Terminal > Run Task > "Judge: เฉพาะตัวอย่าง"
4. ผ่านครบแล้วส่งจริงด้วยส่วนขยาย cedt-grader-submit (ไฟล์ \`.cedt-grader.json\` ผูกทุกข้อกับ problem id ไว้ให้แล้ว)

ผลตรวจ: \`AC\` ถูก · \`WA\` ผิด (บอกบรรทัดแรกที่ต่าง) · \`TLE\` เกินเวลา · \`RE\` โปรแกรมพัง

## ชุดทดสอบ

แต่ละข้อมี \`tests/\` = \`s*\` ตัวอย่างในโจทย์ · \`g*\` เทสจาก grader · \`x*\` เทสที่สร้างเพิ่มด้วยโปรแกรมอ้างอิง (ผ่านการเทียบกับ brute force)
เป็นตัวช่วยตรวจเบื้องต้นเท่านั้น ผลบน grader จริงยังเป็นตัวตัดสิน

## รายการโจทย์

`;
for (const [ch, items] of Object.entries(index)) {
  md += `### ${CHAPTERS[ch].slice(0, 2)} ${CH_TITLE[ch]}\n\n| โจทย์ | grader | เทส |\n|---|---|---|\n`;
  for (const p of items) md += `| [${p.title}](${CHAPTERS[ch]}/${p.code}/${p.code}.cpp) | #${p.graderId} | ${p.tests} |\n`;
  md += '\n';
}
writeFileSync(join(target, 'README.md'), md);

console.log(`เสร็จ: ${catalog.length} ข้อ → ${target}`);
console.log(`  สร้างไฟล์เริ่มต้น ${made} ข้อ, มีอยู่แล้ว (ไม่แตะ) ${kept} ข้อ`);
if (noPdf.length) console.log(`  ไม่มี statement.pdf: ${noPdf.join(', ')}`);
