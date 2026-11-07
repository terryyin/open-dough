// How Summary journeys read a selected entry's or folder's CI proof
// (../src/IntentScopeProof.tsx): the selected scope's own figures, a group
// read figure by figure under the homepage's column names
// (../src/IntentScopeFigures.tsx), above its one table of one row per
// immediate folder and file and any row for what no child row shows, read
// cell by cell under the homepage's columns; and each child's name control.
// The evidence labels around it: ./ciEvidenceLabelsPage.ts.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { proofColumns, type ProofRow } from "./intentCiProofPage.ts";

export function summaryRegion(intent: Locator): Locator {
  return intent.getByRole("region", { name: "Summary", exact: true });
}

// The Summary's CI proof table of the immediate folders and files of PATH.
export function scopeTable(summary: Locator, path: string): Locator {
  return summary.getByRole("table", {
    name: `CI proof of the immediate folders and files of ${path}`,
  });
}

// The Summary's group of PATH's own CI figures, above its table.
export function scopeFigures(summary: Locator, path: string): Locator {
  return summary.getByRole("group", { name: `CI proof of ${path}` });
}

// PATH's own figures read FIGURES under COLUMNS' names, in order.
async function expectOwnFigures(
  summary: Locator,
  path: string,
  columns: readonly string[],
  figures: readonly string[],
) {
  const group = scopeFigures(summary, path);
  await expect(group.getByRole("term")).toHaveText([...columns]);
  await expect(group.getByRole("definition")).toHaveText([...figures]);
}

// The rows of PATH's table, each its scope then its cells.
async function expectTableRows(
  summary: Locator,
  path: string,
  columns: readonly string[],
  rows: readonly (readonly string[])[],
) {
  const table = scopeTable(summary, path);
  await expect(table.getByRole("columnheader")).toHaveText([...columns]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [scope, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(scope ?? "");
    await expect(body.nth(at).getByRole("cell")).toHaveText(cells);
  }
}

export const scopeColumns = ["Scope", ...proofColumns.slice(1)];

// A story comparison's figure columns after the scope.
export const comparisonFigureColumns = [
  "Counts",
  "Baseline",
  "Branch",
  "Landed",
  "Parts",
] as const;

// A Summary's story comparison table: each child's story change under Change.
export const comparisonScopeColumns = [
  "Scope",
  "Change",
  ...comparisonFigureColumns,
] as const;

// A compared scope, its change (empty when the story leaves it unchanged),
// then its figures.
export type ComparisonScopeRow = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

// PATH's Summary reads OWN, PATH's own figures (written as a row naming PATH),
// in a group above a table with the homepage's columns, scoped, holding
// exactly ROWS in order: its children, then any outside row.
export async function expectScopeRows(
  summary: Locator,
  path: string,
  [own, ...rows]: readonly [ProofRow, ...ProofRow[]],
) {
  const [scope, ...figures] = own;
  expect(scope).toBe(path);
  await expectOwnFigures(summary, path, scopeColumns.slice(1), figures);
  await expectTableRows(summary, path, scopeColumns, rows);
}

// The same with a selected story's Baseline / Branch / Landed columns, the
// table's rows led by their Change.
export async function expectComparisonScopeRows(
  summary: Locator,
  path: string,
  [own, ...rows]: readonly ComparisonScopeRow[],
) {
  if (own === undefined) throw new Error(`no own figures of ${path}`);
  // The scope's own figures carry no Change.
  const [scope, , ...figures] = own;
  expect(scope).toBe(path);
  await expectOwnFigures(summary, path, comparisonFigureColumns, figures);
  await expectTableRows(summary, path, comparisonScopeColumns, rows);
}

// The control naming one immediate child in the Summary's table; a folder's
// name ends in `/`.
export function childName(summary: Locator, name: string): Locator {
  return summary
    .getByRole("table")
    .getByRole("rowheader")
    .getByRole("button", { name, exact: true });
}

// The child names the Summary's table offers, in order.
export async function expectChildNames(
  summary: Locator,
  names: readonly string[],
) {
  await expect(
    summary.getByRole("table").getByRole("rowheader").getByRole("button"),
  ).toHaveText(names);
}
