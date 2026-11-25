// Big-O drills for the paper exam. Every answer was worked out by hand:
// the "why" shows the counting so the method can be copied to new questions.

export const BIGO_CHOICES = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)'] as const;

export type Drill = {
  id: string;
  /** code or recurrence shown in a monospace block */
  code: string;
  ask: string;
  /** index into BIGO_CHOICES */
  answer: number;
  why: string;
};

export const BIGO_DRILLS: Drill[] = [
  {
    id: 'nested-full',
    code: `for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        cnt++;`,
    ask: 'เวลาที่ใช้ของโค้ดนี้',
    answer: 4,
    why: 'ลูปนอกวน n รอบ ลูปในวน n รอบทุกรอบ รวม n × n = n² ครั้ง',
  },
  {
    id: 'triangle',
    code: `for (int i = 0; i < n; i++)
    for (int j = 0; j < i; j++)
        cnt++;`,
    ask: 'เวลาที่ใช้ของโค้ดนี้',
    answer: 4,
    why: 'ลูปในวน i รอบ รวม 0 + 1 + … + (n−1) = n(n−1)/2 ตัดค่าคงที่กับพจน์ต่ำออกเหลือ n² (ลูปในสั้นลงไม่ได้ทำให้ order ลดลง)',
  },
  {
    id: 'halving',
    code: `for (int i = 1; i < n; i *= 2)
    cnt++;`,
    ask: 'เวลาที่ใช้ของโค้ดนี้',
    answer: 1,
    why: 'i เป็น 1, 2, 4, 8, … ถึง n ต้องคูณ 2 ประมาณ log₂n ครั้ง',
  },
  {
    id: 'linear-times-log',
    code: `for (int i = 1; i <= n; i++)
    for (int j = 1; j <= n; j *= 2)
        cnt++;`,
    ask: 'เวลาที่ใช้ของโค้ดนี้',
    answer: 3,
    why: 'ลูปในวน log n รอบ (j คูณสอง) ไม่ขึ้นกับ i ลูปนอกวน n รอบ รวม n log n',
  },
  {
    id: 'geometric',
    code: `for (int i = 1; i <= n; i *= 2)
    for (int j = 1; j <= i; j++)
        cnt++;`,
    ask: 'เวลาที่ใช้ของโค้ดนี้',
    answer: 2,
    why: 'ลูปในวน i รอบ โดย i = 1, 2, 4, …, n รวม 1 + 2 + 4 + … + n ≈ 2n อนุกรมเรขาคณิตถูกครอบด้วยพจน์สุดท้าย จึงเป็น n ไม่ใช่ n log n (ข้อนี้คนมักตอบผิด)',
  },
  {
    id: 'harmonic',
    code: `for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j += i + 1)
        cnt++;`,
    ask: 'เวลาที่ใช้ของโค้ดนี้',
    answer: 3,
    why: 'ลูปในวน n/(i+1) รอบ รวม n × (1 + 1/2 + 1/3 + … + 1/n) = n × H(n) และ H(n) ≈ ln n จึงได้ n log n',
  },
  {
    id: 'rec-merge',
    code: 'T(n) = 2·T(n/2) + n',
    ask: 'แก้ recurrence นี้ (merge sort)',
    answer: 3,
    why: 'Master theorem: a = 2, b = 2 ได้ n^(log₂2) = n เท่ากับ f(n) = n พอดี (กรณีเท่ากัน) จึงคูณ log n ได้ n log n',
  },
  {
    id: 'rec-binary',
    code: 'T(n) = T(n/2) + 1',
    ask: 'แก้ recurrence นี้ (binary search)',
    answer: 1,
    why: 'a = 1, b = 2 ได้ n^0 = 1 เท่ากับ f(n) = 1 พอดี จึงคูณ log n ได้ log n หรือนับตรง ๆ คือหารสองได้ log₂n ครั้งแล้วจ่ายครั้งละ 1',
  },
  {
    id: 'rec-four',
    code: 'T(n) = 4·T(n/2) + n',
    ask: 'แก้ recurrence นี้',
    answer: 4,
    why: 'a = 4, b = 2 ได้ n^(log₂4) = n² ใหญ่กว่า f(n) = n แบบ polynomial งานกระจุกที่ใบ จึงได้ n²',
  },
  {
    id: 'rec-subsets',
    code: 'T(n) = 2·T(n−1) + 1',
    ask: 'แก้ recurrence นี้ (เลือก/ไม่เลือกทีละชิ้น)',
    answer: 6,
    why: 'ไม่ใช่รูปหารครึ่ง ใช้ Master ไม่ได้ ให้กางดู: ชั้นที่ k มี 2ᵏ call ลึก n ชั้น รวม 1 + 2 + 4 + … + 2ⁿ⁻¹ ≈ 2ⁿ',
  },
];

/** Formulas worth memorising for the paper exam. */
export const BIGO_FORMULAS: { name: string; formula: string; note: string }[] = [
  { name: 'ผลรวม 1 ถึง n', formula: '1 + 2 + … + n = n(n+1)/2', note: 'ลูปในที่ยาวขึ้นทีละหนึ่ง → n²' },
  { name: 'ผลรวมกำลังสอง', formula: '1² + 2² + … + n² ≈ n³/3', note: 'สามลูปซ้อนแบบสามเหลี่ยม → n³' },
  { name: 'อนุกรมเรขาคณิต', formula: '1 + 2 + 4 + … + 2ᵏ = 2ᵏ⁺¹ − 1', note: 'โตเป็นเท่าตัว ผลรวมถูกครอบด้วยพจน์สุดท้าย' },
  { name: 'อนุกรมฮาร์มอนิก', formula: '1 + 1/2 + … + 1/n ≈ ln n', note: 'ลูปที่ก้าวทีละ i → n log n' },
  { name: 'จำนวนครั้งที่หารครึ่ง', formula: 'n → n/2 → … → 1 ใช้ log₂n ครั้ง', note: 'ลูปคูณ/หารด้วยค่าคงที่ → log n' },
];
