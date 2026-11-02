// How the summary proof-cost specs (`./intent-summary-proof-cost.spec.ts`,
// `./intent-summary-slowest.spec.ts`) read an Intent summary: its summed
// lines, child rows, and slowest scenarios list.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

export function slowestList(summary: Locator): Locator {
  return summary.getByRole("table", { name: "Slowest scenarios" });
}

export const zeroDuration = /\b0(?:\.0)? m?s\b/;
export const sumLine = "Summed duration of last successful proof";
export const notElapsed =
  "A sum of separate scenario observations, retries included, not a run's elapsed time.";

export function childRows(summary: Locator) {
  return summary
    .getByRole("list", { name: "Summary by folder and file" })
    .locator(":scope > li");
}

// The slowest list's rows, each as its cells joined by " · ": scenario, file,
// outcome, duration, observed, commit, file version.
export async function expectSlowest(
  summary: Locator,
  expected: readonly string[],
) {
  const list = slowestList(summary);
  await expect(list.locator("caption")).toHaveText("Slowest scenarios");
  const rows = list.locator("tbody tr");
  await expect(rows).toHaveCount(expected.length);
  for (const [at, cells] of expected.entries()) {
    await expect(rows.nth(at).locator("th, td")).toHaveText(cells.split(" · "));
  }
}

export async function expectChildren(
  summary: Locator,
  expected: readonly (readonly [string, string])[],
) {
  const rows = childRows(summary);
  await expect(rows.locator(":scope > code")).toHaveText(
    expected.map(([name]) => name),
  );
  for (const [at, [, line]] of expected.entries()) {
    await expect(rows.nth(at)).toContainText(line);
  }
}
