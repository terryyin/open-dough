// Expected Proof rows for the summary comparison file journey
// (../intent/intent-summary-story-comparison-file.spec.ts).

import { expect, type Locator } from "@playwright/test";
import {
  comparisonScopeColumns,
  type ComparisonScopeRow,
} from "../intentScopeProofPage.ts";

const parts = "1 of 1 part present";

export const modifiedFileRow: ComparisonScopeRow = [
  "dashboard/tests/folder/a.spec.ts modified",
  "1 tests (no change)",
  "10.0 s",
  "10.0 s → 14.0 s (+4.0 s, +40%)",
  "10.0 s → 14.0 s (+4.0 s, +40%)",
  parts,
];

export const addedFileRow: ComparisonScopeRow = [
  "dashboard/tests/added.spec.ts added",
  "added → 1 tests",
  "added",
  "800 ms",
  "800 ms",
  parts,
];

export const mergeEditedFileRow: ComparisonScopeRow = [
  "dashboard/tests/folder/nested/c.spec.ts modified",
  "1 tests (no change)",
  "340 ms",
  "340 ms → 410 ms (+70 ms, +21%)",
  "340 ms → 410 ms (+70 ms, +21%)",
  parts,
];

export const unchangedFileRow: ComparisonScopeRow = [
  "dashboard/tests/root.spec.ts",
  "1 tests (no change)",
  "1.2 s",
  "1.2 s (no change)",
  "1.2 s (no change)",
  parts,
];

export async function expectFileComparisonRow(
  proof: Locator,
  path: string,
  row: ComparisonScopeRow,
) {
  const table = proof.getByRole("table", { name: `CI proof of ${path}` });
  await expect(table.getByRole("columnheader")).toHaveText([
    ...comparisonScopeColumns,
  ]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(1);
  const [scope, ...cells] = row;
  await expect(body.nth(0).getByRole("rowheader")).toHaveText(scope);
  await expect(body.nth(0).getByRole("cell")).toHaveText([...cells]);
}
