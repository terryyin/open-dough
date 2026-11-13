// Collected execution history of one selected scope
// (../src/IntentScopeTimingHistory.tsx) as a reader meets it: its brief
// status, what it measures, the Test cases / Test file choice, the shared
// compact readout (./priorBuildReferencePage.ts) and chart
// (./ciHistoryChartPage.ts) of the chosen unit, and its freshness, failure and
// retry. Expected readings and the requests, store changes and native input
// that cause them belong to scenarios.
import type { Locator, Page } from "@playwright/test";
import { historyChart, type InspectBy } from "./ciHistoryChartPage.ts";
import { expect } from "./dashboardTest.ts";
import { compactReadout } from "./priorBuildReferencePage.ts";

export const scopeHistory = (scope: Locator | Page) =>
  scope.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });

// The chosen unit's readout and chart, named by its unit: "Test cases".
export const scopeHistoryUnit = (history: Locator, unit: string) =>
  history.getByRole("region", { name: unit, exact: true });

export function scopeHistoryReading(history: Locator) {
  const units = history.getByRole("group", {
    name: "Timing unit",
    exact: true,
  });
  return {
    status: history.locator(".intent-ci-history-status"),
    measure: history
      .locator(".intent-ci-history-note")
      .filter({ hasText: "Cumulative test execution time" }),
    endpointTime: history.locator("time").first(),
    answeredAt: history
      .locator("p")
      .filter({ hasText: /^History read/ })
      .locator("time"),
    units,
    unit: (choice: string) =>
      units.getByRole("button", { name: choice, exact: true }),
    charts: history.getByRole("img"),
    failure: history.getByRole("alert"),
    retry: history.getByRole("button", { name: "Retry history" }),
    ...compactReadout(history),
  };
}

// The chart of `unit` ("test cases", "test files") through the endpoint.
export const scopeHistoryChart = (
  history: Locator,
  unit: string,
  endpoint: "selected landing" | "observed trunk endpoint" = "selected landing",
) =>
  historyChart(
    history,
    `Test execution time for ${unit} by build date; ${endpoint} marked`,
  );

// Choose a timing unit by pointer, touch, or keyboard focus and Enter; the
// choice is then the pressed one.
export async function chooseTimingUnit(
  history: Locator,
  choice: string,
  by: InspectBy | "keyboard",
) {
  const button = scopeHistoryReading(history).unit(choice);
  if (by === "pointer") await button.click();
  else if (by === "touch") await button.tap();
  else {
    await button.focus();
    await history.page().keyboard.press("Enter");
  }
  await expect(button).toHaveAttribute("aria-pressed", "true");
}

// The compact readout's three lines as a scenario expects them; no change
// line when `change` is omitted.
export async function expectScopeReadout(
  history: Locator,
  expected: {
    readonly selected: string;
    readonly average: string;
    readonly change?: string;
  },
) {
  const reading = scopeHistoryReading(history);
  await expect(reading.selected).toHaveText(expected.selected);
  await expect(reading.average).toHaveText(expected.average);
  if (expected.change === undefined)
    await expect(reading.change).toHaveCount(0);
  else await expect(reading.change).toHaveText(expected.change);
}
