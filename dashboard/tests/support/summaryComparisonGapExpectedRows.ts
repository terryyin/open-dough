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
    "4 → 6 tests (+2) → 5 tests (+1)",
    "12.0 s",
    "12.0 s → 21.5 s (+9.5 s, +79%)",
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    parts,
  ],
  [
    "folder/",
    "",
    "no file breakdown → 3 tests → 2 tests",
    "no file breakdown",
    "17.4 s",
    "14.4 s",
  ],
  [
    "added.spec.ts",
    "added",
    "no file breakdown → 1 tests",
    "no file breakdown",
    "800 ms",
    "800 ms",
  ],
  [
    "gone.spec.ts",
    "removed",
    "no file breakdown → removed",
    "no file breakdown",
    "removed",
    "removed",
  ],
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
    "no file breakdown → 1 tests",
    "no file breakdown",
    "2.1 s",
    "2.1 s",
  ],
  [
    "root.spec.ts",
    "",
    "no file breakdown → 1 tests",
    "no file breakdown",
    "1.2 s",
    "1.2 s",
  ],
];

export const runningLandedEntryRows: ComparisonScopeRows = [
  [
    "dashboard/tests",
    "",
    "4 → 6 tests (+2)",
    "12.0 s",
    "12.0 s → 21.5 s (+9.5 s, +79%)",
    "Build is still running.",
    parts,
  ],
  [
    "folder/",
    "",
    "2 → 3 tests (+1)",
    "10.3 s",
    "10.3 s → 17.4 s (+7.1 s, +68%)",
    "Build is still running.",
  ],
  [
    "added.spec.ts",
    "added",
    "added → 1 tests",
    "added",
    "800 ms",
    "Build is still running.",
  ],
  [
    "gone.spec.ts",
    "removed",
    "1 → removed",
    "500 ms",
    "removed",
    "Build is still running.",
  ],
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
    "2.0 s → 2.1 s (+100 ms, +5%)",
    "Build is still running.",
  ],
  [
    "root.spec.ts",
    "",
    "1 tests (no change)",
    "1.2 s",
    "1.2 s (no change)",
    "Build is still running.",
  ],
];

const trunkBranch =
  "Branch comparison is not applicable for a Trunk Mode story.";

export const trunkEntryRows: ComparisonScopeRows = [
  [
    "dashboard/tests",
    "",
    "4 → 5 tests (+1)",
    "12.0 s",
    trunkBranch,
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    parts,
  ],
  [
    "folder/",
    "",
    "2 tests (no change)",
    "10.3 s",
    trunkBranch,
    "10.3 s → 14.4 s (+4.1 s, +39%)",
  ],
  ["added.spec.ts", "added", "added → 1 tests", "added", trunkBranch, "800 ms"],
  ["gone.spec.ts", "removed", "1 → removed", "500 ms", trunkBranch, "removed"],
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
    trunkBranch,
    "2.0 s → 2.1 s (+100 ms, +5%)",
  ],
  [
    "root.spec.ts",
    "",
    "1 tests (no change)",
    "1.2 s",
    trunkBranch,
    "1.2 s (no change)",
  ],
];
