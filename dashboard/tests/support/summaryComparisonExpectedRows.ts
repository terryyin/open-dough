// Expected Summary comparison rows for
// ../intent/intent-summary-story-comparison.spec.ts against
// ./intentSummaryStoryComparisonFixture.ts's breakdown proofs: precise
// durations, counted-results differences, each child's Change, added / removed /
// renamed / later-trunk gaps. Gap variants live in
// ./summaryComparisonGapExpectedRows.ts.

import type { ComparisonScopeRow } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const entryComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "",
    "4 → 6 tests (+2) → 5 tests (+1)",
    "12.0 s",
    "12.0 s → 21.5 s (+9.5 s, +79%)",
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    parts,
  ],
  [
    "folder/",
    "",
    "2 → 3 tests (+1) → 2 tests (0)",
    "10.3 s",
    "10.3 s → 17.4 s (+7.1 s, +68%)",
    "10.3 s → 14.4 s (+4.1 s, +39%)",
    parts,
  ],
  [
    "added.spec.ts",
    "added",
    "added → 1 tests",
    "added",
    "800 ms",
    "800 ms",
    parts,
  ],
  [
    "gone.spec.ts",
    "removed",
    "1 → removed",
    "500 ms",
    "removed",
    "removed",
    parts,
  ],
  [
    "later.spec.ts",
    "",
    "no CI result",
    "not in the compared builds",
    "not in the compared builds",
    "not in the compared builds",
    parts,
  ],
  [
    "renamed.spec.ts",
    "renamed",
    "1 tests (no change)",
    "2.0 s (was tests/old.sh)",
    "2.0 s → 2.1 s (+100 ms, +5%)",
    "2.0 s → 2.1 s (+100 ms, +5%)",
    parts,
  ],
  [
    "root.spec.ts",
    "",
    "1 tests (no change)",
    "1.2 s",
    "1.2 s (no change)",
    "1.2 s (no change)",
    parts,
  ],
];

export const folderComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests/folder",
    "",
    "2 → 3 tests (+1) → 2 tests (0)",
    "10.3 s",
    "10.3 s → 17.4 s (+7.1 s, +68%)",
    "10.3 s → 14.4 s (+4.1 s, +39%)",
    parts,
  ],
  [
    "nested/",
    "",
    "1 tests (no change)",
    "340 ms",
    "340 ms → 410 ms (+70 ms, +21%)",
    "340 ms → 410 ms (+70 ms, +21%)",
    parts,
  ],
  [
    "a.spec.ts",
    "modified",
    "1 → 2 tests (+1) → 1 tests (0)",
    "10.0 s",
    "10.0 s → 17.0 s (+7.0 s, +70%)",
    "10.0 s → 14.0 s (+4.0 s, +40%)",
    parts,
  ],
];

export const nestedComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests/folder/nested",
    "",
    "1 tests (no change)",
    "340 ms",
    "340 ms → 410 ms (+70 ms, +21%)",
    "340 ms → 410 ms (+70 ms, +21%)",
    parts,
  ],
  [
    "c.spec.ts",
    "",
    "1 tests (no change)",
    "340 ms",
    "340 ms → 410 ms (+70 ms, +21%)",
    "340 ms → 410 ms (+70 ms, +21%)",
    parts,
  ],
];

// After the story's integration merge edits the nested test file
// (./intentSummaryStoryComparisonShared.ts): the same times, now marked as a
// story change.
const [nestedFolderRow, nestedFileRow] = nestedComparisonRows as readonly [
  ComparisonScopeRow,
  ComparisonScopeRow,
];
const [nestedFile, , ...nestedFileCells] = nestedFileRow;
export const mergeEditedNestedComparisonRows: readonly ComparisonScopeRow[] = [
  nestedFolderRow,
  [nestedFile, "modified", ...nestedFileCells],
];
