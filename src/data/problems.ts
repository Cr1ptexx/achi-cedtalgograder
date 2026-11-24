import type { Problem } from './types';

const STARTER = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    return 0;
}
`;

// Statements are short paraphrases of the grader PDFs, written in our own words.
// Full test sets live in public/tests/<code>.json (built by scripts/build-tests.mjs).
export const problems: Problem[] = [
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
];

export const problemByCode = new Map(problems.map((p) => [p.code, p]));
