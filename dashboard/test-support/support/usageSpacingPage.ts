// System settings → Usage's equal spacing: its control, the horizontal axis
// it names, and where each tool's median and above-scale median stand.
import type { Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { centreOf, historyChart } from "../historyChartPage.ts";
import { usageChartName } from "./usageChartPage.ts";
import type { UsageToolName } from "./usageToolsPage.ts";

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
    // Turns equal spacing on or off by pointer or, once focused, Space.
    async space(on: boolean, by: "pointer" | "keyboard" = "pointer") {
      if (by === "keyboard") {
        await control.focus();
        if ((await control.isChecked()) !== on)
          await page.keyboard.press("Space");
      } else await control.setChecked(on);
      await expect(control).toBeChecked({ checked: on });
    },
    async showsSpacing(on: boolean) {
      await expect(control).toBeChecked({ checked: on });
    },
    // The control has keyboard focus, visibly outlined.
    async showsFocusedSpacing() {
      await expect(control).toBeFocused();
      await expect(control).not.toHaveCSS("outline-style", "none");
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
    // The x of the tool's one-level median: the centre of its short level.
    async medianX(name: UsageToolName) {
      const line = chart.drawing.locator(
        name === "Codex"
          ? ".history-chart-trend:not(.history-chart-trace-1)"
          : ".history-chart-trend.history-chart-trace-1",
      );
      return (await centreOf(line)).x;
    },
    // The x of the first above-scale median's ↑ mark.
    async overflowMedianX() {
      return (
        await centreOf(
          chart.drawing.locator(".history-chart-trend-overflow path").first(),
        )
      ).x;
    },
  };
}
