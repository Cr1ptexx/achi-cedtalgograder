# My solutions

C++17 solutions to the algorithm course problems on the Algo Lab site (problems from the CEDT grader).
Each file starts with a short header (problem, chapter, level, the key idea), and only solutions that pass
every local test are kept here (sample + grader + generated tests).

> Statements and test data are course material and are **not** included here; only my own code.

## How this folder is filled

```bash
# 1) write your solution in the practice folder (D:\DataAlgo\algo\<chapter>\<problem>\<problem>.cpp)
# 2) run the local judge with Ctrl+Shift+B in VS Code until every test is AC
# 3) copy the finished ones in (empty and failing files are skipped automatically)
node scripts/sync-solutions.mjs
```

Add `--force` to overwrite a copy that is already here. After syncing, add a line about the complexity or a
trap you hit at the top of the file: that is the part that shows how you think.

## Solutions

<!-- solutions:start -->

### 01 brute-force

| Problem | My idea |
|---|---|
| [Permutation with Constraint](01-brute-force/a64_q1_permu_before.cpp) |  |
| [Tower Defense](01-brute-force/a65_q1_tower_defense.cpp) |  |

### 02 sorting

| Problem | My idea |
|---|---|
| [3 Values Sort](02-sorting/ex04m1_sort.cpp) |  |
| [Insertion Sort Count](02-sorting/a66_q2a_insertion_count.cpp) |  |
| [Huge Array](02-sorting/a65_q2a_huge_array.cpp) |  |

<!-- solutions:end -->
