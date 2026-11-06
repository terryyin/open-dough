// Expected Summary comparison rows for
// ../intent-summary-story-comparison.spec.ts against
// ./intentSummaryStoryComparisonFixture.ts's breakdown proofs: precise
// durations, counted-results differences, change markers, added / removed /
// renamed / later-trunk gaps. Gap variants live in
// ./summaryComparisonGapExpectedRows.ts.

import type { ComparisonScopeRow } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const entryComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "4 → 5 +1 tests",
    "12.0 s",
    "18.5 s +6.5 s",
    "18.5 s +6.5 s",
    parts,
  ],
  [
    "folder/",
    "2 → 2 0 tests",
    "10.3 s",
    "14.4 s +4.1 s",
    "14.4 s +4.1 s",
    parts,
  ],
  [
    "added.spec.ts added",
    "added → 1 tests",
    "added",
    "800 ms",
    "800 ms",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "1 → removed",
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
    "1 → 1 0 tests",
    "2.0 s (was tests/old.sh)",
    "2.1 s +100 ms",
    "2.1 s +100 ms",
    parts,
  ],
  ["root.spec.ts", "1 → 1 0 tests", "1.2 s", "1.2 s 0 ms", "1.2 s 0 ms", parts],
];

export const folderComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests/folder",
    "2 → 2 0 tests",
    "10.3 s",
    "14.4 s +4.1 s",
    "14.4 s +4.1 s",
    parts,
  ],
  [
    "nested/",
    "1 → 1 0 tests",
    "340 ms",
    "410 ms +70 ms",
    "410 ms +70 ms",
    parts,
  ],
  [
    "a.spec.ts modified",
    "1 → 1 0 tests",
    "10.0 s",
    "14.0 s +4.0 s",
    "14.0 s +4.0 s",
    parts,
  ],
];

export const nestedComparisonRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests/folder/nested",
    "1 → 1 0 tests",
    "340 ms",
    "410 ms +70 ms",
    "410 ms +70 ms",
    parts,
  ],
  [
    "c.spec.ts",
    "1 → 1 0 tests",
    "340 ms",
    "410 ms +70 ms",
    "410 ms +70 ms",
    parts,
  ],
];

// When Review refuses attribution, the story overlay is absent: deleted files
// and change markers drop out of the inventory, while retained A/B/C proof
// rows for files still on trunk remain.
export const entryComparisonRowsWithoutOverlay: readonly ComparisonScopeRow[] =
  [
    [
      "dashboard/tests",
      "4 → 5 +1 tests",
      "12.0 s",
      "18.5 s +6.5 s",
      "18.5 s +6.5 s",
      parts,
    ],
    [
      "folder/",
      "2 → 2 0 tests",
      "10.3 s",
      "14.4 s +4.1 s",
      "14.4 s +4.1 s",
      parts,
    ],
    ["added.spec.ts", "added → 1 tests", "added", "800 ms", "800 ms", parts],
    [
      "later.spec.ts",
      "no CI result",
      "not in the compared builds",
      "not in the compared builds",
      "not in the compared builds",
      parts,
    ],
    ["renamed.spec.ts", "added → 1 tests", "added", "2.1 s", "2.1 s", parts],
    [
      "root.spec.ts",
      "1 → 1 0 tests",
      "1.2 s",
      "1.2 s 0 ms",
      "1.2 s 0 ms",
      parts,
    ],
  ];

export const folderComparisonRowsWithoutOverlay: readonly ComparisonScopeRow[] =
  [
    [
      "dashboard/tests/folder",
      "2 → 2 0 tests",
      "10.3 s",
      "14.4 s +4.1 s",
      "14.4 s +4.1 s",
      parts,
    ],
    [
      "nested/",
      "1 → 1 0 tests",
      "340 ms",
      "410 ms +70 ms",
      "410 ms +70 ms",
      parts,
    ],
    [
      "a.spec.ts",
      "1 → 1 0 tests",
      "10.0 s",
      "14.0 s +4.0 s",
      "14.0 s +4.0 s",
      parts,
    ],
  ];
