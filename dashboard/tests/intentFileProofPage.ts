// A selected file's Proof, independent of how the scenario selected it.
import type { Locator } from "@playwright/test";
import { proofColumns, type ProofRow } from "./intentCiProofPage.ts";
import {
  comparisonTableColumns,
  type ComparisonColumn,
} from "./intentScopeProofPage.ts";
import { expectProofTableRows } from "./proofTablePage.ts";

export function fileProofTable(proof: Locator, path: string): Locator {
  return proof.getByRole("table", { name: `CI proof of ${path}`, exact: true });
}

export async function expectFileProofRows(
  proof: Locator,
  path: string,
  rows: readonly ProofRow[],
) {
  await expectProofTableRows(
    fileProofTable(proof, path),
    ["Scope", ...proofColumns.slice(1)],
    rows,
  );
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

// One figure of a file's single-row comparison, regardless of selection route.
export function fileComparisonCell(
  proof: Locator,
  path: string,
  column: ComparisonColumn,
): Locator {
  return fileProofTable(proof, path)
    .locator("tbody")
    .getByRole("cell")
    .nth(comparisonTableColumns.indexOf(column));
}
