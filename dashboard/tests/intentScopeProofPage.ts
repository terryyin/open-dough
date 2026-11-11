// How Summary journeys read a selected entry's or folder's CI proof
// (../src/IntentScopeProof.tsx): the selected scope's own figures, a group
// read figure by figure, including parts completeness
// (../src/IntentScopeFigures.tsx), above its one table of one row per
// immediate folder and file and any row for what no child row shows, read
// cell by cell under the homepage's columns; and each child's name control.
// The evidence labels around it: ./ciEvidenceLabelsPage.ts.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { expectProofTableRows, proofTableRowsNamed } from "./proofTablePage.ts";
export { expectProofTableRows } from "./proofTablePage.ts";
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
  // Native parent and descendants are in DOM order. Keeping the parent in the
  // raw array detects missing or duplicate empty containers while polling.
  const parts = group
    .or(group.getByRole("term"))
    .or(group.getByRole("definition"));
  await expect
    .poll(() =>
      parts.evaluateAll((nodes) =>
        nodes.map((node, at) =>
          at === 0
            ? { parent: true }
            : {
                tag: node.tagName,
                role: node.getAttribute("role"),
                text: node.textContent
                  .replace(/[\u200b\u00ad]/g, "")
                  .trim()
                  .replace(/\s+/g, " "),
              },
        ),
      ),
    )
    .toEqual([
      { parent: true },
      ...columns.flatMap((text, at) => [
        { tag: "DT", role: null, text },
        { tag: "DD", role: null, text: figures[at] },
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
  await expectScopeTableRows(summary, path, rows);
}

export async function expectScopeUnitFigures(
  summary: Locator,
  path: string,
  unit: string,
  figures: readonly string[],
) {
  await expectOwnFigures(
    summary,
    `${path}: ${unit}`,
    ["Counts", "Test execution time", "Parts"],
    figures,
  );
}

export async function expectScopeTableRows(
  summary: Locator,
  path: string,
  rows: readonly ProofRow[],
) {
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

// The Summary rows of PATH's table named NAME read ROWS: Change then cells.
export async function expectNamedScopeRows(
  summary: Locator,
  path: string,
  name: string,
  rows: readonly (readonly string[])[],
) {
  const named = proofTableRowsNamed(scopeTable(summary, path), name);
  await expect(named).toHaveCount(rows.length);
  for (const [at, cells] of rows.entries()) {
    await expect(named.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}

// The own figures group NAME (`CI proof of <path>: <unit>`) reads FIGURES,
// Parts last.
export async function expectNamedScopeFigures(
  summary: Locator,
  name: string,
  figures: readonly string[],
) {
  await expect(
    summary.getByRole("group", { name, exact: true }).getByRole("definition"),
  ).toHaveText([...figures]);
}

export type ComparisonColumn = (typeof comparisonTableColumns)[number];

// A selected scope's own comparison figure, above the child table.
export function scopeComparisonFigure(
  summary: Locator,
  path: string,
  column: ComparisonColumn,
): Locator {
  return scopeFigures(summary, path)
    .getByRole("definition")
    .nth(comparisonTableColumns.indexOf(column));
}

// One child's comparison figure; the Change cell precedes the shared columns.
export function scopeComparisonCell(
  summary: Locator,
  path: string,
  child: string,
  column: ComparisonColumn,
): Locator {
  return proofTableRowsNamed(scopeTable(summary, path), child)
    .getByRole("cell")
    .nth(1 + comparisonTableColumns.indexOf(column));
}
