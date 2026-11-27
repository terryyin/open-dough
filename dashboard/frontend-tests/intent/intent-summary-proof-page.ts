import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { ciReadingText } from "./intent-attempt-proof-page.ts";
import { pressLocationName } from "./intent-ci-homepage-page.ts";
import { fileLayout } from "./intent-file-layout-page.ts";

const columns = ["Scope", "Counts", "Test execution time"] as const;
type ScopeRow = readonly [name: string, counts: string, executionTime: string];

export const summaryRegion = () =>
  page.getByRole("region", { name: "Summary", exact: true });

export async function showsSummaryPath(summary: Locator, path: string) {
  await expect.poll(() => summaryPath(summary)).toBe(path);
}

function summaryPath(summary: Locator) {
  return ciReadingText(
    summary.query()?.querySelector(".intent-summary-path")?.textContent,
  );
}

// The Summary of the location at PATH. The comparison mount selects that
// location in its file tree. The Intent page presses the location's name and
// uncovers the Summary where Files lies over it as a drawer.
export async function openSummary(path: string) {
  const summary = summaryRegion();
  const onIntentPage =
    page.getByRole("main", { name: "Intent", exact: true }).query() !== null;
  if (!onIntentPage) {
    if (summaryPath(summary) !== path) {
      const name = page
        .getByRole("navigation", { name: "Intent files", exact: true })
        .getByRole("button", { name: new RegExp(`^${path}([,\\s]|$)`) });
      await expect.element(name).toBeVisible();
      (name.element() as HTMLElement).click();
    }
    await showsSummaryPath(summary, path);
    return summary;
  }
  await pressLocationName(path);
  await showsSummaryPath(summary, path);
  await fileLayout().uncoverReader();
  return summary;
}

export const childName = (summary: Locator, name: string) =>
  summary.getByRole("button", { name, exact: true });

export const scopeTable = (summary: Locator, path: string) =>
  summary.getByRole("table", {
    name: `CI proof of the immediate folders and files of ${path}`,
    exact: true,
  });

export const scopeFigures = (summary: Locator, path: string) =>
  summary.getByRole("group", { name: `CI proof of ${path}`, exact: true });

export async function expectScopeRows(
  summary: Locator,
  [[path, ...figures], ...rows]: readonly [
    readonly [...ScopeRow, parts: string],
    ...ScopeRow[],
  ],
) {
  await expectOwnScopeFigures(summary, path, figures);

  await expectProofTableRows(scopeTable(summary, path), columns, rows);
}

export async function expectProofTableRows(
  table: Locator,
  headings: readonly string[],
  rows: readonly (readonly [name: string, ...cells: string[]])[],
) {
  const parts = table
    .or(table.getByRole("columnheader"))
    .or(table.getByRole("row"))
    .or(table.getByRole("rowheader"))
    .or(table.getByRole("cell"));
  const expected = (
    tag: string,
    scope: string | null,
    text: string | null,
  ) => ({ tag, scope, role: null, text });
  await expect
    .poll(() =>
      parts
        .elements()
        .filter(
          (node) =>
            node.tagName === "TABLE" || node.matches("thead th, tbody *"),
        )
        .map((node) => ({
          tag: node.tagName,
          scope: node.getAttribute("scope"),
          role: node.getAttribute("role"),
          text: node.matches("table, tr")
            ? null
            : ciReadingText(node.textContent),
        })),
    )
    .toEqual([
      expected("TABLE", null, null),
      ...headings.map((column) => expected("TH", "col", column)),
      ...rows.flatMap(([name, ...cells]) => [
        expected("TR", null, null),
        expected("TH", "row", name),
        ...cells.map((text) => expected("TD", null, text)),
      ]),
    ]);
}

export async function expectOwnScopeFigures(
  summary: Locator,
  path: string,
  figures: readonly string[],
  labels: readonly string[] = [...columns.slice(1), "Parts"],
) {
  const own = scopeFigures(summary, path);
  await expect
    .poll(() =>
      own
        .or(own.getByRole("term"))
        .or(own.getByRole("definition"))
        .elements()
        .map((node) => ({
          tag: node.tagName,
          role: node.getAttribute("role"),
          text:
            node.getAttribute("role") === "group"
              ? null
              : ciReadingText(node.textContent),
        })),
    )
    .toEqual([
      { tag: "DIV", role: "group", text: null },
      ...labels.flatMap((text, index) => [
        { tag: "DT", role: null, text },
        { tag: "DD", role: null, text: figures[index] },
      ]),
    ]);
}

export const entryTime = (summary: Locator, path: string) =>
  scopeFigures(summary, path).getByRole("definition").nth(1);

export async function childTime(summary: Locator, path: string, child: string) {
  const table = scopeTable(summary, path);
  const header = table.getByRole("rowheader", { name: child, exact: true });
  await expect.element(header).toBeVisible();
  const row = header.element().closest("tr");
  if (row === null) throw new Error(`No summary row for ${child}`);
  return page.elementLocator(row).getByRole("cell").nth(1);
}

export function figuresAboveTable(summary: Locator, path: string) {
  return (
    scopeFigures(summary, path).element().getBoundingClientRect().bottom <=
    scopeTable(summary, path).element().getBoundingClientRect().top
  );
}

const sortHeader = (table: Locator, name: string) =>
  table.getByRole("columnheader", { name, exact: true });

export const sortButton = (table: Locator, name: string) =>
  sortHeader(table, name).getByRole("button", { name, exact: true });

// The control's own click or change handler. These handlers are what the
// comparison acts on; pointer travel is not part of that behavior.
export function press(control: Locator) {
  (control.element() as HTMLElement).click();
}

function rowNames(table: Locator) {
  return table
    .getByRole("rowheader")
    .elements()
    .map((row) => ciReadingText(row.textContent));
}

export async function expectUnsortedRows(
  table: Locator,
  rows: readonly string[],
) {
  await expect
    .poll(() => ({
      sortedHeaders: table.query()?.querySelectorAll("th[aria-sort]").length,
      rows: rowNames(table),
    }))
    .toEqual({ sortedHeaders: 0, rows });
}

export async function expectSortedBy(
  table: Locator,
  column: string,
  direction: "ascending" | "descending",
  rows: readonly string[],
) {
  const header = sortHeader(table, column);
  await expect.element(header).toHaveAttribute("aria-sort", direction);
  await expect
    .poll(() => {
      const th = header.element();
      const marks = [...th.querySelectorAll(".intent-ci-sort-mark")];
      const arrows = [...th.querySelectorAll(".intent-ci-sort-mark svg")];
      return {
        tag: th.tagName,
        scope: th.getAttribute("scope"),
        role: th.getAttribute("role"),
        sortedHeaders: table.element().querySelectorAll("th[aria-sort]").length,
        directions: marks.map((mark) => mark.getAttribute("data-direction")),
        arrowLabels: arrows.map((svg) => svg.getAttribute("aria-hidden")),
        visibleArrows: arrows.filter((svg) => svg.checkVisibility()).length,
        rows: rowNames(table),
      };
    })
    .toEqual({
      tag: "TH",
      scope: "col",
      role: null,
      sortedHeaders: 1,
      directions: [direction],
      arrowLabels: ["true"],
      visibleArrows: 1,
      rows,
    });
}
