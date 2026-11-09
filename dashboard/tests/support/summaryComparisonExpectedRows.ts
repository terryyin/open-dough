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
    "4 → 6 test cases (+2) → 5 test cases (+1)",
    "12.0 s",
    "+9.5 s",
    "+6.5 s",
    parts,
  ],
  [
    "folder/",
    "",
    "2 → 3 test cases (+1) → 2 test cases (0)",
    "10.3 s",
    "+7.1 s",
    "+4.1 s",
  ],
  [
    "added.spec.ts",
    "added",
    "added → 1 test case",
    "added",
    "800 ms",
    "800 ms",
  ],
  ["gone.spec.ts", "removed", "1 → removed", "500 ms", "removed", "removed"],
  [
    "later.spec.ts",
    "",
    "no CI result",
    "not in the compared builds",
    "not in the compared builds",
    "not in the compared builds",
  ],
  // A shell check's own file outcome renamed into a Playwright spec's test
  // case: the units differ, so neither its count nor its time compares; each
  // endpoint keeps its own time, with no signed change.
  [
    "renamed.spec.ts",
    "renamed",
    "1 test file → 1 test case",
    "2.0 s (was tests/old.sh)",
    "2.1 s",
    "2.1 s",
  ],
  ["root.spec.ts", "", "1 test case (no change)", "1.2 s", "0 ms", "0 ms"],
];

export const folderComparisonRows: ComparisonScopeRows = [
  [
    "dashboard/tests/folder",
    "",
    "2 → 3 test cases (+1) → 2 test cases (0)",
    "10.3 s",
    "+7.1 s",
    "+4.1 s",
    parts,
  ],
  ["nested/", "", "1 test case (no change)", "340 ms", "+70 ms", "+70 ms"],
  [
    "a.spec.ts",
    "modified",
    "1 → 2 test cases (+1) → 1 test case (0)",
    "10.0 s",
    "+7.0 s",
    "+4.0 s",
  ],
];

export const nestedComparisonRows = [
  [
    "dashboard/tests/folder/nested",
    "",
    "1 test case (no change)",
    "340 ms",
    "+70 ms",
    "+70 ms",
    parts,
  ],
  ["c.spec.ts", "", "1 test case (no change)", "340 ms", "+70 ms", "+70 ms"],
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
