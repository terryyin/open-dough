// Expected Summary comparison rows for gap variants in
// ../intent/intent-summary-story-comparison-gaps.spec.ts: baseline without file
// breakdown, running Landed, and Trunk Mode Branch not applicable. Counts
// show measured differences where both sides measure; a no-breakdown or
// status endpoint shows its gap, not a difference.

import type { ComparisonScopeRows } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const noBreakdownEntryRows: ComparisonScopeRows = [
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
    "no file breakdown of test cases → 3 test cases → 2 test cases",
    "no file breakdown",
    "17.4 s",
    "14.4 s",
  ],
  [
    "added.spec.ts",
    "added",
    "no file breakdown of test cases → 1 test case",
    "no file breakdown",
    "800 ms",
    "800 ms",
  ],
  [
    "gone.spec.ts",
    "removed",
    "no file breakdown of test cases → removed",
    "no file breakdown",
    "removed",
    "removed",
  ],
  [
    "renamed.spec.ts",
    "renamed",
    "no file breakdown of test files → 1 test case",
    "no file breakdown",
    "2.1 s",
    "2.1 s",
  ],
  [
    "root.spec.ts",
    "",
    "no file breakdown of test cases → 1 test case",
    "no file breakdown",
    "1.2 s",
    "1.2 s",
  ],
];

export const runningLandedEntryRows: ComparisonScopeRows = [
  [
    "dashboard/tests",
    "",
    "4 → 6 test cases (+2)",
    "12.0 s",
    "+9.5 s",
    "Build is still running.",
    parts,
  ],
  [
    "folder/",
    "",
    "2 → 3 test cases (+1)",
    "10.3 s",
    "+7.1 s",
    "Build is still running.",
  ],
  [
    "added.spec.ts",
    "added",
    "added → 1 test case",
    "added",
    "800 ms",
    "Build is still running.",
  ],
  [
    "gone.spec.ts",
    "removed",
    "1 test case → removed",
    "500 ms",
    "removed",
    "Build is still running.",
  ],
  // Renamed across units (./summaryComparisonExpectedRows.ts): no change.
  [
    "renamed.spec.ts",
    "renamed",
    "1 test file → 1 test case (different units)",
    "2.0 s (was tests/old.sh)",
    "2.1 s",
    "Build is still running.",
  ],
  [
    "root.spec.ts",
    "",
    "1 test case (no change)",
    "1.2 s",
    "0 ms",
    "Build is still running.",
  ],
];

const trunkBranch =
  "Branch comparison is not applicable for a Trunk Mode story.";

export const trunkEntryRows: ComparisonScopeRows = [
  [
    "dashboard/tests",
    "",
    "4 → 5 test cases (+1)",
    "12.0 s",
    trunkBranch,
    "+6.5 s",
    parts,
  ],
  ["folder/", "", "2 test cases (no change)", "10.3 s", trunkBranch, "+4.1 s"],
  [
    "added.spec.ts",
    "added",
    "added → 1 test case",
    "added",
    trunkBranch,
    "800 ms",
  ],
  [
    "gone.spec.ts",
    "removed",
    "1 test case → removed",
    "500 ms",
    trunkBranch,
    "removed",
  ],
  [
    "renamed.spec.ts",
    "renamed",
    "1 test file → 1 test case (different units)",
    "2.0 s (was tests/old.sh)",
    trunkBranch,
    "2.1 s",
  ],
  ["root.spec.ts", "", "1 test case (no change)", "1.2 s", trunkBranch, "0 ms"],
];
