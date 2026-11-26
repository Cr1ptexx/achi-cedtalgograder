// Difficulty and "worth doing" ratings for every catalog problem.
//
// Source data: the grader's Hall of Fame report (snapshot 2026-11-24),
// [total submissions, people who attempted]. Submissions per person is a
// difficulty proxy: hard problems take more tries before they pass.

export const STATS_DATE = '24 พ.ย. 2569';

const STATS: Record<string, [number, number]> = {
  da67_f_abc_permutation: [1761, 416], da68_f_abcd_permutation: [742, 275], ex00e4: [1473, 562],
  a64_q1_permu_before: [3157, 726], a65_q1_tower_defense: [983, 309], ex04m1_sort: [1191, 315],
  a66_q2a_insertion_count: [1199, 418], a65_q2a_huge_array: [1711, 444], ex00e5: [1892, 738],
  a64_q4_path_sum: [1315, 182], ex01e3: [1274, 455], ex02e3_bs: [918, 355], ex01m3: [808, 171],
  a60_q1_matmod: [965, 372], a62_q1a_recur: [1295, 642], a62_q1b_virus: [2662, 655],
  a63_q1b_virus2: [1041, 370], a64_q1_lawn_mowing: [2227, 525], ex02e1_fibo: [1022, 480],
  ex02e2_cnk: [755, 448], ex02m1_triangle: [224, 140], ex03e1_lcs: [279, 108],
  a60b_q1_diagsum: [1275, 425], a62_q1b_chocolate: [1210, 486], a64_q2_table_no_11: [1622, 513],
  da68_f_hidden_palindrome: [1737, 258], da68_f2_zero_one_subset_sum: [207, 42], da68_f2_sackknap: [130, 50],
  ex04e1_interval: [421, 155], a58_m_p4: [57, 47], ex04e2_fknapsack: [731, 188],
  a60b_mid_p1_buffet: [564, 209], a65_q0_degrees: [863, 430], a60a_q3_component: [1716, 577],
  ex05m2_connection: [1513, 454], a62_q2a_line_graph: [1704, 463], ex05m1_cycle: [1950, 539],
  a59_q3_cycle: [1299, 378], a62_q2a_pandemic: [1028, 372], da68_f_k_connected_city: [1109, 211],
  ex06e3_columbia: [790, 289], ex06e2_shortest: [1080, 410], ex06m2_exchange: [731, 285],
  a58_q3_p3a_hacking: [781, 247], a61_q2_farthest: [1950, 464], a65_q3a_expressway: [1010, 238],
  a64_q3_shortest_start: [107, 16], ex06e1_cable: [1152, 446], a60a_q3_xor_road: [1274, 365],
  da68_f_internet_provider: [1178, 212], ex07e1_nqueen: [580, 213], ex07e2_iss: [843, 331],
  ex07e3_coloring: [1250, 238], da66_f1_buffet_flight: [1711, 513], da66_f1_linear_recurrence: [1798, 567],
  da66_f1_map_walk: [2491, 654], da66_f1_sea_bridge: [2022, 387], da66_f2_grid_loop: [619, 151],
  da66_f2_new_game_plus: [979, 191], da67_f_border_extend: [1743, 347], da67_f_one_two_apart: [2075, 333],
  da67_f_travelling_tourist: [1368, 264], da68_f_game_of_trades: [913, 128],
};

export type Level = 1 | 2 | 3;
export const LEVEL_NAME: Record<Level, string> = { 1: 'ง่าย', 2: 'กลาง', 3: 'ยาก' };

export type Rating = {
  level: Level;
  tries: number;        // average submissions per person
  people: number;
  lowSample: boolean;   // too few people for the difficulty to be reliable
  stars: Level;         // worth doing, 1–3
  source: string;       // where the problem comes from
  reasons: string[];    // why it got these stars
};

const SMALL_SAMPLE = 60;

function source(code: string): { label: string; score: number } {
  let m = code.match(/^da(\d\d)_f/);
  if (m) {
    const y = +m[1];
    return { label: `ข้อสอบปลายภาค ปี ${y}`, score: y >= 68 ? 3 : y === 67 ? 2.6 : 2.2 };
  }
  m = code.match(/^a(\d\d)/);
  if (m) {
    const y = +m[1];
    return { label: `ข้อสอบเก่า ปี ${y}`, score: y >= 64 ? 2 : y >= 62 ? 1.6 : 1.2 };
  }
  if (code.startsWith('ex')) return { label: 'แบบฝึกหัดหลักของบท', score: 2 };
  return { label: 'โจทย์ฝึก', score: 1.5 };
}

export function ratingOf(code: string): Rating | null {
  const s = STATS[code];
  if (!s) return null;
  const [subs, people] = s;
  // Round first so the shown number (1 decimal) always matches the level.
  const tries = Math.round((subs / people) * 10) / 10;
  const level: Level = tries < 2.7 ? 1 : tries <= 4 ? 2 : 3;
  const src = source(code);
  const reasons = [src.label];
  let score = src.score;
  if (people >= 500) { score += 0.5; reasons.push(`เพื่อนฝึกเยอะ (${people} คน)`); }
  else if (people < 150) { score -= 0.5; reasons.push(`คนฝึกน้อย (${people} คน)`); }
  const stars = Math.min(3, Math.max(1, Math.round(score))) as Level;
  return { level, tries, people, lowSample: people < SMALL_SAMPLE, stars, source: src.label, reasons };
}

/** Order for problem lists: easiest first (fewest tries per person on the grader), unknown last. */
export const byEase = (a: { code: string }, b: { code: string }) =>
  (ratingOf(a.code)?.tries ?? 99) - (ratingOf(b.code)?.tries ?? 99);
