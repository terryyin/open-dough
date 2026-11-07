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
) {
  await expect(sortHeader(table, name)).toHaveAttribute("aria-sort", direction);
  await expect(table.locator("th[aria-sort]")).toHaveCount(1);
  const mark = sortHeader(table, name).locator(".intent-ci-sort-mark");
  await expect(mark).toHaveAttribute("data-direction", direction);
  await expect(mark.locator("svg")).toBeVisible();
  // The arrow is decorative: aria-sort announces the direction.
  await expect(mark.locator("svg")).toHaveAttribute("aria-hidden", "true");
}
