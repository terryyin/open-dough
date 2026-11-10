// Sortable column headers of an Intent CI figures table
// (../../src/CiProofTable.tsx, ../../src/ciProofSort.ts): each header is a
// button inside its column header; the sorted header alone carries
// `aria-sort` and shows its direction arrow.

import { expect, type Locator } from "@playwright/test";

export const sortHeader = (table: Locator, name: string) =>
  table.getByRole("columnheader", { name, exact: true });

export const sortButton = (table: Locator, name: string) =>
  sortHeader(table, name).getByRole("button", { name, exact: true });

// The body rows' scope names, top to bottom.
export const rowNames = (table: Locator) =>
  table.locator("tbody").getByRole("rowheader");

// NAME's header is sorted in DIRECTION, with its arrow showing it, and no
// other header carries `aria-sort`.
export async function expectSortedBy(
  table: Locator,
  name: string,
  direction: "ascending" | "descending",
  names?: readonly string[],
) {
  const header = sortHeader(table, name);
  await expect(header).toHaveAttribute("aria-sort", direction);
  await expectRenderedSortedBy(table, name, direction, names);
}

// A complete SSR render has installed the whole table, so its one native
// snapshot also establishes readiness. Live interactions keep the wait above.
export async function expectRenderedSortedBy(
  table: Locator,
  name: string,
  direction: "ascending" | "descending",
  names?: readonly string[],
) {
  const header = sortHeader(table, name);
  const semanticParts =
    names === undefined ? header : header.or(rowNames(table));
  // Playwright's :visible and toBeVisible use the same native visibility predicate.
  // Keep all arrows in the structural read too, so extra hidden arrows still fail.
  const parts = semanticParts.or(
    header.locator(".intent-ci-sort-mark svg:visible"),
  );
  await expect
    .poll(() =>
      parts.evaluateAll((nodes) => ({
        headers: nodes
          .filter(
            (node) => node.closest("thead") !== null && !node.matches("svg"),
          )
          .map((node) => ({
            tag: node.tagName,
            scope: node.getAttribute("scope"),
            role: node.getAttribute("role"),
            direction: node.getAttribute("aria-sort"),
            sortedHeaders: node
              .closest("table")
              ?.querySelectorAll("th[aria-sort]").length,
            marks: Array.from(
              node.querySelectorAll(".intent-ci-sort-mark"),
              (mark) => ({
                direction: mark.getAttribute("data-direction"),
                arrows: Array.from(mark.querySelectorAll("svg"), (svg) =>
                  svg.getAttribute("aria-hidden"),
                ),
              }),
            ),
          })),
        visibleArrows: nodes
          .filter((node) => node.matches("svg"))
          .map((node) => node.getAttribute("aria-hidden")),
        rows: nodes
          .filter((node) => node.closest("tbody") !== null)
          .map((node) =>
            node.textContent
              .replace(/[\u200b\u00ad]/g, "")
              .trim()
              .replace(/\s+/g, " "),
          ),
      })),
    )
    .toEqual({
      headers: [
        {
          tag: "TH",
          scope: "col",
          role: null,
          direction,
          sortedHeaders: 1,
          marks: [{ direction, arrows: ["true"] }],
        },
      ],
      visibleArrows: ["true"],
      rows: names ?? [],
    });
}

export async function expectUnsortedRows(
  table: Locator,
  names: readonly string[],
) {
  await expect
    .poll(() =>
      table.or(rowNames(table)).evaluateAll((nodes) =>
        nodes.map((node, at) =>
          at === 0
            ? {
                table: true,
                sortedHeaders: node.querySelectorAll("th[aria-sort]").length,
              }
            : node.textContent
                .replace(/[\u200b\u00ad]/g, "")
                .trim()
                .replace(/\s+/g, " "),
        ),
      ),
    )
    .toEqual([{ table: true, sortedHeaders: 0 }, ...names]);
}
