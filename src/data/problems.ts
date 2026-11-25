import type { Problem } from './types';
import { STARTER } from './starter';
import { recursionProblems } from './problem-sets/recursion';
import { divideConquerProblems } from './problem-sets/divide-conquer';
import { dpProblems } from './problem-sets/dp';
import { greedyProblems } from './problem-sets/greedy';
import { graphProblems } from './problem-sets/graph';
import { shortestPathProblems } from './problem-sets/shortest-path';
import { searchProblems } from './problem-sets/search';
import { examProblems } from './problem-sets/exam';

// Statements are short paraphrases of the grader PDFs, written in our own words.
// Full test sets live in public/tests/<code>.json (built by scripts/build-tests.mjs).
// Chapters 1–2 are defined below; later chapters live in ./problem-sets/.
const earlyProblems: Problem[] = [
  {
    code: 'ex00e4',
    title: 'Gen Barcode',
    graderId: 1585,
    chapter: 'brute-force',
    statement: {
      task: 'บาร์โค้ดแทนด้วยสตริงของ 0 กับ 1 ให้พิมพ์บาร์โค้ดยาว B หลักที่มีเลข 1 พอดี A ตัว ให้ครบทุกแบบ แบบละบรรทัด จะพิมพ์ลำดับไหนก่อนก็ได้ ขอแค่ไม่ซ้ำและครบ C(B, A) บรรทัด',
      input: 'บรรทัดเดียว มีจำนวนเต็ม A และ B',
      output: 'C(B, A) บรรทัด แต่ละบรรทัดเป็นสตริงยาว B ที่มีเลข 1 พอดี A ตัว',
      constraints: '0 ≤ A ≤ B ≤ 20 · ตรวจแบบไม่สนลำดับบรรทัด',
      samples: [
        { input: '2 5', output: '00011\n00101\n01001\n10001\n00110\n01010\n10010\n01100\n10100\n11000\n' },
        { input: '1 3', output: '001\n100\n010\n' },
      ],
    },
    hints: [
      'มองเป็นช่องว่าง B ช่อง เติมทีละช่องจากซ้ายไปขวา แต่ละช่องเลือกได้แค่ 0 หรือ 1 → เขียน recursion ที่ลึก B ชั้น',
      'ส่ง "จำนวนเลข 1 ที่ใช้ไปแล้ว" ติดไปในพารามิเตอร์ด้วย ถ้าครบ A แล้วห้ามใส่ 1 เพิ่ม และถ้าช่องที่เหลือน้อยกว่าเลข 1 ที่ยังขาด ก็ตัดกิ่งนั้นทิ้งได้เลย',
      'gen(i, ones): ถ้า i == B → ถ้า ones == A ให้พิมพ์ s แล้ว return · ถ้า ones < A ลอง s[i] = \'1\' แล้ว gen(i+1, ones+1) · ลอง s[i] = \'0\' แล้ว gen(i+1, ones) — อย่าลืมใช้ "\\n" แทน endl',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
  {
    code: 'a64_q1_permu_before',
    title: 'Permutation with Constraint',
    graderId: 1490,
    chapter: 'brute-force',
    statement: {
      task: 'พิมพ์การเรียงสับเปลี่ยนของ 0 ถึง n−1 เรียงตามลำดับพจนานุกรม (แบบเดียวกับการเทียบ vector) แต่พิมพ์เฉพาะแบบที่ทำตามเงื่อนไขครบทั้ง m ข้อ แต่ละข้อบอกว่า "a ต้องอยู่ก่อน b" และรับประกันว่าค่า b ของแต่ละข้อไม่ซ้ำกัน',
      input: 'บรรทัดแรกมี n และ m จากนั้นอีก m บรรทัด บรรทัดละคู่ a b',
      output: 'บรรทัดละหนึ่งแบบ เป็นตัวเลข n ตัวคั่นด้วยช่องว่าง',
      constraints: 'n ≤ 20 · ชุดที่ n ใหญ่ ถ้าสร้างครบทุกแบบแล้วค่อยเช็กตอนท้ายจะเกินเวลา',
      samples: [
        { input: '3 1\n1 2\n', output: '0 1 2\n1 0 2\n1 2 0\n' },
        { input: '4 2\n3 2\n0 1\n', output: '0 1 3 2\n0 3 1 2\n0 3 2 1\n3 0 1 2\n3 0 2 1\n3 2 0 1\n' },
      ],
    },
    hints: [
      'เริ่มจาก permutation ธรรมดา: recursion + used[] โดยลองค่าจากน้อยไปมาก ผลลัพธ์จะออกมาเรียงตามพจนานุกรมเองโดยไม่ต้อง sort',
      'เพราะ b ไม่ซ้ำ เก็บเป็น need[b] = a ได้ ก่อนวาง x ลงช่องถัดไป ให้เช็กว่า need[x] ถูกวางไปแล้วหรือยัง ถ้ายัง แปลว่ากิ่งนี้ผิดแน่ ๆ ให้ข้ามทันที (อย่ารอจนเติมครบแล้วค่อยเช็ก)',
      'gen(step): ถ้า step == n → พิมพ์ · for x = 0..n−1: ถ้า used[x] ข้าม · ถ้า need[x] ≠ −1 และ !used[need[x]] ข้าม · used[x] = true, sol[step] = x, gen(step+1), used[x] = false — ข้อนี้ output เยอะ ใช้ fast IO และ "\\n"',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
  {
    code: 'a65_q1_tower_defense',
    title: 'Tower Defense',
    graderId: 1487,
    chapter: 'brute-force',
    statement: {
      task: 'ถนนยาว n ช่อง มี monster m ตัว ตัวที่ i อยู่ช่อง p[i] และมีพลัง h[i] และมีป้อม k ป้อมตั้งอยู่ที่ช่อง t[i] (ไม่ซ้ำกัน) ป้อมที่ช่อง x ยิงได้ 1 นัด ใส่ monster ตัวเดียวที่อยู่ในช่อง x−w ถึง x+w นัดละ 1 หน่วย และพลังไม่ติดลบ ให้หาว่าถ้าเลือกเป้าเก่งที่สุด พลังรวมของ monster ที่เหลือน้อยที่สุดเท่าไร',
      input: 'บรรทัดที่ 1: n m k w · บรรทัดที่ 2: p[i] จำนวน m ตัว · บรรทัดที่ 3: h[i] จำนวน m ตัว · บรรทัดที่ 4: t[i] จำนวน k ตัว',
      output: 'จำนวนเต็ม 1 ตัว คือพลังรวมที่เหลือน้อยที่สุด',
      constraints: 'n ≤ 10⁶ · m, k ≤ 8 · h[i] ≤ 1000 · 0 ≤ w ≤ n · monster อยู่ช่องเดียวกันได้',
      samples: [
        { input: '10 1 2 1\n1\n10\n2 5\n', output: '9\n' },
        { input: '100 3 3 1\n80 70 60\n1 1 1\n70 71 69\n', output: '2\n' },
      ],
    },
    hints: [
      'm และ k ไม่เกิน 8 แปลว่าลองทุกแบบได้: ไล่ทีละป้อม แล้วเลือกว่าป้อมนี้จะยิง monster ตัวไหนในระยะ ไม่เกิน 9⁸ กรณี',
      'คิดเป็น "ดาเมจที่ได้ผลจริง" จะง่ายกว่า: ยิงได้ผลก็ต่อเมื่อเป้ายังมีพลังเหลือ คำตอบคือ ผลรวม h − ดาเมจที่ได้ผลมากที่สุด และอย่าลืมกรณีที่ป้อมไม่มีเป้าในระยะเลย ต้องมีทางเลือก "ไม่ยิง" ด้วย',
      'gen(i, got): ถ้า i == k → best = max(best, got) · ลอง gen(i+1, got) (ไม่ยิง) · for j ทุกตัว: ถ้า |p[j] − t[i]| ≤ w และ dmg[j] < h[j] → dmg[j]++, gen(i+1, got+1), dmg[j]-- · ตอบ sum(h) − best',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
  {
    code: 'ex04m1_sort',
    title: '3 Values Sort',
    graderId: 1492,
    chapter: 'sorting',
    statement: {
      task: 'อาร์เรย์ยาว N มีแค่ค่า 1, 2, 3 ต้องการเรียงจากน้อยไปมาก โดยทำได้ทีละหนึ่ง swap คือสลับค่าของสองตำแหน่งใดก็ได้ ให้หาจำนวน swap ที่น้อยที่สุด',
      input: 'บรรทัดแรกมี N บรรทัดที่สองมีตัวเลข N ตัว แต่ละตัวเป็น 1, 2 หรือ 3',
      output: 'จำนวน swap ที่น้อยที่สุด',
      constraints: '1 ≤ N ≤ 100,000 · เวลา 1 วินาทีบน grader',
      samples: [
        { input: '7\n2 2 1 3 2 1 3\n', output: '3\n' },
        { input: '11\n1 1 1 2 2 2 3 3 3 3 3\n', output: '0\n' },
      ],
    },
    hints: [
      'ไม่ต้องจำลองการเรียงจริง แค่นับจำนวนเลข 1, 2, 3 ก็รู้แล้วว่าหลังเรียงเสร็จ ช่วงไหนควรเป็นเลขอะไร (โซน 1, โซน 2, โซน 3)',
      'นับ cnt[โซน][ค่า] เช่น มีเลข 2 กี่ตัวที่ตกอยู่ในโซน 1 ตัวที่ "แลกกันได้พอดี" (2 อยู่โซน 1 และ 1 อยู่โซน 2) ใช้ 1 swap ต่อคู่ ที่เหลือจะวนกันเป็นวงสามตัว (1→2→3→1) ซึ่งต้องใช้ 2 swap ต่อวง',
      'ans = Σ min(cnt[x][y], cnt[y][x]) ทุกคู่ x<y แล้วลบออกจาก cnt · เศษที่เหลือรวมกัน r ตัว → ans += r / 3 × 2',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
  {
    code: 'da67_f_abc_permutation',
    title: 'ABC Permutation',
    graderId: 1596,
    chapter: 'brute-force',
    statement: {
      task: 'ให้สร้างสตริงยาว N ที่ประกอบด้วยตัวอักษร A, B, C โดยใช้ A ได้ไม่เกิน i ตัว, B ไม่เกิน j ตัว, C ไม่เกิน k ตัว (ไม่จำเป็นต้องใช้ให้ครบ) พิมพ์จำนวนสตริงทั้งหมดในบรรทัดแรก แล้วพิมพ์ทุกสตริงเรียงตามพจนานุกรมบรรทัดละหนึ่งสตริง',
      input: 'บรรทัดเดียว N i j k',
      output: 'บรรทัดแรกเป็นจำนวนสตริง P ตามด้วย P บรรทัด เรียงตามพจนานุกรม',
      constraints: '1 ≤ N ≤ 12 · 0 ≤ i, j, k ≤ N · ถ้าไม่มีสตริงที่ใช้ได้ ให้พิมพ์ 0',
      samples: [
        { input: '2 0 1 3', output: '3\nBC\nCB\nCC\n' },
        { input: '2 1 1 3', output: '7\nAB\nAC\nBA\nBC\nCA\nCB\nCC\n' },
      ],
    },
    hints: [
      'เติมทีละตำแหน่งจากซ้ายไปขวาด้วย recursion แต่ละตำแหน่งลองตัวอักษร A, B, C ตามลำดับ ผลลัพธ์จะออกมาเรียงพจนานุกรมเองโดยไม่ต้อง sort',
      'เก็บ used[3] ว่าแต่ละตัวอักษรใช้ไปกี่ตัวแล้ว ลองใส่ตัวอักษร c ได้ต่อเมื่อ used[c] < limit[c] และอย่าลืมคืนค่า used[c]-- หลังเรียก recursion กลับมา',
      'ต้องพิมพ์จำนวนก่อนสตริงทั้งหมด → เก็บสตริงที่ได้ลงตัวแปรสะสม (หรือ vector) และนับไปด้วย แล้วค่อยพิมพ์ทีเดียวตอนท้าย ใช้ "\\n" แทน endl',
    ],
    starter: STARTER,
    timeLimitMs: 1000,
  },
  {
    code: 'da68_f_abcd_permutation',
    title: 'ABCD Permutation',
    graderId: 1660,
    chapter: 'brute-force',
    statement: {
      task: 'เหมือน ABC Permutation แต่มีตัวอักษร A, B, C, D โดยใช้ได้ไม่เกิน a, b, c, d ตัวตามลำดับ สร้างสตริงยาว N ทุกแบบ พิมพ์จำนวนในบรรทัดแรก แล้วตามด้วยสตริงทั้งหมดเรียงตามพจนานุกรม',
      input: 'บรรทัดเดียว N a b c d',
      output: 'บรรทัดแรกเป็นจำนวนสตริง ตามด้วยสตริงทั้งหมดเรียงตามพจนานุกรมบรรทัดละหนึ่งสตริง',
      constraints: '1 ≤ N ≤ 9 · 0 ≤ a, b, c, d ≤ N',
      samples: [
        { input: '2 2 2 1 0', output: '8\nAA\nAB\nAC\nBA\nBB\nBC\nCA\nCB\n' },
        { input: '5 3 0 2 0', output: '10\nAAACC\nAACAC\nAACCA\nACAAC\nACACA\nACCAA\nCAAAC\nCAACA\nCACAA\nCCAAA\n' },
      ],
    },
    hints: [
      'โครงสร้างเดียวกับข้อ ABC Permutation เปลี่ยนจาก 3 ตัวอักษรเป็น 4 ตัว เก็บ limit[4] และ used[4]',
      'ลองตัวอักษรตามลำดับ A→D ในทุกตำแหน่ง ผลลัพธ์จะเรียงพจนานุกรมอยู่แล้ว ตัดกิ่งทันทีเมื่อตัวอักษรนั้นใช้ครบโควตา',
      'ที่ N = 9 มีได้สูงสุด 4⁹ = 262,144 สตริง พิมพ์ได้ทัน ขอแค่ใช้ fast IO หรือสะสมผลลงสตริงเดียวแล้วพิมพ์ครั้งเดียว',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
  {
    code: 'a66_q2a_insertion_count',
    title: 'Insertion Sort Count',
    graderId: 1586,
    chapter: 'sorting',
    statement: {
      task: 'ที่ห้องเรียนมีโค้ด insertion sort ที่เริ่มแทรกสมาชิกจากท้ายอาร์เรย์มาหน้า (ตำแหน่ง n−2 ลงไปถึง 0) โดยในลูปแทรกจะมีคำสั่งเลื่อนสมาชิกที่ใหญ่กว่า/เล็กกว่าไปทางซ้ายทีละตัว (คำสั่ง A[i−1] = A[i]) ให้ตอบ m คำถาม แต่ละคำถามให้ค่า k ที่อยู่ในอาร์เรย์ และให้บอกว่าตอนที่แทรก k ลงตำแหน่งที่ถูกต้อง คำสั่งเลื่อนทำงานกี่ครั้ง',
      input: 'บรรทัดแรก n m · บรรทัดที่สอง A[0..n−1] (เป็นการเรียงสับเปลี่ยนของ 1..n) · บรรทัดที่สามมี k จำนวน m ตัว',
      output: 'ตอบคำถามละหนึ่งบรรทัด',
      constraints: 'ข้อสุดท้ายใน grader มี n ถึง 200,000 และ m ≤ 1,000 · ถ้าจำลอง insertion sort ตรง ๆ จะช้ามาก',
      samples: [
        { input: '6 2\n3 4 6 2 1 5\n6 2', output: '0\n3\n' },
        { input: '6 6\n3 4 6 2 1 5\n6 5 4 3 2 1', output: '0\n1\n0\n0\n3\n4\n' },
      ],
    },
    hints: [
      'ตอนแทรกค่า k ตัวมันเลื่อนผ่านสมาชิกที่อยู่ทางขวาของมัน (ซึ่งเรียงแล้ว) และมีค่าน้อยกว่า k เท่านั้น เพราะฉะนั้นคำตอบของ k = จำนวนค่าที่อยู่ "ทางขวา" ของ k ในอาร์เรย์เดิมและ "น้อยกว่า" k',
      'ถ้าตอบแต่ละคำถามด้วยการไล่นับ O(n) จะได้ O(n·m) ซึ่งช้าเกินสำหรับข้อมูลใหญ่ ให้คำนวณคำตอบของ "ทุกค่า" ไว้ล่วงหน้าครั้งเดียว แล้วตอบทุกคำถามด้วยการอ่านจากตาราง',
      'ไล่ i = 0..n−1 ใช้ Fenwick tree (BIT) นับว่าค่าที่น้อยกว่า A[i] และอยู่ทางซ้ายมีกี่ตัว s แล้วค่าที่น้อยกว่าและอยู่ขวา = (A[i]−1) − s (เพราะเป็น permutation ของ 1..n) เก็บ ans[A[i]] เวลา O(n log n)',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
  {
    code: 'a65_q2a_huge_array',
    title: 'Huge Array',
    graderId: 1587,
    chapter: 'sorting',
    statement: {
      task: 'อาร์เรย์ขนาดมหึมาถูกบีบอัดมาเป็น N คู่ (X, C) หมายถึงค่า X ซ้ำ C ครั้ง เมื่อนำทุกคู่มาต่อกันแล้วเรียงจากน้อยไปมาก ให้ตอบ Q คำถามว่า "สมาชิกตัวที่ P (นับจาก 1) ของอาร์เรย์ที่เรียงแล้วคือค่าอะไร"',
      input: 'บรรทัดแรก N Q · อีก N บรรทัดเป็น X C · อีก Q บรรทัดเป็น P',
      output: 'คำตอบแต่ละคำถามบรรทัดละหนึ่งค่า',
      constraints: 'ผลรวมของ C ได้ถึง 2×10⁹ (ใหญ่เกิน int) และ X ได้ถึง 2×10⁹ · สร้างอาร์เรย์จริงไม่ได้',
      samples: [
        { input: '5 2\n1 1\n10 1\n5 1\n1 1\n3 1\n5\n1', output: '10\n1\n' },
        { input: '5 3\n9 1\n4 5\n9 3\n8 3\n7 7\n1\n15\n8', output: '4\n8\n7\n' },
      ],
    },
    hints: [
      'อย่าขยายอาร์เรย์จริง ให้เรียงคู่ (X, C) ตามค่า X แล้วคิดเป็น "ช่วง" ของตำแหน่ง: คู่แรกครอบตำแหน่ง 1..C₁, คู่ที่สองครอบ C₁+1..C₁+C₂ ฯลฯ',
      'สร้างผลรวมสะสม pre[i] = C₁ + … + Cᵢ (ใช้ long long!) คำตอบของ P คือค่า X ของคู่แรกที่ pre[i] ≥ P',
      'หาคู่นั้นด้วยการค้นหาแบบทวิภาค (lower_bound บน pre) ต่อคำถามเวลา O(log N) รวม O((N+Q) log N) · ระวังคู่ที่มี X เท่ากันหลายคู่ ไม่ต้องรวมก็ได้เพราะหลังเรียงยังได้ผลเหมือนเดิม',
    ],
    starter: STARTER,
    timeLimitMs: 2000,
  },
];

export const problems: Problem[] = [
  ...earlyProblems,
  ...recursionProblems,
  ...divideConquerProblems,
  ...dpProblems,
  ...greedyProblems,
  ...graphProblems,
  ...shortestPathProblems,
  ...searchProblems,
  ...examProblems,
];

export const problemByCode = new Map(problems.map((p) => [p.code, p]));
