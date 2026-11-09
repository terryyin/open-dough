// How Summary journeys read a selected entry's or folder's CI proof
// (../src/IntentScopeProof.tsx): the selected scope's own figures, a group
// read figure by figure, including parts completeness
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
  await group.waitFor({ state: "attached" });
  const parts = group.getByRole("term").or(group.getByRole("definition"));
  await expect
    .poll(() =>
      parts.evaluateAll((nodes) =>
        nodes.map((node) => ({
          tag: node.tagName,
          role: node.getAttribute("role"),
          text: node.textContent
            .replace(/[\u200b\u00ad]/g, "")
            .trim()
            .replace(/\s+/g, " "),
        })),
      ),
    )
    .toEqual(
      columns.flatMap((text, at) => [
        { tag: "DT", role: null, text },
        { tag: "DD", role: null, text: figures[at] },
      ]),
    );
}

// One observation of a native proof table's semantic parts. Role locators
// exclude hidden output; tags/scopes preserve column/row-header/cell identity.
// Expected words remain the caller's independent columns and rows.
export async function expectProofTableRows(
  table: Locator,
  columns: readonly string[],
  rows: readonly (readonly string[])[],
) {
  await table.waitFor({ state: "attached" });
  const body = table.locator("tbody").getByRole("row");
  const parts = table
    .getByRole("columnheader")
    .or(body)
    .or(body.getByRole("rowheader"))
    .or(body.getByRole("cell"));
  const expected = (
    tag: string,
    scope: string | null,
    text: string | null,
  ) => ({
    tag,
    scope,
    role: null,
    text,
  });
  await expect
    .poll(() =>
      parts.evaluateAll((nodes) =>
        nodes.map((node) => ({
          tag: node.tagName,
          scope: node.getAttribute("scope"),
          role: node.getAttribute("role"),
          text:
            node.tagName === "TR"
              ? null
              : node.textContent
                  .replace(/[\u200b\u00ad]/g, "")
                  .trim()
                  .replace(/\s+/g, " "),
        })),
      ),
    )
    .toEqual([
      ...columns.map((text) => expected("TH", "col", text)),
      ...rows.flatMap(([scope, ...cells]) => [
        expected("TR", null, null),
        expected("TH", "row", scope ?? ""),
        ...cells.map((text) => expected("TD", null, text)),
      ]),
    ]);
}

export const scopeColumns = ["Scope", ...proofColumns.slice(1)];

// A story comparison's figure columns after the scope.
export const comparisonTableColumns = [
  "Counts",
  "Baseline",
  "Branch",
  "Landed",
] as const;

const comparisonFigureColumns = [...comparisonTableColumns, "Parts"] as const;
const comparedTableColumns = [
  "Counts",
  "Baseline",
  "Branch vs baseline",
  "Landed vs baseline",
] as const;

// A Summary's story comparison table: each child's story change under Change.
export const comparisonScopeColumns = [
  "Scope",
  "Change",
  ...comparedTableColumns,
] as const;

// A compared scope, its change (empty when the story leaves it unchanged),
// then its figures.
type ComparisonScopeRow = readonly [
  scope: string,
  change: string,
  counts: string,
  baseline: string,
  branch: string,
  landed: string,
];

// The selected scope's own figures also include Parts.
export type ComparisonScopeRows = readonly [
  readonly [...ComparisonScopeRow, parts: string],
  ...ComparisonScopeRow[],
];

// PATH's Summary reads OWN, PATH's own figures (written as a row naming PATH),
// in a group above a table with the homepage's columns, scoped, holding
// exactly ROWS in order: its children, then any outside row.
export async function expectScopeRows(
  summary: Locator,
  path: string,
  [own, ...rows]: readonly [readonly [...ProofRow, string], ...ProofRow[]],
) {
  const [scope, ...figures] = own;
  expect(scope).toBe(path);
  await expectOwnFigures(
    summary,
    path,
    [...scopeColumns.slice(1), "Parts"],
    figures,
  );
  await expectProofTableRows(scopeTable(summary, path), scopeColumns, rows);
}

// The same with a selected story's Baseline / Branch / Landed columns, the
// table's rows led by their Change.
export async function expectComparisonScopeRows(
  summary: Locator,
  path: string,
  [own, ...rows]: ComparisonScopeRows,
) {
  // The scope's own figures carry no Change.
  const [scope, , ...figures] = own;
  expect(scope).toBe(path);
  await expectOwnFigures(summary, path, comparisonFigureColumns, figures);
  await expectProofTableRows(
    scopeTable(summary, path),
    comparisonScopeColumns,
    rows,
  );
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
