// Expected Proof rows for the summary comparison file journey
// (../intent/intent-summary-story-comparison-file.spec.ts): a selected file's
// one compared row names its story change after its path.

import { expect, type Locator } from "@playwright/test";
import { comparisonTableColumns } from "../intentScopeProofPage.ts";

type FileComparisonRow = readonly [string, string, string, string, string];

export const modifiedFileRow: FileComparisonRow = [
  "dashboard/tests/folder/a.spec.ts modified",
  "1 → 2 tests (+1) → 1 tests (0)",
  "10.0 s",
  "10.0 s → 17.0 s (+7.0 s, +70%)",
  "10.0 s → 14.0 s (+4.0 s, +40%)",
];

export const addedFileRow: FileComparisonRow = [
  "dashboard/tests/added.spec.ts added",
  "added → 1 tests",
  "added",
  "800 ms",
  "800 ms",
];

export const mergeEditedFileRow: FileComparisonRow = [
  "dashboard/tests/folder/nested/c.spec.ts modified",
  "1 tests (no change)",
  "340 ms",
  "340 ms → 410 ms (+70 ms, +21%)",
  "340 ms → 410 ms (+70 ms, +21%)",
];

export const unchangedFileRow: FileComparisonRow = [
  "dashboard/tests/root.spec.ts",
  "1 tests (no change)",
  "1.2 s",
  "1.2 s (no change)",
  "1.2 s (no change)",
];

export async function expectFileComparisonRow(
  proof: Locator,
  path: string,
  row: FileComparisonRow,
) {
  const table = proof.getByRole("table", { name: `CI proof of ${path}` });
  await expect(table.getByRole("columnheader")).toHaveText([
    "Scope",
    ...comparisonTableColumns,
  ]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(1);
  const [scope, ...cells] = row;
  await expect(body.nth(0).getByRole("rowheader")).toHaveText(scope);
  await expect(body.nth(0).getByRole("cell")).toHaveText([...cells]);
}
