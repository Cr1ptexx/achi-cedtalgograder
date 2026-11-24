import type { TestCase } from '../runner/cppRunner';

export type ChapterSlug =
  | 'brute-force' | 'sorting' | 'recursion' | 'divide-conquer' | 'dp'
  | 'greedy' | 'graph' | 'shortest-path' | 'search' | 'np' | 'exam';

/** Every algorithm problem on the course grader, built or not. */
export type CatalogEntry = {
  code: string;
  title: string;
  graderId: number;
  chapter: ChapterSlug;
  /** true when this site has the problem page (statement summary + tests). */
  built?: boolean;
};

export type Statement = {
  /** Short paraphrase of the task, in our own words. */
  task: string;
  input: string;
  output: string;
  constraints?: string;
  samples: TestCase[];
};

export type Problem = {
  code: string;
  title: string;
  graderId: number;
  chapter: ChapterSlug;
  statement: Statement | null; // null until summarized from the grader PDF
  /** Tiered hints, shown one at a time, only when the user asks. */
  hints: string[];
  starter: string;
  timeLimitMs: number;
};

export type { Checker } from '../runner/cppRunner';
import type { Checker } from '../runner/cppRunner';

/** Shape of public/tests/<code>.json */
export type TestFile = {
  checker: Checker;
  tests: (TestCase & { source: 'sample' | 'grader' | 'generated' })[];
};

export type QuizItem = { q: string; choices: string[]; answer: number; why: string };

export type ConceptCard = { title: string; body: string; code?: string };

export type Chapter = {
  slug: ChapterSlug;
  num: string;
  title: string;
  thaiTitle: string;
  blurb: string;
  ready: boolean;
  concepts: ConceptCard[];
  visualizer?: 'permutation' | 'sorting';
  quiz: QuizItem[];
  complexity: { name: string; time: string; note: string }[];
  pitfalls: string[];
};
