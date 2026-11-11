// A selected file's compared Proof, independent of how the scenario selected it.
import type { Locator } from "@playwright/test";
import { comparisonTableColumns } from "./intentScopeProofPage.ts";
import { expectProofTableRows } from "./proofTablePage.ts";

export function fileProofTable(proof: Locator, path: string): Locator {
  return proof.getByRole("table", { name: `CI proof of ${path}`, exact: true });
}

export type FileComparisonRow = readonly [
  string,
  string,
  string,
  string,
  string,
];

export async function expectFileComparisonRows(
  proof: Locator,
  path: string,
  rows: readonly FileComparisonRow[],
) {
  await expectProofTableRows(
    fileProofTable(proof, path),
    [
      "Scope",
      ...comparisonTableColumns.map((name) =>
        name === "Branch" || name === "Landed" ? `${name} vs baseline` : name,
      ),
    ],
    rows,
  );
}

export async function expectFileComparisonRow(
  proof: Locator,
  path: string,
  row: FileComparisonRow,
) {
  await expectFileComparisonRows(proof, path, [row]);
}
