// Problems assigned by the course, grouped by date (copied from the class schedule).
// kind: 'class' = done in the afternoon session, 'home' = homework.
// To extend the schedule, add rows here; every `code` must exist in catalog.ts.
export type AssignedKind = 'class' | 'home';
export type AssignedItem = { date: string; topic: string; kind: AssignedKind; code: string };

const D = (date: string, topic: string, rows: [AssignedKind, string][]): AssignedItem[] =>
  rows.map(([kind, code]) => ({ date, topic, kind, code }));

export const ASSIGNED: AssignedItem[] = [
  ...D('2026-11-23', 'D&C', [
    ['class', 'a62_q1a_recur'], ['class', 'a62_q1b_virus'], ['class', 'ex01e3'],
    ['home', 'a63_q1b_virus2'], ['home', 'ex02e3_bs'],
  ]),
  ...D('2026-11-24', 'DP', [
    ['home', 'a64_q1_lawn_mowing'], ['home', 'a60_q1_matmod'],
    ['class', 'a64_q2_table_no_11'], ['class', 'ex02e1_fibo'], ['class', 'ex02e2_cnk'],
    ['home', 'a60b_q1_diagsum'], ['home', 'a62_q1b_chocolate'], ['home', 'ex02m1_triangle'],
  ]),
  ...D('2026-11-25', 'Graph 1', [
    ['class', 'a65_q0_degrees'], ['class', 'ex05m1_cycle'], ['class', 'a60a_q3_component'],
    ['home', 'ex05m2_connection'], ['home', 'a62_q2a_line_graph'], ['home', 'a59_q3_cycle'], ['home', 'a62_q2a_pandemic'],
  ]),
  ...D('2026-11-26', 'MST', [
    ['class', 'ex06e1_cable'], ['class', 'a60a_q3_xor_road'],
  ]),
  ...D('2026-11-30', 'Shortest Path', [
    ['class', 'a61_q2_farthest'], ['class', 'ex06e2_shortest'], ['class', 'ex06m2_exchange'],
    ['home', 'ex06e3_columbia'], ['home', 'a58_q3_p3a_hacking'], ['home', 'a65_q3a_expressway'],
  ]),
];

export const KIND_LABEL: Record<AssignedKind, string> = { class: 'คาบบ่าย', home: 'การบ้าน' };
