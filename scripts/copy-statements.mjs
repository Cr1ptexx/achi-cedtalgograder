// Copies the original statement PDFs (kept out of git in _source/) into public/statements/
// so the problem page can show the real statement next to the editor.
//   node scripts/copy-statements.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';

const catalog = readFileSync('src/data/catalog.ts', 'utf8');
const codes = [...catalog.matchAll(/code: '([^']+)'/g)].map((m) => m[1]);
mkdirSync('public/statements', { recursive: true });
let n = 0;
const missing = [];
for (const code of codes) {
  const from = `_source/statements/${code}.pdf`;
  if (existsSync(from)) { copyFileSync(from, `public/statements/${code}.pdf`); n++; } else missing.push(code);
}
console.log(`copied ${n} / ${codes.length} statements`);
if (missing.length) console.log(`missing: ${missing.join(', ')}`);
