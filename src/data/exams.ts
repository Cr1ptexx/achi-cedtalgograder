import { catalog } from './catalog';
import { chapters } from './chapters';
import { byEase, ratingOf } from './ratings';
import type { CatalogEntry, Chapter } from './types';
import { getFlag, getStatus } from '../store/progress';
import { BIGO_DRILLS } from './bigo-drills';

export type ExamId = 'grader' | 'paper';

export const EXAMS: { id: ExamId; date: string; title: string; kind: string }[] = [
  { id: 'grader', date: '2026-12-04', title: 'สอบ grader', kind: 'เขียนโค้ด C++' },
  { id: 'paper', date: '2026-12-08', title: 'สอบกระดาษ', kind: 'ทฤษฎี และคำนวณ Big-O' },
];

const THAI_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function localDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Calendar days from today to the exam day: 0 = today, negative = already past. */
export function daysUntil(iso: string): number {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((localDate(iso).getTime() - today.getTime()) / 86400000);
}

export function dateLabel(iso: string): string {
  const d = localDate(iso);
  return `${d.getDate()} ${THAI_MONTH[d.getMonth()]} ${d.getFullYear()}`;
}

// ---------- exam 1: grader ----------
export type GraderStage = { chapter: Chapter | null; slug: string; num: string; title: string; thaiTitle: string; items: CatalogEntry[] };

const stars = (p: CatalogEntry) => ratingOf(p.code)?.stars ?? 0;

export const PICKS_PER_CHAPTER = 3;

/** Per chapter: the most worth-doing problems (most stars, then the ones more friends practised), shown easiest first. */
function picks(items: CatalogEntry[]): CatalogEntry[] {
  const people = (p: CatalogEntry) => ratingOf(p.code)?.people ?? 0;
  return [...items]
    .sort((a, b) => stars(b) - stars(a) || people(b) - people(a))
    .slice(0, PICKS_PER_CHAPTER)
    .sort(byEase);
}

export function graderStages(): GraderStage[] {
  const stages: GraderStage[] = chapters
    .map((c) => ({ chapter: c, slug: c.slug, num: c.num, title: c.title, thaiTitle: c.thaiTitle, items: picks(catalog.filter((p) => p.chapter === c.slug)) }))
    .filter((s) => s.items.length > 0);
  const past = catalog.filter((p) => p.chapter === 'exam').sort(byEase);
  stages.push({ chapter: null, slug: 'exam', num: '★', title: 'ซ้อมข้อสอบปลายภาคเก่า', thaiTitle: 'ปี 66–68 จับเวลาเอง', items: past });
  return stages;
}

// ---------- exam 2: paper ----------
export const reviewKey = (slug: string) => `rev:${slug}`;
export const drillKey = (id: string) => `drill:${id}`;

export function examProgress(id: ExamId): { done: number; total: number } {
  if (id === 'grader') {
    const items = graderStages().flatMap((s) => s.items);
    return { done: items.filter((p) => getStatus(p.code) === 'solved').length, total: items.length };
  }
  const done = chapters.filter((c) => getFlag(reviewKey(c.slug))).length + BIGO_DRILLS.filter((d) => getFlag(drillKey(d.id))).length;
  return { done, total: chapters.length + BIGO_DRILLS.length };
}
