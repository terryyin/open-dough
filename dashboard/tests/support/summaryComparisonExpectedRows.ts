// Expected Summary comparison rows for
// ../intent/intent-summary-story-comparison.spec.ts against
// ./intentSummaryStoryComparisonFixture.ts's breakdown proofs: precise
// durations, counted-results differences, each child's Change, added / removed /
// renamed / later-trunk gaps. Gap variants live in
// ./summaryComparisonGapExpectedRows.ts.

import type { ComparisonScopeRows } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const entryComparisonRows: ComparisonScopeRows = [
  [
    "dashboard/tests",
    "",
    "4 → 6 tests (+2) → 5 tests (+1)",
    "12.0 s",
    "+9.5 s",
    "+6.5 s",
    parts,
  ],
  [
    "folder/",
    "",
    "2 → 3 tests (+1) → 2 tests (0)",
    "10.3 s",
    "+7.1 s",
    "+4.1 s",
  ],
  ["added.spec.ts", "added", "added → 1 tests", "added", "800 ms", "800 ms"],
  ["gone.spec.ts", "removed", "1 → removed", "500 ms", "removed", "removed"],
  [
    "later.spec.ts",
    "",
    "no CI result",
    "not in the compared builds",
    "not in the compared builds",
    "not in the compared builds",
  ],
  [
    "renamed.spec.ts",
    "renamed",
    "1 tests (no change)",
    "2.0 s (was tests/old.sh)",
    "+100 ms",
    "+100 ms",
  ],
  ["root.spec.ts", "", "1 tests (no change)", "1.2 s", "0 ms", "0 ms"],
];

export const folderComparisonRows: ComparisonScopeRows = [
  [
    "dashboard/tests/folder",
    "",
    "2 → 3 tests (+1) → 2 tests (0)",
    "10.3 s",
    "+7.1 s",
    "+4.1 s",
    parts,
  ],
  ["nested/", "", "1 tests (no change)", "340 ms", "+70 ms", "+70 ms"],
  [
    "a.spec.ts",
    "modified",
    "1 → 2 tests (+1) → 1 tests (0)",
    "10.0 s",
    "+7.0 s",
    "+4.0 s",
  ],
];

export const nestedComparisonRows = [
  [
    "dashboard/tests/folder/nested",
    "",
    "1 tests (no change)",
    "340 ms",
    "+70 ms",
    "+70 ms",
    parts,
  ],
  ["c.spec.ts", "", "1 tests (no change)", "340 ms", "+70 ms", "+70 ms"],
] satisfies ComparisonScopeRows;

// After the story's integration merge edits the nested test file
// (./intentSummaryStoryComparisonShared.ts): the same times, now marked as a
// story change.
const [nestedFolderRow, nestedFileRow] = nestedComparisonRows;
const [nestedFile, , ...nestedFileCells] = nestedFileRow;
export const mergeEditedNestedComparisonRows: ComparisonScopeRows = [
  nestedFolderRow,
  [nestedFile, "modified", ...nestedFileCells],
];
