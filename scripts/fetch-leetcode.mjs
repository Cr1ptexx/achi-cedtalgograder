// Builds src/data/leetcode.ts: one practice list per chapter.
// For every entry the problem id, title, difficulty and "premium only" flag are read from
// LeetCode's public metadata endpoint (so links are checked, never guessed). We store links and our own
// notes only — no LeetCode statements are copied.
//   node scripts/fetch-leetcode.mjs
import { writeFileSync } from 'node:fs';

// chapter -> [slug, technique (Thai), similar grader problem code, why it is similar]
const PLAN = {
  'brute-force': [
    ['subsets', 'ตัดสินใจหยิบ/ไม่หยิบทีละชิ้น (combination)', 'ex00e4', 'เลือกว่าแต่ละช่องเป็น 0 หรือ 1 เหมือนกัน'],
    ['permutations', 'เรียงสับเปลี่ยนด้วย used[]', 'a64_q1_permu_before', 'โครงสร้าง recursion + used[] เดียวกัน'],
    ['combinations', 'เลือกพอดี k จาก n', 'ex00e4', 'เลือกพอดี k ตัวเหมือน Gen Barcode'],
    ['letter-combinations-of-a-phone-number', 'ลองทุกตัวอักษรในแต่ละตำแหน่ง', 'da67_f_abc_permutation', 'สร้างสตริงทีละตำแหน่ง ลำดับพจนานุกรม'],
    ['generate-parentheses', 'สร้างทีละตัวพร้อมตัดกิ่งที่ผิดทันที', 'da68_f_abcd_permutation', 'ตัดกิ่งเมื่อเกินโควตาของตัวอักษร'],
  ],
  sorting: [
    ['sort-colors', 'นับ/แบ่งโซนสามค่า', 'ex04m1_sort', 'อาร์เรย์สามค่าเหมือน 3 Values Sort'],
    ['merge-intervals', 'เรียงตามจุดเริ่มต้นแล้วกวาด', 'a65_q2a_huge_array', 'เรียงช่วงแล้วทำงานเป็นช่วง ๆ'],
    ['largest-number', 'เขียน comparator เอง', 'ex04m1_sort', 'โจทย์ที่แก่นคือเกณฑ์การเรียง'],
    ['kth-largest-element-in-an-array', 'เรียงหรือ partition หา k-th', 'a65_q2a_huge_array', 'หาตัวที่ P ในอาร์เรย์ที่เรียงแล้ว'],
    ['count-of-smaller-numbers-after-self', 'นับคู่ผกผันด้วย merge sort / BIT', 'a66_q2a_insertion_count', 'นับจำนวนตัวที่น้อยกว่าทางขวาเหมือนกัน'],
  ],
  recursion: [
    ['fibonacci-number', 'recurrence พื้นฐาน', 'ex00e5', 'recursion + base case'],
    ['power-of-two', 'เงื่อนไขหยุดและลดขนาดลงครึ่ง', 'ex00e5', 'ลดขนาดปัญหาทีละครึ่ง'],
    ['maximum-depth-of-binary-tree', 'recursion บนต้นไม้', 'a64_q4_path_sum', 'เดินต้นไม้ด้วย recursion'],
    ['path-sum', 'ส่งค่าที่เหลือลงไปตาม recursion', 'a64_q4_path_sum', 'เส้นทางบนต้นไม้เทียบผลรวม'],
    ['k-th-symbol-in-grammar', 'หาโครงสร้างซ้ำของ recursion tree', 'ex00e5', 'สังเกตรูปแบบจากต้นไม้การเรียก'],
  ],
  'divide-conquer': [
    ['binary-search', 'binary search พื้นฐาน', 'ex01e3', 'ค้นหาในอาร์เรย์ที่เรียงแล้ว'],
    ['search-insert-position', 'binary search หาตำแหน่งแทรก (lower bound)', 'ex02e3_bs', 'ตำแหน่งที่ควรแทรก = lower_bound'],
    ['sqrtx', 'binary search บน "คำตอบ"', 'ex02e3_bs', 'ค้นหาค่าที่ทำให้เงื่อนไขเริ่มเป็นจริง'],
    ['powx-n', 'fast power', 'a60_q1_matmod', 'ยกกำลังด้วยการลดเลขชี้กำลังครึ่งหนึ่ง'],
    ['find-first-and-last-position-of-element-in-sorted-array', 'binary search หาขอบซ้าย/ขวา', 'ex01e3', 'ตำแหน่งแรกที่พบ เหมือน Binary Search 2'],
    ['search-in-rotated-sorted-array', 'binary search แบบเงื่อนไขซับซ้อนขึ้น', 'ex02e3_bs', 'ตัดครึ่งโดยดูว่าครึ่งไหนยังเรียงอยู่'],
  ],
  dp: [
    ['climbing-stairs', 'recurrence แบบ Fibonacci', 'ex02e1_fibo', 'f(n) = f(n−1) + f(n−2)'],
    ['house-robber', 'เลือกหรือข้ามทีละตัว ห้ามติดกัน', 'a64_q2_table_no_11', 'นับ/เลือกโดยห้ามรูปแบบติดกัน'],
    ['minimum-path-sum', 'DP บนตาราง', 'ex02m1_triangle', 'เดินลงตารางสะสมค่ามากสุด/น้อยสุด'],
    ['longest-common-subsequence', 'DP สองสตริง', 'ex03e1_lcs', 'โจทย์เดียวกัน'],
    ['partition-equal-subset-sum', 'subset sum 0/1', 'da68_f2_zero_one_subset_sum', 'เลือกชุดย่อยให้ผลรวมเท่าเป้า'],
    ['longest-palindromic-subsequence', 'DP ช่วง / LCS กับสตริงกลับด้าน', 'da68_f_hidden_palindrome', 'พาลินโดรมแบบไม่ติดกัน'],
    ['coin-change', 'knapsack แบบหยิบซ้ำได้', 'da68_f2_sackknap', 'เลือกของให้ได้ค่าเป้าหมาย'],
  ],
  greedy: [
    ['assign-cookies', 'เรียงสองฝั่งแล้วจับคู่', 'a60b_mid_p1_buffet', 'จับคู่ของกับความต้องการโดยเรียงก่อน'],
    ['maximum-units-on-a-truck', 'เรียงตามมูลค่าต่อหน่วย', 'ex04e2_fknapsack', 'เหมือน fractional knapsack'],
    ['best-time-to-buy-and-sell-stock-ii', 'เก็บทุกส่วนต่างที่เป็นบวก', 'ex04e2_fknapsack', 'ตัดสินใจเฉพาะหน้าที่ดีสุดทีละขั้น'],
    ['jump-game', 'ติดตามระยะไกลสุดที่ไปถึง', 'a58_m_p4', 'กวาดครั้งเดียวด้วยกฎ greedy'],
    ['non-overlapping-intervals', 'เรียงตามเวลาจบ เลือกให้มากสุด', 'ex04e1_interval', 'Interval Selection ตรง ๆ'],
    ['minimum-number-of-arrows-to-burst-balloons', 'เรียงตามเวลาจบ จัดกลุ่มช่วงที่ทับกัน', 'a58_m_p4', 'เรียงตามปลายช่วงแล้วกวาด'],
  ],
  graph: [
    ['find-center-of-star-graph', 'ดู degree ของปม', 'a65_q0_degrees', 'ใช้ degree ตอบ'],
    ['find-if-path-exists-in-graph', 'BFS/DFS เช็กการเข้าถึง', 'ex05m2_connection', 'สองปมเชื่อมถึงกันไหม'],
    ['number-of-provinces', 'นับส่วนประกอบเชื่อมต่อ', 'a60a_q3_component', 'นับกลุ่มของกราฟ'],
    ['number-of-islands', 'flood fill บนตาราง', 'a60a_q3_component', 'ส่วนประกอบเชื่อมต่อบน grid'],
    ['course-schedule', 'ตรวจวงรอบในกราฟมีทิศทาง', 'ex05m1_cycle', 'Detecting Cycle'],
    ['is-graph-bipartite', 'BFS/DFS ระบายสองสี', 'ex07e3_coloring', 'ระบายสีกราฟให้ปมติดกันต่างสี'],
  ],
  'shortest-path': [
    ['network-delay-time', 'Dijkstra จากต้นทางเดียว', 'a64_q3_shortest_start', 'ระยะสั้นสุดจากจุดเริ่ม'],
    ['shortest-path-in-binary-matrix', 'BFS บนตาราง', 'a61_q2_farthest', 'ระยะในกราฟไม่มีน้ำหนัก'],
    ['path-with-minimum-effort', 'Dijkstra ที่น้ำหนักเป็น max ของเส้นทาง', 'a65_q3a_expressway', 'ปรับสูตร relax ให้เข้ากับเป้าหมาย'],
    ['cheapest-flights-within-k-stops', 'Bellman–Ford จำกัดจำนวนเส้น', 'ex06e2_shortest', 'relax ทีละรอบแบบ Bellman–Ford'],
    ['min-cost-to-connect-all-points', 'MST (Kruskal / Prim)', 'ex06e1_cable', 'ต่อทุกจุดด้วยต้นทุนรวมน้อยสุด'],
    ['find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance', 'Floyd–Warshall ทุกคู่ปม', 'ex06m2_exchange', 'ต้องรู้ระยะระหว่างทุกคู่ปม'],
  ],
  search: [
    ['n-queens-ii', 'backtracking นับคำตอบ', 'ex07e1_nqueen', 'N Queen เหมือนกันเลย'],
    ['n-queens', 'backtracking สร้างกระดานจริง', 'ex07e1_nqueen', 'ต่อยอดจากการนับ'],
    ['combination-sum', 'backtracking เลือกใช้ซ้ำได้ ตัดกิ่งเมื่อเกินเป้า', 'ex07e2_iss', 'แจกแจงการแบ่งส่วนของผลรวม'],
    ['word-search', 'backtracking บนกริด คืนสถานะตอนถอย', 'ex07e1_nqueen', 'ตัดกิ่ง + คืนสถานะ'],
    ['palindrome-partitioning', 'backtracking ตัดกิ่งด้วยเงื่อนไขของส่วนที่แบ่ง', 'ex07e2_iss', 'แบ่งสตริงเป็นส่วน ๆ'],
    ['sudoku-solver', 'backtracking + เลือกช่องที่เหลือตัวเลือกน้อยสุด', 'ex07e3_coloring', 'ข้อจำกัดแบบระบายสี'],
  ],
};

const Q = 'query q($s:String!){question(titleSlug:$s){questionFrontendId title difficulty isPaidOnly}}';
const out = {};
let bad = 0;
for (const [ch, list] of Object.entries(PLAN)) {
  out[ch] = [];
  for (const [slug, technique, grader, why] of list) {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({ query: Q, variables: { s: slug } }),
    });
    const q = (await res.json())?.data?.question;
    if (!q) { console.error('NOT FOUND', slug); bad++; continue; }
    if (q.isPaidOnly) { console.error('PREMIUM', slug); bad++; continue; }
    out[ch].push({ slug, id: +q.questionFrontendId, title: q.title, difficulty: q.difficulty, technique, grader, why });
    console.log(`${ch.padEnd(15)} ${String(q.questionFrontendId).padStart(4)} ${q.difficulty.padEnd(6)} ${q.title}`);
    await new Promise((r) => setTimeout(r, 150));
  }
}
if (bad) { console.error(`${bad} problem(s) failed — not writing`); process.exit(1); }

const ts = `// Generated by scripts/fetch-leetcode.mjs — do not edit by hand.
// Links and our own notes only. Problem ids, titles and difficulty come from LeetCode's public metadata.
export type LeetCodeItem = {
  slug: string;
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  /** technique in our own words */
  technique: string;
  /** code of a similar problem on this site */
  grader: string;
  /** why they are similar */
  why: string;
};

export const leetcodeByChapter: Record<string, LeetCodeItem[]> = ${JSON.stringify(out, null, 2)};
`;
writeFileSync(new URL('../src/data/leetcode.ts', import.meta.url), ts);
console.log('wrote src/data/leetcode.ts');
