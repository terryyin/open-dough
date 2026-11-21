// System settings → Usage's equal spacing and the horizontal axis it names.
import type { Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { historyChart } from "../historyChartPage.ts";
import { usageChartName } from "./usageChartPage.ts";

const taskOrderWords = "Task order, earliest first";

export function usageSpacing(page: Page) {
  const trend = page.getByRole("region", {
    name: "Token index trend",
    exact: true,
  });
  const chart = historyChart(trend, usageChartName);
  const control = trend.getByRole("checkbox", {
    name: "Equal spacing",
    exact: true,
  });
  const dateRow = chart.drawing.locator(":scope > text");
  return {
    async space(on: boolean) {
      await control.setChecked(on);
      await expect(control).toBeChecked({ checked: on });
    },
    // Equal spacing names the horizontal axis as task order, not dates.
    async showsTaskOrderAxis() {
      await expect(chart.drawing).toHaveAccessibleName(
        "Token index per finished task in task order, equally spaced",
      );
      await expect(dateRow).toHaveText([taskOrderWords]);
    },
    async showsDateAxis(dates: readonly string[]) {
      await expect(chart.drawing).toHaveAccessibleName(
        "Token index per finished task by end date",
      );
      await expect(dateRow).toHaveText([...dates]);
    },
  };
}
