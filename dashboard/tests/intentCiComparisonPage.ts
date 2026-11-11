// Browser observations of one CI comparison, shared by integrated, live-mounted
// and static-rendered scenarios. Expected words and endpoint order belong to callers.
import type { Locator } from "@playwright/test";

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
