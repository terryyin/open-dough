// Assert Intent's CI entry timing comparison table
// (../../src/IntentCiComparison.tsx) shows the given Entry / Counts /
// Baseline / Branch / Landed cells.

import type { Locator } from "@playwright/test";
import {
  comparisonTableColumns,
  expectProofTableRows,
} from "../intentScopeProofPage.ts";
import type { ExpectedCues } from "./expectCiComparisonCues.ts";

// Branch and Landed note that they show the change from Baseline.
const entryColumns = [
  "Entry",
  ...comparisonTableColumns.map((column) =>
    column === "Branch" || column === "Landed"
      ? `${column} vs baseline`
      : column,
  ),
];

export const comparedStoryEntryRows = [
  [
    "dashboard/tests",
    "2,090 → 2,092 test cases (+2)",
    "4 min",
    "+30 s",
    "+1 min",
  ],
  ["tests", "5 test files (no change)", "2 min", "−30 s", "−1 min"],
  ["src/skills", "added → 3 test files", "added", "30 s", "30 s"],
] as const;

export const comparedStoryEntryCues: readonly ExpectedCues[] = [
  { count: "more-light", duration: "slower-light" },
  {
    count: "none",
    duration: "faster-strong",
    countReason: "unchanged",
  },
  {
    count: "none",
    duration: "none",
    countReason: "added",
    durationReason: "added",
  },
];

export async function expectCiComparisonEntryRows(
  panel: Locator,
  rows: readonly (readonly [string, string, string, string, string])[],
) {
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expectProofTableRows(table, entryColumns, rows);
}
