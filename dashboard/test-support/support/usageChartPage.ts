// Usage's chart name and the rendered positions of its task marks.
import type { Page } from "@playwright/test";
import { centreOf, historyChart } from "../historyChartPage.ts";

// The drawing's name over time or, with equal spacing, in task order.
export const usageChartName =
  /^Token index per finished task (by end date|in task order, equally spaced)$/;
export function usageChart(page: Page) {
  const chart = historyChart(
    page.getByRole("region", { name: "Token index trend", exact: true }),
    usageChartName,
  );
  return {
    // Each named mark's centre, in the order given.
    async markCentres(readouts: readonly string[]) {
      return Promise.all(
        readouts.map((readout) => centreOf(chart.mark(readout))),
      );
    },
  };
}
