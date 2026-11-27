// Difficulty analysed from the problem itself (not from how many times people submitted).
//
// 1 ง่าย  — ใช้เทคนิคของบทตรง ๆ โค้ดสั้น ไม่ต้องมีข้อสังเกตเพิ่ม
// 2 กลาง — ต้องแปลงโจทย์เป็นโมเดล หรือมีข้อสังเกตเล็ก ๆ หนึ่งอย่าง หรือต้องระวังเรื่องประสิทธิภาพ
// 3 ยาก  — ต้องมีข้อสังเกตที่ไม่ชัดเจน หรือรวมหลายเทคนิค หรือมีกับดักถูกต้อง/เวลาหลายจุด
//
// `why` = the technique plus the one thing that makes the problem harder than it looks.
export type Analysis = { level: 1 | 2 | 3; why: string };

export const ANALYSIS: Record<string, Analysis> = {
  // ---- brute force
  ex00e4: { level: 1, why: 'recursion เลือก 0/1 ทีละหลัก นับจำนวน 1 ให้พอดี A ตัว' },
  ex00e5: { level: 1, why: 'ไล่ทุกเลข n บิต แล้วเช็กว่ามี 1 ติดกัน k ตัวไหม ระวังพิมพ์เลข 0 นำหน้าให้ครบ n หลัก' },
  da67_f_abc_permutation: { level: 1, why: 'recursion สร้างสตริงทีละตัว มีโควตาของแต่ละตัวอักษร ต้องพิมพ์จำนวนก่อนแล้วตามด้วยรายการ' },
  da68_f_abcd_permutation: { level: 1, why: 'เหมือน ABC Permutation เพิ่มเป็น 4 ตัวอักษร ผลลัพธ์ใหญ่ขึ้น ต้องพิมพ์เร็ว' },
  a64_q1_permu_before: { level: 2, why: 'permutation ที่มีเงื่อนไข "a ก่อน b" ต้องตัดกิ่งตั้งแต่ตอนวาง ไม่งั้นช้า และต้องออกตามลำดับพจนานุกรม' },
  a65_q1_tower_defense: { level: 2, why: 'ลองทุกการเลือกเป้าของป้อม (≤ 9⁸) แต่ต้องคิดความเสียหายแบบพลังไม่ติดลบ และมีทางเลือก "ไม่ยิง"' },
  a66_q1a_day_cover: { level: 2, why: 'set cover ด้วยการเลือกชุดนักศึกษา 2^m แบบ (m ≤ 20) ต้องใช้ bitset ครอบคลุมวันและตัดกิ่งเมื่อใช้ไม่น้อยกว่าคำตอบเดิม' },
  // ---- sorting
  da66_m1_line_paint: { level: 1, why: 'เรียงช่วงตามจุดเริ่ม แล้วกวาดรวมช่วงที่ซ้อนหรือติดกัน (ระวังช่วงที่ติดกัน 4–5 ต้องรวม)' },
  ex04m1_sort: { level: 2, why: 'นับ 1/2/3 เพื่อรู้โซนที่ถูกต้อง จับคู่ที่แลกกันพอดี (1 swap) ที่เหลือเป็นวงสามตัว (2 swap) ต้องมองให้ออกว่า swap น้อยสุดคืออะไร' },
  a65_q2a_huge_array: { level: 2, why: 'ผลรวมสะสมของจำนวนซ้ำ + binary search หาคู่ที่ครอบตำแหน่ง P ต้อง long long และห้ามสร้างอาร์เรย์จริง' },
  a66_q2a_insertion_count: { level: 2, why: 'จำนวนการเลื่อนของ k = จำนวนค่าที่น้อยกว่า k ทางขวา ต้องมองจาก insertion sort ออกมาเป็นการนับ แล้วคำนวณล่วงหน้าด้วย BIT' },
  da68_m2_interesting_events: { level: 2, why: 'จำนวนบูธที่เปิดวัน x = (#l ≤ x) − (#r < x) เรียงสองอาร์เรย์แล้ว upper/lower_bound ตอบแต่ละคำถามใน O(log n)' },
  da66_m1_line_monopoly: { level: 3, why: 'รวมช่วงแบบออนไลน์ระหว่างถามหลายรอบ ต้องดูแลชุดช่วงใน map (ลบ/ขยายช่วงที่ซ้อนหรือติดกัน) หลาย edge case' },
  // ---- recursion / divide and conquer
  ex01e3: { level: 1, why: 'binary search หาค่ามากสุดที่ไม่เกิน x (predecessor) เขียนเองโดยไม่ใช้ไลบรารี' },
  ex02e3_bs: { level: 1, why: 'binary search เมื่อมีค่าซ้ำ หาดัชนีขวาสุดที่ไม่เกิน x (เทียบเท่า upper_bound − 1)' },
  a62_q1a_recur: { level: 1, why: 'recursion แบ่งเมทริกซ์ 4 ส่วนตามนิยาม ระวังตำแหน่งเริ่มของแต่ละส่วน' },
  ex01m3: { level: 2, why: 'binary search บน "เวลา" ใช้ monotone count (จำนวนคนที่ได้นั่งภายในเวลา t) c ถึง 10¹² ต้อง long long' },
  a60_q1_matmod: { level: 2, why: 'ยกกำลังเมทริกซ์ 2×2 แบบ fast power n ถึง 2³⁰ ต้อง mod ทุกครั้งและใช้ long long' },
  a62_q1b_virus: { level: 2, why: 'recursion ตรวจครึ่งซ้ายขวา ครึ่งซ้ายอาจถูกกลับด้านได้ ต้องคิดว่ากลับแล้วเช็กยังไงไม่ให้ซ้ำซ้อน' },
  a63_q1b_virus2: { level: 2, why: 'recursion ตรวจไวรัสแบบนับจำนวน 1 ของสองครึ่งต่างกันไม่เกิน 1 ต้องไม่นับซ้ำทุกชั้น' },
  a64_q1_lawn_mowing: { level: 2, why: 'ผลรวมสะสม + binary search หาช่วงที่ไกลสุดภายในงบ (ค่าตัดแปรผันตามความยาว) ข้อมูลใหญ่ต้อง O(log n) ต่อคำถาม' },
  da67_m_chocolate_truffle: { level: 2, why: 'แปลงช่อง (p,q) เป็นเลขเดียว แล้ว lower_bound หาชิ้นที่ชอบถัดไป พร้อมกรณีวนกลับ R·C ถึง 10¹⁸ ต้อง long long' },
  da68_f2_remaining_merge: { level: 2, why: 'เขียน merge sort จริงแล้วนับสมาชิกที่เหลือต่อท้ายทุกครั้ง (เทียบแบบ ≤) ต้องเข้าใจ pseudocode แม่นยำ' },
  // ---- dynamic programming
  ex02e1_fibo: { level: 1, why: 'Fibonacci แบบจำค่า/ตารางเดียว' },
  ex02e2_cnk: { level: 1, why: 'สามเหลี่ยมปาสกาลตามสูตร C(n,k) = C(n−1,k−1) + C(n−1,k)' },
  ex02m1_triangle: { level: 1, why: 'DP สามเหลี่ยมตัวเลข เดินลงซ้าย/ขวาเก็บผลรวมสูงสุด' },
  da66_f1_linear_recurrence: { level: 1, why: 'คำนวณ R(n) ตามนิยามทีละตัว mod 32717 ไม่เกิน 10⁶ ขั้น' },
  ex03e1_lcs: { level: 2, why: 'LCS ตาราง 2 มิติ ต้องนิยามสถานะและ recurrence ถูก (ตรง/ไม่ตรง)' },
  a60b_q1_diagsum: { level: 2, why: 'ผลรวมช่วงติดกันสูงสุดตามแนวทแยง = Kadane ทุกเส้นทแยง ต้องมองให้ออกจะได้ O(n²) แทน O(n³)' },
  a62_q1b_chocolate: { level: 2, why: 'นับลำดับการกิน dp[i] = Σ dp[i − s] ตามสมาชิก s ใน S ต้อง mod และนับลำดับต่างกัน' },
  a64_q2_table_no_11: { level: 2, why: 'DP สถานะต่อคอลัมน์ (ว่าง/บน/ล่าง) n ถึง 10⁷ ต้องลูปเดียวและเก็บแค่ค่าก่อนหน้า' },
  da67_f_one_two_apart: { level: 2, why: 'DP เก็บ 2 ช่องล่าสุด (9 สถานะ) เช็กเงื่อนไข 1 กับ 2 ห่างกันไม่ถึง 3 n ถึง 10⁶' },
  da66_f2_new_game_plus: { level: 2, why: 'DP บนตารางที่สถานะมี "ประตูที่ใช้ล่าสุด" ด้วย (ห้ามซ้ำ) นับ mod' },
  da68_f_hidden_palindrome: { level: 2, why: 'longest palindromic subsequence ด้วย DP ช่วง O(N²) (หรือ LCS กับสตริงกลับด้าน) N ถึง 3000 ระวังหน่วยความจำ' },
  da68_f2_zero_one_subset_sum: { level: 2, why: 'DP นับวิธีตามผลรวม แต่ละตำแหน่ง 1 เลือก 1..K ส่วน 0 คงเดิม ใช้ long long' },
  da68_f2_sackknap: { level: 2, why: 'knapsack แบบน้ำหนักพอดี V หาราคาน้อยสุด (INF เมื่อไปไม่ถึง) n, V ถึง 10⁴ ต้อง 1 มิติและ long long' },
  // ---- greedy
  ex04e1_interval: { level: 1, why: 'เรียงตามเวลาจบ เลือกช่วงที่ไม่ชน (activity selection พื้นฐาน)' },
  a58_m_p4: { level: 1, why: 'interval selection อีกรูปแบบ เรียงตามเวลาจบ' },
  ex04e2_fknapsack: { level: 1, why: 'เรียงตามราคาต่อน้ำหนัก หยิบเศษส่วนของชิ้นสุดท้าย' },
  a60b_mid_p1_buffet: { level: 2, why: 'วางหลอดไฟทับซ้อนช่วงให้ทุกอาหารถูกส่อง greedy: วางไฟให้ไกลสุดเท่าที่ยังครอบคลุมอาหารที่ซ้ายสุดที่ยังไม่ถูกส่อง' },
  da67_m2_dungeon: { level: 2, why: 'ไอเท็มชนิดเดียวกันแทนกันได้ → ใช้ดันเจียนส์ที่ถูกสุดที่ยังไม่ใช้เสมอ และหยุดทันทีเมื่อจอมมารตนใดเกินพลังหรือไอเท็มหมด' },
  da68_f_game_of_trades: { level: 3, why: 'กำไรต่อชิ้น = ราคารับซื้อสูงสุดของ "คนอื่นที่ไม่ใช่คนขาย" − ราคาซื้อ ต้องเก็บ top-2 ต่อชนิด แล้วหยิบกำไรสูงสุด K ชิ้นด้วย counting' },
  // ---- graph
  a65_q0_degrees: { level: 1, why: 'นับ degree จากตาราง adjacency แล้วนับว่าแต่ละค่า degree มีกี่ปม' },
  a60a_q3_component: { level: 1, why: 'นับ connected component ด้วย DFS/BFS/Union-Find' },
  ex05m1_cycle: { level: 2, why: 'ตรวจวงวนในกราฟไม่มีทิศทางหลายชุด ต้องจำปมที่มา (parent) หรือใช้ Union-Find' },
  ex05m2_connection: { level: 2, why: 'BFS จากนิสิต A นับคนที่ระยะไม่เกิน K' },
  a62_q2a_line_graph: { level: 2, why: 'แต่ละ component ต้องเป็นเส้นตรง (degree ≤ 2 และเส้นเชื่อม = ปม − 1) แล้วนับ component ที่ผ่าน' },
  a59_q3_cycle: { level: 2, why: 'กราฟต้นไม้บวกหนึ่งเส้น หาขนาดวงเดียว: ปอกใบ (degree 1) ออกจนเหลือวง' },
  a62_q2a_pandemic: { level: 2, why: 'BFS หลายต้นทางบนตารางนับจำนวนวันที่ติดทั้งหมด ภูเขาเป็นสิ่งกีดขวาง' },
  da68_f_k_connected_city: { level: 2, why: 'K ปมแรกตามลำดับ BFS/DFS จากปมใดก็ได้ย่อมเชื่อมต่อกัน (ข้อสังเกตเดียว) ตอบกลุ่มใดก็ได้' },
  a64_q4_path_sum: { level: 3, why: 'DFS ไล่เส้นทางไม่ซ้ำปม (n ≤ 20) หาผลรวม = K ต้องตัดกิ่งแรง (เกิน K / ที่เหลือไม่พอ) กราฟหนาแน่นมีเส้นทางจำนวนมหาศาล' },
  // ---- shortest path and MST
  a61_q2_farthest: { level: 1, why: 'Dijkstra/Floyd บนตารางระยะ −1 = ไม่มีถนน แล้วหาระยะสั้นสุดที่ใหญ่สุด' },
  da68_f2_closed_city: { level: 1, why: 'Dijkstra ธรรมดาที่ข้ามเมืองปิดทุกเมือง' },
  ex06e1_cable: { level: 1, why: 'MST พื้นฐาน (Kruskal/Prim) จากตารางค่าสาย' },
  da66_f1_buffet_flight: { level: 2, why: 'น้ำหนักเส้น a→b = co[a] + ci[b] แล้ว Dijkstra จากปม 0 ตอบ −1 เมื่อไปไม่ถึง' },
  ex06e3_columbia: { level: 2, why: 'Dijkstra บนตารางที่ค่าผ่านทางอยู่ที่ช่อง (จ่ายตอนเดินเข้า)' },
  ex06e2_shortest: { level: 2, why: 'Bellman–Ford และต้องตรวจวงรอบลบแม้ไม่ได้ถึงจากต้นทาง ถ้ามีวงลบที่ใดที่หนึ่งต้องรายงาน' },
  ex06m2_exchange: { level: 2, why: 'หา arbitrage = วงที่ผลคูณอัตราแลก > 1 เทียบเท่าวงรอบลบเมื่อใช้ log หรือ Floyd ตามผลคูณ' },
  a58_q3_p3a_hacking: { level: 2, why: 'Dijkstra หลายต้นทางที่ต้นทุนอยู่ที่ปม (c[i]) ไม่ใช่เส้น ต้องนิยามน้ำหนักเส้นให้ถูก' },
  a64_q3_shortest_start: { level: 2, why: 'ต้นทางได้หลายปม และน้ำหนักติดลบได้ → เพิ่มปมต้นทางเสมือนเชื่อมไปยังทุกปมเริ่ม แล้ว Bellman–Ford' },
  da68_f_internet_provider: { level: 2, why: 'MST ที่มี modem เป็นทางเลือกฟรีของแต่ละเมือง จำลองด้วยปมเสมือนที่ต่อทุกเมืองด้วยน้ำหนัก 0 หรือต้นทุน modem' },
  da67_f_travelling_tourist: { level: 3, why: 'Dijkstra จากแต่ละสถานที่ (k ≤ 8) แล้ว bitmask DP แบบ TSP (ไม่ต้องกลับ เริ่มที่ไหนก็ได้) รวมสองเทคนิค' },
  a65_q3a_expressway: { level: 3, why: 'ต้องตอบทุกสิ้นปีหลังเพิ่มจังหวัดใหม่ → เก็บตารางระยะทางทุกคู่ แล้วอัปเดตทีละปมใหม่ (Floyd รอบเดียวต่อปี) ห้ามรัน Dijkstra ใหม่ n = 700' },
  a60a_q3_xor_road: { level: 2, why: 'MST แบบ "แพงสุด" บนกราฟเต็มที่น้ำหนัก = x XOR y (n ≤ 2,000) ใช้ Prim O(n²) คำนวณ XOR สดโดยไม่ต้องสร้างรายการเส้น' },
  // ---- search
  ex07e1_nqueen: { level: 2, why: 'backtracking วางทีละแถวพร้อมอาร์เรย์คอลัมน์/ทแยงสองแบบ N ถึง 12 ต้องตัดกิ่งดี' },
  ex07e2_iss: { level: 2, why: 'นับ partition ของ N แบบไม่ลดลง ต้องจำผล (memo/DP) เพราะ N = 100 ใหญ่เกินไล่ตรง ๆ ผลใหญ่ใกล้ 2×10⁸' },
  ex07e3_coloring: { level: 3, why: 'หาจำนวนสีน้อยสุดของกราฟ N ≤ 50 ต้อง backtracking ตัดกิ่งแรง (เรียงปมตามดีกรี ตัดสีที่สลับชื่อได้)' },
  // ---- past finals / mixed
  da66_f1_map_walk: { level: 2, why: 'DFS ไล่ทุกเส้นทางไม่ซ้ำช่องตามลำดับ A, B, C พิมพ์ทันที (จำกัดหน่วยความจำ 32 MB) หยุดที่ปลายทาง' },
  da66_f1_sea_bridge: { level: 2, why: 'ถนนสั้นสุด = BFS หลายต้นทางจากทุกช่องประเทศ 1 ไปประเทศ 2 โดยเลี่ยงภูเขาไฟ ข้อมูล 5000×5000 ต้องใช้อาร์เรย์ 1 มิติ' },
  da66_f2_grid_loop: { level: 2, why: 'เส้นเชื่อมจริงเมื่อ "สองช่องชี้หากัน" เท่านั้น แล้วนับ component ที่ทุกช่องมี degree 2 และหาขนาดสูงสุด 10⁶ ช่อง' },
  da67_f_border_extend: { level: 2, why: 'BFS หลายต้นทางจากทุกช่องดิน ระยะ ≤ k ที่เป็นน้ำให้ใส่ 2 ผลลัพธ์ใหญ่ต้องพิมพ์เร็ว' },
};
