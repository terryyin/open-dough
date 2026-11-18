// Usage's chart key and each tool summary's heading swatch, observed against
// the marks the chart draws for that tool.
import type { Locator, Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { historyChart } from "../historyChartPage.ts";
import { shapeOf, usageChartName } from "./usageChartPage.ts";
import type { UsageToolName } from "./usageToolsPage.ts";

const second = ".history-chart-trace-1";
const drawnStyle = (mark: Locator) =>
  mark.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fill: style.fill,
      stroke: style.stroke,
      dash: style.strokeDasharray,
    };
  });

export function usageLegend(page: Page) {
  const chart = historyChart(
    page.getByRole("region", { name: "Token index trend", exact: true }),
    usageChartName,
  );
  const key = page.getByRole("list", { name: "Chart key", exact: true });
  const ofTool = (name: UsageToolName) =>
    name === "Codex" ? `:not(${second})` : second;
  // What the chart draws for the tool `name`: a task, a partial task, a median.
  const drawn = (name: UsageToolName) => ({
    task: chart.measured.and(page.locator(ofTool(name))).first(),
    partial: chart.partial.and(page.locator(ofTool(name))).first(),
    median: chart.drawing.locator(`.history-chart-trend${ofTool(name)}`),
  });
  const expectSameMark = async (shown: Locator, mark: Locator) => {
    expect(await shapeOf(shown)).toBe(await shapeOf(mark));
    expect(await drawnStyle(shown)).toEqual(await drawnStyle(mark));
  };
  return {
    // The key names each shown tool's task, partial and median entries, in
    // order, each drawn as the chart draws that tool's marks.
    async showsKeyFor(names: readonly UsageToolName[]) {
      await expect(key.getByRole("listitem")).toHaveText(
        names.flatMap((name) => [
          `${name} task`,
          `${name} partial`,
          `${name} rolling median (↑ above scale)`,
        ]),
      );
      for (const name of names) {
        const marks = drawn(name);
        const entry = (words: string) =>
          key
            .getByRole("listitem")
            .filter({ hasText: new RegExp(`^\\s*${name} ${words}`) })
            .locator("svg > *");
        await expectSameMark(entry("task"), marks.task);
        await expectSameMark(entry("partial"), marks.partial);
        expect(await drawnStyle(entry("rolling median"))).toEqual(
          await drawnStyle(marks.median),
        );
      }
    },
    // Each tool summary's heading swatch is that tool's drawn task mark.
    async showsSummarySwatches(names: readonly UsageToolName[]) {
      for (const name of names) {
        const swatch = page
          .getByRole("list", { name: "Selected tools", exact: true })
          .getByRole("listitem", { name, exact: true })
          .locator("h4 svg > *");
        await expectSameMark(swatch, drawn(name).task);
      }
    },
  };
}
