// Expected Summary comparison rows for
// ../intent-summary-story-comparison.spec.ts against
// ./intentSummaryStoryComparisonFixture.ts's breakdown proofs: precise
// durations, change markers, added / removed / renamed / later-trunk gaps.
// Counts stay the homepage's chosen-build presentation (slice 1). Gap
// variants live in ./summaryComparisonGapExpectedRows.ts.

import type { ComparisonScopeRow } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const entryComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "5 passed tests",
    "12.0 s",
    "18.5 s +6.5 s",
    "18.5 s +6.5 s",
    parts,
  ],
  [
    "folder/",
    "2 passed tests",
    "10.3 s",
    "14.4 s +4.1 s",
    "14.4 s +4.1 s",
    parts,
  ],
  ["added.spec.ts added", "1 passed tests", "added", "800 ms", "800 ms", parts],
  [
    "gone.spec.ts removed",
    "no CI result",
    "500 ms",
    "removed",
    "removed",
    parts,
  ],
  [
    "later.spec.ts",
    "no CI result",
    "not in the compared builds",
    "not in the compared builds",
    "not in the compared builds",
    parts,
  ],
  [
    "renamed.spec.ts renamed",
    "1 passed tests",
    "2.0 s (was tests/old.sh)",
    "2.1 s +100 ms",
    "2.1 s +100 ms",
    parts,
  ],
  [
    "root.spec.ts",
    "1 passed tests",
    "1.2 s",
    "1.2 s 0 ms",
    "1.2 s 0 ms",
    parts,
  ],
];

export const folderComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests/folder",
    "2 passed tests",
    "10.3 s",
    "14.4 s +4.1 s",
    "14.4 s +4.1 s",
    parts,
  ],
  [
    "nested/",
    "1 passed tests",
    "340 ms",
    "410 ms +70 ms",
    "410 ms +70 ms",
    parts,
  ],
  [
    "a.spec.ts modified",
    "1 passed tests",
    "10.0 s",
    "14.0 s +4.0 s",
    "14.0 s +4.0 s",
    parts,
  ],
];

export const nestedComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests/folder/nested",
    "1 passed tests",
    "340 ms",
    "410 ms +70 ms",
    "410 ms +70 ms",
    parts,
  ],
  [
    "c.spec.ts",
    "1 passed tests",
    "340 ms",
    "410 ms +70 ms",
    "410 ms +70 ms",
    parts,
  ],
];
