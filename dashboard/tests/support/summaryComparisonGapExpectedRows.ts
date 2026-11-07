// Expected Summary comparison rows for gap variants in
// ../intent/intent-summary-story-comparison-gaps.spec.ts: baseline without file
// breakdown, running Landed, and Trunk Mode Branch not applicable. Counts
// show measured differences where both sides measure; a no-breakdown or
// status endpoint shows its gap, not a difference.

import type { ComparisonScopeRow } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const noBreakdownEntryRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "4 → 5 tests (+1)",
    "12.0 s",
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    parts,
  ],
  [
    "folder/",
    "no file breakdown → 2 tests",
    "no file breakdown",
    "14.4 s",
    "14.4 s",
    parts,
  ],
  [
    "added.spec.ts added",
    "no file breakdown → 1 tests",
    "no file breakdown",
    "800 ms",
    "800 ms",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "no file breakdown → removed",
    "no file breakdown",
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
    "no file breakdown → 1 tests",
    "no file breakdown",
    "2.1 s",
    "2.1 s",
    parts,
  ],
  [
    "root.spec.ts",
    "no file breakdown → 1 tests",
    "no file breakdown",
    "1.2 s",
    "1.2 s",
    parts,
  ],
];

export const runningLandedEntryRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "4 → 5 tests (+1)",
    "12.0 s",
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    "Build is still running.",
    parts,
  ],
  [
    "folder/",
    "2 tests (no change)",
    "10.3 s",
    "10.3 s → 14.4 s (+4.1 s, +39%)",
    "Build is still running.",
    parts,
  ],
  [
    "added.spec.ts added",
    "added → 1 tests",
    "added",
    "800 ms",
    "Build is still running.",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "1 → removed",
    "500 ms",
    "removed",
    "Build is still running.",
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
    "1 tests (no change)",
    "2.0 s (was tests/old.sh)",
    "2.0 s → 2.1 s (+100 ms, +5%)",
    "Build is still running.",
    parts,
  ],
  [
    "root.spec.ts",
    "1 tests (no change)",
    "1.2 s",
    "1.2 s (no change)",
    "Build is still running.",
    parts,
  ],
];

const trunkBranch =
  "Branch comparison is not applicable for a Trunk Mode story.";

export const trunkEntryRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "4 → 5 tests (+1)",
    "12.0 s",
    trunkBranch,
    "12.0 s → 18.5 s (+6.5 s, +54%)",
    parts,
  ],
  [
    "folder/",
    "2 tests (no change)",
    "10.3 s",
    trunkBranch,
    "10.3 s → 14.4 s (+4.1 s, +39%)",
    parts,
  ],
  [
    "added.spec.ts added",
    "added → 1 tests",
    "added",
    trunkBranch,
    "800 ms",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "1 → removed",
    "500 ms",
    trunkBranch,
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
    "1 tests (no change)",
    "2.0 s (was tests/old.sh)",
    trunkBranch,
    "2.0 s → 2.1 s (+100 ms, +5%)",
    parts,
  ],
  [
    "root.spec.ts",
    "1 tests (no change)",
    "1.2 s",
    trunkBranch,
    "1.2 s (no change)",
    parts,
  ],
];
