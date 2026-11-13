// Browser observations of one CI comparison, shared by integrated, live-mounted
// and static-rendered scenarios. Expected words and endpoint order belong to callers.
import type { Locator } from "@playwright/test";
import { proofTableRowsNamed } from "./proofTablePage.ts";
import {
  comparisonTableColumns,
  type ComparisonColumn,
} from "./intentScopeProofPage.ts";

export function comparisonReading(panel: Locator) {
  return {
    identities: panel.locator(".intent-ci-comparison-identity"),
    wallTimes: panel.locator(".intent-ci-comparison-wall"),
    timesWithoutWaits: panel.locator(".intent-ci-comparison-without-waits"),
    activeComparison: panel.locator(".intent-ci-comparison-active"),
    fallbackReason: panel.locator(".intent-ci-comparison-active-reason"),
    overallCounts: panel.locator(".intent-ci-comparison-overall-counts"),
    overallTiming: panel.locator(".intent-ci-comparison-overall-timing"),
    overallWallTime: panel.locator(".intent-ci-comparison-overall-wall"),
    entryEvidence: panel.locator(".intent-ci-comparison-entries"),
    gap: panel.locator(".intent-ci-gap"),
    endpointTable: panel.getByRole("table", {
      name: "Baseline, branch and landed CI builds with timing",
    }),
    entryTable: panel.getByRole("table", {
      name: "CI entry timing comparison",
    }),
  };
}

// One named endpoint; callers can retain row order assertions through comparisonReading.
export function comparisonBuildReading(panel: Locator, name: string) {
  const row = panel.getByRole("row").filter({
    has: panel.page().getByRole("rowheader", { name, exact: true }),
  });
  const reading = comparisonReading(row);
  return {
    identity: reading.identities,
    wallTime: reading.wallTimes,
    timeWithoutWaits: reading.timesWithoutWaits,
  };
}

// One entry's displayed figure, with the expected words kept at the call site.
export function comparisonEntryCell(
  panel: Locator,
  entry: string,
  column: ComparisonColumn,
): Locator {
  return proofTableRowsNamed(comparisonReading(panel).entryTable, entry)
    .getByRole("cell")
    .nth(comparisonTableColumns.indexOf(column));
}
