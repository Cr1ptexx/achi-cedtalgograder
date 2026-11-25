// Splits a bundle exported from the grader's pages into:
//   _source/statements/<code>.pdf          (git-ignored)
//   tests-src/<code>.grader.json           [{ input, output }]  only tests shown in full
//   tests-src/<code>.meta.json             how many tests the grader has / how many were cut at 2 KB
//
//   node scripts/import-grader-bundle.mjs "C:/Users/<you>/Downloads/grader-bundle.json"
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const bundlePath = process.argv[2];
if (!bundlePath) { console.error('usage: node scripts/import-grader-bundle.mjs <bundle.json>'); process.exit(1); }

const catalog = readFileSync('src/data/catalog.ts', 'utf8');
const idToCode = new Map([...catalog.matchAll(/code: '([^']+)'[^}]*?graderId: (\d+)/g)].map((m) => [+m[2], m[1]]));

mkdirSync('_source/statements', { recursive: true });
mkdirSync('tests-src', { recursive: true });

const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
for (const r of bundle) {
  const code = idToCode.get(r.id);
  if (!code) { console.warn(`id ${r.id}: not in catalog, skipped`); continue; }
  if (r.pdf) writeFileSync(`_source/statements/${code}.pdf`, Buffer.from(r.pdf, 'base64'));
  const full = r.tests.filter((t) => !t.ti && !t.to).map((t) => ({ input: t.i, output: t.o }));
  writeFileSync(`tests-src/${code}.grader.json`, JSON.stringify(full));
  writeFileSync(`tests-src/${code}.meta.json`, JSON.stringify({
    graderId: r.id,
    total: r.tests.length,
    full: full.length,
    cut: r.tests.filter((t) => t.ti || t.to).map((t) => ({ input: t.si, output: t.so })),
  }));
  console.log(`${code.padEnd(30)} grader ${String(r.tests.length).padStart(2)} tests, ${String(full.length).padStart(2)} complete${r.pdf ? '' : '  (NO PDF)'}`);
}
