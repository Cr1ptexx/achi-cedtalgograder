// Builds public/tests/<code>.json for every problem.
//   1. grader tests (tests-src/<code>.grader.json) + statement samples
//   2. generated inputs, answered by a private reference solution
// Reference solutions live in _source/ref/<code>.cpp (git-ignored) and must
// reproduce every grader test before anything is written.
//
//   node scripts/build-tests.mjs
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'public/tests';
mkdirSync(OUT, { recursive: true });

// ---------- helpers ----------
function rng(seed) { // mulberry32
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const lines = (s) => {
  const l = s.replace(/\r\n?/g, '\n').split('\n').map((x) => x.trimEnd());
  while (l.length && l[l.length - 1] === '') l.pop();
  return l;
};
const same = (a, b, checker) => {
  let x = lines(a), y = lines(b);
  if (checker === 'lines-any-order') { x = [...x].sort(); y = [...y].sort(); }
  return x.length === y.length && x.every((v, i) => v === y[i]);
};

function ref(code) {
  const src = `_source/ref/${code}.cpp`, exe = `_source/ref/${code}.exe`;
  if (!existsSync(exe)) execFileSync('g++', ['-O2', '-std=c++17', '-o', exe, src], { stdio: 'inherit' });
  return (input) => {
    const r = spawnSync(exe, { input, maxBuffer: 1 << 28, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`${code}: ref exited ${r.status}`);
    return r.stdout;
  };
}

// ---------- problems ----------
const P = {
  ex00e4: {
    checker: 'lines-any-order',
    samples: [
      ['2 5', '00011\n00101\n01001\n10001\n00110\n01010\n10010\n01100\n10100\n11000\n'],
      ['1 3', '001\n100\n010\n'],
      ['2 4', '1100\n1010\n1001\n0101\n0110\n0011\n'],
      ['0 2', '00\n'],
    ],
    gen: () => ['1 1', '0 1', '3 12', '6 14', '1 20', '19 20'],
  },
  a64_q1_permu_before: {
    checker: 'exact',
    samples: [
      ['3 0\n', '0 1 2\n0 2 1\n1 0 2\n1 2 0\n2 0 1\n2 1 0\n'],
      ['3 1\n1 2\n', '0 1 2\n1 0 2\n1 2 0\n'],
      ['3 2\n1 2\n0 1\n', '0 1 2\n'],
      ['4 2\n3 2\n2 1\n', '0 3 2 1\n3 0 2 1\n3 2 0 1\n3 2 1 0\n'],
      ['4 2\n3 2\n0 1\n', '0 1 3 2\n0 3 1 2\n0 3 2 1\n3 0 1 2\n3 0 2 1\n3 2 0 1\n'],
    ],
    gen: () => {
      const out = ['1 0\n', '2 1\n1 0\n', '6 0\n'];
      const r = rng(42);
      // Random forests of "a before b" constraints (each b has one parent, no cycles).
      const forest = (n, m) => {
        const perm = [...Array(n).keys()].sort(() => r() - 0.5);
        const bs = perm.slice(1).sort(() => r() - 0.5).slice(0, m);
        const pairs = bs.map((b) => {
          const pos = perm.indexOf(b);
          return [perm[int(r, 0, pos - 1)], b];
        });
        return `${n} ${pairs.length}\n` + pairs.map((p) => p.join(' ')).join('\n') + '\n';
      };
      out.push(forest(8, 4), forest(9, 6), forest(10, 8));
      // Big n, almost a total order: only a few answers, but brute force without pruning times out.
      const chain = (n, m) => {
        const perm = [...Array(n).keys()].sort(() => r() - 0.5);
        const pairs = [];
        for (let i = 1; i < n && pairs.length < m; i++) pairs.push([perm[i - 1], perm[i]]);
        return `${n} ${pairs.length}\n` + pairs.map((p) => p.join(' ')).join('\n') + '\n';
      };
      out.push(chain(20, 19), chain(20, 17), chain(16, 13));
      return out;
    },
  },
  a65_q1_tower_defense: {
    checker: 'exact',
    samples: [
      ['10 1 2 1\n1\n10\n2 5\n', '9\n'],
      ['10 1 2 4\n1\n10\n2 5\n', '8\n'],
      ['100 3 3 1\n80 70 60\n1 1 1\n70 71 69\n', '2\n'],
    ],
    gen: () => {
      const r = rng(7);
      const out = [];
      const mk = (n, m, k, w, hmax) => {
        const p = Array.from({ length: m }, () => int(r, 1, n));
        const h = Array.from({ length: m }, () => int(r, 1, hmax));
        const t = [...Array(n).keys()].map((x) => x + 1).sort(() => r() - 0.5).slice(0, k);
        return `${n} ${m} ${k} ${w}\n${p.join(' ')}\n${h.join(' ')}\n${t.join(' ')}\n`;
      };
      out.push(mk(8, 8, 8, 0, 1));                 // w = 0: towers hit only their own cell
      out.push(mk(20, 8, 8, 20, 8));               // every tower reaches everything
      out.push(mk(1000000, 3, 3, 50, 1000));       // huge road, sparse
      out.push(mk(30, 8, 8, 3, 2));                // small h: shots get wasted
      out.push(mk(15, 1, 8, 15, 1000));            // one strong monster
      return out;
    },
  },
  ex04m1_sort: {
    checker: 'exact',
    samples: [
      ['7\n2 2 1 3 2 1 3\n', '3\n'],
      ['11\n1 1 1 2 2 2 3 3 3 3 3\n', '0\n'],
    ],
    gen: () => {
      const r = rng(2024);
      const arr = (n, f) => `${n}\n${Array.from({ length: n }, (_, i) => f(i)).join(' ')}\n`;
      const rand = () => int(r, 1, 3);
      return [
        arr(1, () => 2),
        arr(2, (i) => 2 - i),
        arr(9, (i) => 3 - Math.floor(i / 3)),           // fully reversed blocks
        arr(6, (i) => [2, 3, 1, 2, 3, 1][i]),            // pure 3-cycles
        arr(1000, rand),
        arr(100000, rand),
        arr(100000, () => 3),
        arr(100000, (i) => (i < 33333 ? 1 : i < 66666 ? 2 : 3)),          // already sorted → 0
        arr(100000, (i) => (r() < 0.02 ? rand() : i < 30000 ? 1 : i < 70000 ? 2 : 3)), // nearly sorted
      ];
    },
  },
};

// Min swaps by BFS, to double-check the 3 Values Sort formula on small arrays.
function sort3Brute(a) {
  const goal = [...a].sort().join('');
  const seen = new Set([a.join('')]);
  let frontier = [a.join('')];
  for (let d = 0; ; d++) {
    if (frontier.includes(goal)) return d;
    const next = [];
    for (const s of frontier) for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      if (s[i] === s[j]) continue;
      const t = s.split(''); [t[i], t[j]] = [t[j], t[i]];
      const k = t.join('');
      if (!seen.has(k)) { seen.add(k); next.push(k); }
    }
    frontier = next;
  }
}

// ---------- build ----------
let failed = false;
for (const [code, cfg] of Object.entries(P)) {
  const run = ref(code);
  const grader = JSON.parse(readFileSync(`tests-src/${code}.grader.json`, 'utf8'));
  const tests = [];
  const seen = new Set();
  const add = (input, output, source) => {
    const key = input.trim();
    if (seen.has(key)) return;
    seen.add(key);
    tests.push({ input, output, source });
  };

  for (const [input, expected] of cfg.samples) {
    if (!same(expected, run(input), cfg.checker)) { console.error(`✗ ${code}: ref disagrees with statement sample\n${input}`); failed = true; }
    add(input, expected, 'sample');
  }
  for (const t of grader) {
    if (!same(t.output, run(t.input), cfg.checker)) { console.error(`✗ ${code}: ref disagrees with grader test\n${t.input.slice(0, 80)}`); failed = true; }
    add(t.input, t.output, 'grader');
  }
  for (const input of cfg.gen()) add(input, run(input), 'generated');

  if (code === 'ex04m1_sort') {
    const r = rng(99);
    for (let it = 0; it < 300; it++) {
      const a = Array.from({ length: int(r, 1, 8) }, () => int(r, 1, 3));
      const input = `${a.length}\n${a.join(' ')}\n`;
      if (+run(input) !== sort3Brute(a)) { console.error(`✗ sort3 formula wrong on ${a}`); failed = true; break; }
    }
  }

  const json = JSON.stringify({ checker: cfg.checker, tests });
  writeFileSync(`${OUT}/${code}.json`, json);
  const by = (s) => tests.filter((t) => t.source === s).length;
  console.log(`✓ ${code}: ${tests.length} tests (sample ${by('sample')}, grader ${by('grader')}, generated ${by('generated')}) ${(json.length / 1024).toFixed(0)} KB`);
}
if (failed) { console.error('\nReference check FAILED'); process.exit(1); }
