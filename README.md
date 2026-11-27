<div align="center">

# Algo Lab

**Learn algorithms by stepping through them, then prove it with code that is compiled and judged right in your browser.**

[**Open the live site →**](https://cr1ptexx.github.io/achi-cedtalgograder/)

![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![WebAssembly](https://img.shields.io/badge/C%2B%2B%20judge-WebAssembly-654ff0?logo=webassembly&logoColor=white)
![No backend](https://img.shields.io/badge/backend-none-2ea44f)

</div>

Algo Lab is a study site for a university algorithms course (Data Structures and Algorithms, CEDT, Chulalongkorn University).
Every chapter goes **concept → interactive visualizer → quiz → graded problems**, and every problem can be written and
judged in the browser against the course grader's own test cases, with no server behind it.

> For educational use. Problem statements and grader test data belong to the course.

---

## Highlights

| | |
|---|---|
| **10 chapters** | Brute Force → Sorting → Recursion → Divide & Conquer → DP → Greedy → Graph → Shortest Path & MST → State-space Search → NP-Complete |
| **Step-through visualizers** | permutations with pruning, five sorting algorithms, Master Theorem, binary search and fast power, DP tables (LCS, knapsack), interval scheduling, BFS / DFS / Kruskal, Dijkstra / Floyd–Warshall, N-Queens backtracking, growth rates |
| **71 judged problems** | the original statement PDF next to the editor, plus a short summary and three levels of hints that open only when you ask |
| **1,097 test cases** | 276 taken from the course grader, 202 from statement samples, 619 generated and cross-checked |
| **Real verdicts** | AC / WA / TLE / RE per test, the first differing line, a best-score column and private "redo" notes |
| **Difficulty from the problem** | every problem rated easy / medium / hard by what it actually asks for (technique, key insight, traps), with a one-line reason |
| **Course schedule page** | the assigned problems by date (in-class, homework, exam practice), with progress and a "next problem" button |
| **Extra practice** | 52 hand-picked LeetCode problems, one zone per chapter (links only) |

Progress, saved code, scores and notes stay in the browser (localStorage). Nothing is sent anywhere.

## How it works: a static site that behaves like it has a backend

The site had to stay a plain static site on GitHub Pages, with no server to run or pay for, yet let people write C++ and
have it judged like the real grader. So the judge runs inside the visitor's browser.

```
┌──────────────────────── browser tab ────────────────────────┐
│  React UI ──► CppRunner                                      │
│                 │ compile(code)                              │
│                 ▼                                            │
│   ┌─ compile worker (kept alive) ─┐                          │
│   │ clang + lld as WebAssembly    │                          │
│   │ C++17 source → user.wasm      │                          │
│   └───────────────┬───────────────┘                          │
│                   ▼ run each test                            │
│   ┌─ exec worker (disposable) ────┐   timeout → terminate()  │
│   │ WASI shim: stdin → stdout     │   and respawn  = TLE     │
│   └───────────────────────────────┘                          │
│  compare output (exact / any order / float / custom checker) │
└──────────────────────────────────────────────────────────────┘
        ▲ static files only: HTML, JS, tests/*.json, statements/*.pdf
        └── GitHub Pages
```

- **Compiler in the page.** clang and lld compiled to WebAssembly ([binji/wasm-clang](https://github.com/binji/wasm-clang)),
  loaded on first use and then cached by the browser. No browser extension, no remote judge.
- **Two workers.** The compile worker keeps the heavy compiler warm; each program runs in a small separate worker.
  An infinite loop is handled by killing that worker, which gives a true TLE without reloading the compiler.
- **Toolchain fixes.** The runner links compiler-rt (so `std::sort`, `long double` and `__int128` work), supplies a real
  clock for `time()` / `chrono`, accepts `__gcd`, and provides `<bits/stdc++.h>`, which libc++ does not ship.
- **Grader-style checking.** Trailing spaces and blank lines are ignored; problems that accept several answers use a
  validator instead of a fixed expected output.
- **Content is data.** Chapters, problems, hints, difficulty and the schedule live in `src/data/`; adding a problem does not touch the UI.

## Test data you can trust

Each problem's test file (`public/tests/<code>.json`) is built by `scripts/build-tests.mjs` from three sources:

1. **samples** from the statement,
2. **grader tests**: every test the grader's test-case page shows in full,
3. **generated tests** from a seeded generator, answered by a reference solution.

The build **fails** if a reference solution disagrees with any sample or grader test, and every reference solution is also
compared with a brute-force solution on 300 random small inputs. Tests too heavy for the in-browser runner are dropped and the
problem page says how many.

## How this project was built

I built Algo Lab to study for my algorithms course. I defined what it should do, decided the scope and the data it uses,
tested it against my own coursework and reported the bugs I found. The implementation was done with AI assistance
(Claude Code): I directed the work and reviewed the results instead of writing every line myself.

**My part:** the product idea and requirements; the static-site-with-in-browser-judge design constraint described above;
the study flow (lesson → visualizer → quiz → graded problem); feature decisions (test-case score, redo marks and notes,
the course schedule page, difficulty judged from the problem itself rather than only from submission counts); using the
course grader's own test cases; manual testing and bug reports; publishing; and the code in [`my-solutions/`](my-solutions/),
which is my own.

**AI-assisted:** the React/TypeScript app, the in-browser C++ runner, the scripts that build and cross-check the test sets,
the visualizers, and first drafts of the lesson and problem text, which I reviewed.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5199
npm run build      # static files in dist/
npm run tests      # rebuild test sets (needs the private reference solutions in _source/, not in git)
```

## Practice offline in VS Code

`node scripts/make-practice.mjs [target] [workspace]` creates a folder per problem with a starter `.cpp`, the statement PDF
and all test cases, plus a local judge (`Ctrl+Shift+B` compiles with g++ and runs every test) and the mapping used by the
cedt-grader-submit extension. Existing solution files are never overwritten. `node scripts/sync-solutions.mjs` then copies
only the solutions that pass every local test into `my-solutions/`.

## Project structure

```
public/runner/worker.js     compile / exec worker (WebAssembly clang + lld)
public/tests/               test sets, one JSON file per problem
public/statements/          original statement PDFs
src/runner/                 runner client, verdicts, output checkers, validators
src/data/                   chapters, problems, difficulty analysis, schedule, LeetCode list
src/components/             visualizers, stepper, quiz, score and redo marks
src/pages/                  home, chapter, problem, all problems, schedule, exam path
scripts/                    test builder, practice-folder generator, local judge, solution sync
my-solutions/               my own solutions
```

## Credits

- Problems, statements and grader test data: the course grader (cedt-grader.nattee.net).
- Lesson content summarises the course slides in my own words.
- In-browser compiler: [binji/wasm-clang](https://github.com/binji/wasm-clang) (Apache-2.0).
- Extra practice links: LeetCode (links only, no statements copied).
