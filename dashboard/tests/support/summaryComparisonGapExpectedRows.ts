// Expected Summary comparison rows for gap variants in
// ../intent-summary-story-comparison-gaps.spec.ts: baseline without file
// breakdown, running Landed, and Trunk Mode Branch not applicable.

import type { ComparisonScopeRow } from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const noBreakdownEntryRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "5 passed tests",
    "12.0 s",
    "18.5 s +6.5 s",
    "18.5 s +6.5 s",
    parts,
  ],
  ["folder/", "2 passed tests", "no file breakdown", "14.4 s", "14.4 s", parts],
  [
    "added.spec.ts added",
    "1 passed tests",
    "no file breakdown",
    "800 ms",
    "800 ms",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "no CI result",
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
    "1 passed tests",
    "no file breakdown",
    "2.1 s",
    "2.1 s",
    parts,
  ],
  [
    "root.spec.ts",
    "1 passed tests",
    "no file breakdown",
    "1.2 s",
    "1.2 s",
    parts,
  ],
];

export const runningLandedEntryRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "5 passed tests",
    "12.0 s",
    "18.5 s +6.5 s",
    "Build is still running.",
    parts,
  ],
  [
    "folder/",
    "2 passed tests",
    "10.3 s",
    "14.4 s +4.1 s",
    "Build is still running.",
    parts,
  ],
  [
    "added.spec.ts added",
    "1 passed tests",
    "added",
    "800 ms",
    "Build is still running.",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "no CI result",
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
    "1 passed tests",
    "2.0 s (was tests/old.sh)",
    "2.1 s +100 ms",
    "Build is still running.",
    parts,
  ],
  [
    "root.spec.ts",
    "1 passed tests",
    "1.2 s",
    "1.2 s 0 ms",
    "Build is still running.",
    parts,
  ],
];

const trunkBranch =
  "Branch comparison is not applicable for a Trunk Mode story.";

export const trunkEntryRows: readonly ComparisonScopeRow[] = [
  [
    "dashboard/tests",
    "5 passed tests",
    "12.0 s",
    trunkBranch,
    "18.5 s +6.5 s",
    parts,
  ],
  ["folder/", "2 passed tests", "10.3 s", trunkBranch, "14.4 s +4.1 s", parts],
  [
    "added.spec.ts added",
    "1 passed tests",
    "added",
    trunkBranch,
    "800 ms",
    parts,
  ],
  [
    "gone.spec.ts removed",
    "no CI result",
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
    "1 passed tests",
    "2.0 s (was tests/old.sh)",
    trunkBranch,
    "2.1 s +100 ms",
    parts,
  ],
  ["root.spec.ts", "1 passed tests", "1.2 s", trunkBranch, "1.2 s 0 ms", parts],
];
