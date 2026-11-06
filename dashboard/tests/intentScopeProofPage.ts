// How Summary journeys read a selected entry's or folder's CI proof
// (../src/IntentScopeProof.tsx): its one table of the selected scope's row,
// one row per immediate folder and file, and any row for what no child row
// shows, read cell by cell under the homepage's columns; each child's name
// control; and the evidence lines around it.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { proofColumns, type ProofRow } from "./intentCiProofPage.ts";

export function summaryRegion(intent: Locator): Locator {
  return intent.getByRole("region", { name: "Summary", exact: true });
}

// The Summary's CI proof table for the scope at PATH.
export function scopeTable(summary: Locator, path: string): Locator {
  return summary.getByRole("table", {
    name: `CI proof of ${path} and its immediate folders and files`,
  });
}

export const scopeColumns = ["Scope", ...proofColumns.slice(1)];

export const comparisonScopeColumns = [
  "Scope",
  "Counts",
  "Baseline",
  "Branch",
  "Landed",
  "Parts",
] as const;

export type ComparisonScopeRow = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
];

// The scope table has the homepage's columns, scoped, and exactly ROWS in
// order: the scope's own row, its children, then any outside row.
export async function expectScopeRows(
  summary: Locator,
  path: string,
  rows: readonly ProofRow[],
) {
  const table = scopeTable(summary, path);
  await expect(table.getByRole("columnheader")).toHaveText(scopeColumns);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [scope, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(scope);
    await expect(body.nth(at).getByRole("cell")).toHaveText(cells);
  }
}

// The same table with a selected story's Baseline / Branch / Landed columns.
export async function expectComparisonScopeRows(
  summary: Locator,
  path: string,
  rows: readonly ComparisonScopeRow[],
) {
  const table = scopeTable(summary, path);
  await expect(table.getByRole("columnheader")).toHaveText([
    ...comparisonScopeColumns,
  ]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [scope, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(scope);
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
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

export function evidenceLine(summary: Locator): Locator {
  return summary.locator(".intent-summary-evidence");
}
