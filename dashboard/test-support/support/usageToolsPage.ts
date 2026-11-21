// System settings → Usage's tool selection and each selected tool's summary:
// count, median and the notes naming its unit.
import type { Locator } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import type { historyChart } from "../historyChartPage.ts";

type UsageToolName = "Codex" | "Claude Code";

export function usageToolsView(
  view: Locator,
  trend: Locator,
  chart: ReturnType<typeof historyChart>,
) {
  const tool = (name: UsageToolName) =>
    view
      .getByRole("group", { name: "Tools", exact: true })
      .getByRole("checkbox", { name, exact: true });
  // One selected tool's summary; the only one when `name` is absent.
  const summary = (name?: UsageToolName) =>
    trend
      .getByRole("list", { name: "Selected tools", exact: true })
      .getByRole("listitem", name === undefined ? {} : { name, exact: true });
  // The rolling median line of the tool `name`, or the only one.
  const medianLine = (name?: UsageToolName) =>
    name === undefined
      ? chart.line
      : name === "Codex"
        ? chart.drawing.locator(
            ".history-chart-trend:not(.history-chart-trace-1)",
          )
        : chart.drawing.locator(".history-chart-trend.history-chart-trace-1");
  return {
    async showTool(name: UsageToolName, shown: boolean) {
      await tool(name).setChecked(shown);
      await expect(tool(name)).toBeChecked({ checked: shown });
    },
    // Which tools are selected, by name.
    async showsTools(selected: Readonly<Record<UsageToolName, boolean>>) {
      for (const [name, shown] of Object.entries(selected))
        await expect(tool(name as UsageToolName)).toBeChecked({
          checked: shown,
        });
    },
    // The cohort note's counts, such as "11 tasks · 1 partial · 1 unpriced".
    async showsCohortNote(words: string, name?: UsageToolName) {
      await expect(summary(name).locator(".usage-tool-count")).toHaveText(
        words,
      );
    },
    // The latest rolling median's figure, with its line drawn across some
    // width, even for a single value.
    async showsMedian(figure: string, name?: UsageToolName) {
      const median = summary(name).locator(".usage-median");
      await expect(median.locator("strong")).toHaveText(figure);
      await expect(median).toContainText("10-task rolling median");
      await expect(medianLine(name)).toHaveCount(1);
      await expect
        .poll(async () => (await medianLine(name).boundingBox())?.width ?? 0)
        .toBeGreaterThan(0);
    },
    // The rate-card update warnings, one per estimated model, in order.
    async showsRateCardWarnings(
      words: readonly string[],
      name?: UsageToolName,
    ) {
      await expect(summary(name).locator(".usage-rate-warning")).toHaveText([
        ...words,
      ]);
    },
    // No figure and no line, with the words saying why.
    async showsNoMedian(words: string, name?: UsageToolName) {
      const median = summary(name).locator(".usage-median");
      await expect(median.locator("strong")).toHaveText("—");
      await expect(median).toContainText(words);
      await expect(medianLine(name)).toHaveCount(0);
    },
    // The selected tools' notes, in tool order: each tariff label, then the
    // work that tool's usage leaves out, when it names any.
    async showsToolNotes(notes: readonly string[]) {
      await expect(trend.locator(".usage-tool-note")).toHaveText(notes);
    },
  };
}
