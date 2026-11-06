// Assert Intent's CI entry timing comparison table
// (../../src/IntentCiComparison.tsx) shows the given Entry / Counts /
// Baseline / Branch / Landed / Parts cells.

import { expect, type Locator } from "@playwright/test";

const entryColumns = [
  "Entry",
  "Counts",
  "Baseline",
  "Branch",
  "Landed",
  "Parts",
] as const;

export async function expectCiComparisonEntryRows(
  panel: Locator,
  rows: readonly (readonly [string, string, string, string, string, string])[],
) {
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expect(table.getByRole("columnheader")).toHaveText([...entryColumns]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [entry, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(entry);
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}
