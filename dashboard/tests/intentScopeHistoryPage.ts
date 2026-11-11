// Collected execution history of one selected scope. Expected readings and
// the requests, store changes and native input that cause them belong to scenarios.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

export const scopeHistory = (scope: Locator | Page) =>
  scope.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });

export const scopeHistoryUnit = (history: Locator, unit: string) =>
  history.getByRole("region", { name: unit, exact: true });

export function scopeHistoryReading(history: Locator) {
  const evidence = history.getByRole("list", {
    name: "Test execution history evidence",
  });
  const reference = history.locator(".intent-ci-history-reference");
  return {
    evidence,
    rows: evidence.getByRole("listitem"),
    extent: history.locator(".intent-ci-history-extent"),
    endpointTime: history.locator("time").first(),
    answeredAt: history
      .locator("p")
      .filter({ hasText: /^History read/ })
      .locator("time"),
    disclosure: history.locator("summary"),
    charts: history.getByRole("img"),
    points: history.locator(".intent-ci-history-point"),
    unselectedPoints: history.locator("circle.intent-ci-history-point"),
    line: history.locator(".intent-ci-history-line"),
    selected: history.locator(".intent-ci-history-selected"),
    selectedLabels: history.locator("svg text.intent-ci-history-selected"),
    selectedGap: history
      .locator("svg")
      .getByText("Selected gap", { exact: true }),
    reference,
    referenceLine: reference.locator("line"),
    failure: history.getByRole("alert"),
    retry: history.getByRole("button", { name: "Retry history" }),
  };
}

export const scopeHistoryChart = (
  history: Locator,
  unit: string,
  endpoint: "selected landing" | "observed trunk endpoint" = "selected landing",
) =>
  history.getByRole("img", {
    name: `Test execution time for ${unit} by build date; ${endpoint} marked`,
  });

// Complete dated evidence, independently expected by the scenario. Native
// keyboard traversal and collection/recovery actions stay outside this read.
export async function expectScopeHistoryEvidence(
  history: Locator,
  expected: {
    readonly selected: string;
    readonly absent: readonly string[];
    readonly extent: string;
    readonly rows: readonly string[];
    readonly chartUnits: readonly string[];
    readonly selectedMarks: readonly string[];
  },
) {
  const reading = scopeHistoryReading(history);
  await expect(history).toContainText(expected.selected);
  await expect(history).toContainText(expected.extent);
  await expect(reading.rows).toHaveText([...expected.rows]);
  for (const absent of expected.absent)
    await expect(history).not.toContainText(absent);
  for (const unit of expected.chartUnits)
    await expect(scopeHistoryChart(history, unit)).toBeVisible();
  await expect(reading.selectedLabels).toHaveText([...expected.selectedMarks]);
  await expect(reading.rows).toHaveCount(expected.rows.length);
}
