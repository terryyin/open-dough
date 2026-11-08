// Assert Intent's CI entry timing comparison table
// (../../src/IntentCiComparison.tsx) shows the given Entry / Counts /
// Baseline / Branch / Landed cells.

import { expect, type Locator } from "@playwright/test";
import { comparisonTableColumns } from "../intentScopeProofPage.ts";
import type { ExpectedCues } from "./expectCiComparisonCues.ts";

const entryColumns = ["Entry", ...comparisonTableColumns];

export const comparedStoryEntryRows = [
  [
    "dashboard/tests",
    "2,090 → 2,092 tests (+2)",
    "4 min",
    "4 min → 4 min 30 s (+30 s, +13%)",
    "4 min → 5 min (+1 min, +25%)",
  ],
  [
    "tests",
    "5 checks (no change)",
    "2 min",
    "2 min → 1 min 30 s (−30 s, −25%)",
    "2 min → 1 min (−1 min, −50%)",
  ],
  ["src/skills", "added → 3 checks", "added", "30 s", "30 s"],
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
  await expect(table.getByRole("columnheader")).toHaveText([...entryColumns]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [entry, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(entry);
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}
