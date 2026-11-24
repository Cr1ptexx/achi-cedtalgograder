import type { CatalogEntry } from './types';

// All algorithm problems on the course grader, grouped by chapter.
// Chapter is taken from the grader's tags; untagged ones are placed by topic
// and should be re-checked against the statement when they get built.
export const GRADER_BASE = 'https://cedt-grader.nattee.net';

export const catalog: CatalogEntry[] = [
  // Brute force
  { code: 'da67_f_abc_permutation', title: 'ABC Permutation', graderId: 1596, chapter: 'brute-force' },
  { code: 'da68_f_abcd_permutation', title: 'ABCD Permutation', graderId: 1660, chapter: 'brute-force' },
  { code: 'ex00e4', title: 'Gen Barcode', graderId: 1585, chapter: 'brute-force', built: true },
  { code: 'a64_q1_permu_before', title: 'Permutation with Constraint', graderId: 1490, chapter: 'brute-force', built: true },
  { code: 'a65_q1_tower_defense', title: 'Tower Defense', graderId: 1487, chapter: 'brute-force', built: true },

  // Sorting
  { code: 'ex04m1_sort', title: '3 Values Sort', graderId: 1492, chapter: 'sorting', built: true },
  { code: 'a66_q2a_insertion_count', title: 'Insertion Sort Count', graderId: 1586, chapter: 'sorting' },
  { code: 'a65_q2a_huge_array', title: 'Huge Array', graderId: 1587, chapter: 'sorting' },

  // Recursion & analysis
  { code: 'ex00e5', title: 'Consecutive Ones', graderId: 1491, chapter: 'recursion' },
  { code: 'a64_q4_path_sum', title: 'Path Sum', graderId: 1489, chapter: 'recursion' },

  // Divide & conquer
  { code: 'ex01e3', title: 'Binary Search 2', graderId: 1501, chapter: 'divide-conquer' },
  { code: 'ex02e3_bs', title: 'Binary Search 3', graderId: 1593, chapter: 'divide-conquer' },
  { code: 'ex01m3', title: 'Larger Restaurant', graderId: 1494, chapter: 'divide-conquer' },
  { code: 'a60_q1_matmod', title: 'Matrix Modulo', graderId: 1497, chapter: 'divide-conquer' },
  { code: 'a62_q1a_recur', title: 'Recursive Matrix', graderId: 1495, chapter: 'divide-conquer' },
  { code: 'a62_q1b_virus', title: 'ตรวจจับไวรัส', graderId: 1493, chapter: 'divide-conquer' },
  { code: 'a63_q1b_virus2', title: 'Virus 2', graderId: 1594, chapter: 'divide-conquer' },
  { code: 'a64_q1_lawn_mowing', title: 'Lawn Mowing', graderId: 1498, chapter: 'divide-conquer' },

  // Dynamic programming
  { code: 'ex02e1_fibo', title: 'Fibonacci Number', graderId: 1502, chapter: 'dp' },
  { code: 'ex02e2_cnk', title: 'Binomial Coefficient', graderId: 1503, chapter: 'dp' },
  { code: 'ex02m1_triangle', title: 'Number Triangles', graderId: 1592, chapter: 'dp' },
  { code: 'ex03e1_lcs', title: 'Longest Common Subsequence', graderId: 1504, chapter: 'dp' },
  { code: 'a60b_q1_diagsum', title: 'Diagonal Sum', graderId: 1505, chapter: 'dp' },
  { code: 'a62_q1b_chocolate', title: 'แบ่งช็อกโกแลต', graderId: 1506, chapter: 'dp' },
  { code: 'a64_q2_table_no_11', title: 'Table without 11', graderId: 1507, chapter: 'dp' },
  { code: 'da68_f_hidden_palindrome', title: 'Hidden Palindrome', graderId: 1662, chapter: 'dp' },
  { code: 'da68_f2_zero_one_subset_sum', title: 'Zero-one Subset Sum', graderId: 1731, chapter: 'dp' },
  { code: 'da68_f2_sackknap', title: 'SackKnap', graderId: 1732, chapter: 'dp' },

  // Greedy
  { code: 'ex04e1_interval', title: 'Interval Selection', graderId: 1518, chapter: 'greedy' },
  { code: 'a58_m_p4', title: 'Interval Selection (a58)', graderId: 1519, chapter: 'greedy' },
  { code: 'ex04e2_fknapsack', title: 'Fractional Knapsack', graderId: 1516, chapter: 'greedy' },
  { code: 'a60b_mid_p1_buffet', title: 'Buffet', graderId: 1515, chapter: 'greedy' },

  // Graph
  { code: 'a65_q0_degrees', title: 'Degree in Graph', graderId: 1595, chapter: 'graph' },
  { code: 'a60a_q3_component', title: 'Connected Component', graderId: 1508, chapter: 'graph' },
  { code: 'ex05m2_connection', title: 'Connection', graderId: 1510, chapter: 'graph' },
  { code: 'a62_q2a_line_graph', title: 'กราฟเส้นตรง', graderId: 1509, chapter: 'graph' },
  { code: 'ex05m1_cycle', title: 'Detecting Cycle', graderId: 1513, chapter: 'graph' },
  { code: 'a59_q3_cycle', title: 'Cycle in Tree', graderId: 1511, chapter: 'graph' },
  { code: 'a62_q2a_pandemic', title: 'Pandemic', graderId: 1512, chapter: 'graph' },
  { code: 'da68_f_k_connected_city', title: 'K Connected City', graderId: 1663, chapter: 'graph' },

  // Shortest path & MST
  { code: 'ex06e3_columbia', title: 'Columbia', graderId: 1520, chapter: 'shortest-path' },
  { code: 'ex06e2_shortest', title: 'Shortest Path with Negative Edge', graderId: 1521, chapter: 'shortest-path' },
  { code: 'ex06m2_exchange', title: 'Exchange', graderId: 1522, chapter: 'shortest-path' },
  { code: 'a58_q3_p3a_hacking', title: 'Hacking', graderId: 1524, chapter: 'shortest-path' },
  { code: 'a61_q2_farthest', title: 'เมืองไกลสุด', graderId: 1523, chapter: 'shortest-path' },
  { code: 'a65_q3a_expressway', title: 'Expressway', graderId: 1525, chapter: 'shortest-path' },
  { code: 'a64_q3_shortest_start', title: 'Shortest Start', graderId: 1665, chapter: 'shortest-path' },
  { code: 'ex06e1_cable', title: 'Cable Company (MST)', graderId: 1514, chapter: 'shortest-path' },
  { code: 'a60a_q3_xor_road', title: 'XOR Road (MST)', graderId: 1517, chapter: 'shortest-path' },
  { code: 'da68_f_internet_provider', title: 'Internet Provider (MST)', graderId: 1664, chapter: 'shortest-path' },

  // Search (backtracking / branch & bound)
  { code: 'ex07e1_nqueen', title: 'N Queen', graderId: 1485, chapter: 'search' },
  { code: 'ex07e2_iss', title: 'Increasing Sequence Sum', graderId: 1486, chapter: 'search' },
  { code: 'ex07e3_coloring', title: 'Graph Coloring', graderId: 1488, chapter: 'search' },

  // Past finals (mixed topics)
  { code: 'da66_f1_buffet_flight', title: 'Buffet Flight', graderId: 1529, chapter: 'exam' },
  { code: 'da66_f1_linear_recurrence', title: 'Linear Recurrence', graderId: 1526, chapter: 'exam' },
  { code: 'da66_f1_map_walk', title: 'Map Walk', graderId: 1528, chapter: 'exam' },
  { code: 'da66_f1_sea_bridge', title: 'Sea Bridge', graderId: 1527, chapter: 'exam' },
  { code: 'da66_f2_grid_loop', title: 'Grid Loop', graderId: 1534, chapter: 'exam' },
  { code: 'da66_f2_new_game_plus', title: 'New Game Plus', graderId: 1535, chapter: 'exam' },
  { code: 'da67_f_border_extend', title: 'Border Extend', graderId: 1598, chapter: 'exam' },
  { code: 'da67_f_one_two_apart', title: 'One Two Apart', graderId: 1597, chapter: 'exam' },
  { code: 'da67_f_travelling_tourist', title: 'Travelling Tourist', graderId: 1599, chapter: 'exam' },
  { code: 'da68_f_game_of_trades', title: 'Game of Trades', graderId: 1661, chapter: 'exam' },
];
