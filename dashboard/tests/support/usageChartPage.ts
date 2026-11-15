// Focused drawing observations for Usage's shared history chart.
import type { Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { centreOf, expectMarkOver, historyChart } from "../historyChartPage.ts";
import { tokenColour } from "../pageColours.ts";
export function usageChart(page: Page) {
  const chart = historyChart(
    page.getByRole("region", { name: "Token index trend", exact: true }),
    "Token index per finished task by end date",
  );
  const large = chart.drawing.locator(".history-chart-overflow");
  return {
    async ordinarySeparation() {
      const first = await centreOf(chart.measured.nth(0));
      const second = await centreOf(chart.measured.nth(1));
      return Math.abs(first.y - second.y);
    },
    async showsLarge(readouts: readonly string[], labels: readonly string[]) {
      await expect(large).toHaveCount(readouts.length);
      await expect(large.locator("text")).toHaveText([...labels]);
      for (const [at, readout] of readouts.entries()) {
        const shape = large.nth(at).locator("path");
        await expectMarkOver(chart, readout, shape);
        await expect(shape).toHaveAttribute("d", /l10 10 m0 -10 l-10 10$/);
        expect(
          await shape.evaluate((element) => getComputedStyle(element).stroke),
        ).toBe(await tokenColour(page, "--problem"));
        expect((await centreOf(shape)).y).toBeLessThan(
          (await centreOf(chart.grid.first())).y,
        );
      }
    },
    async coincidentMarks(readouts: readonly string[]) {
      const points = await Promise.all(
        readouts.map((readout) => centreOf(chart.mark(readout))),
      );
      expect(points[0]?.x).toBe(points[1]?.x);
      expect(
        Math.abs((points[0]?.y ?? 0) - (points[1]?.y ?? 0)),
      ).toBeGreaterThanOrEqual(40);
    },
    async hasAxis(labels: readonly string[]) {
      await expect(chart.axisLabels).toHaveText([...labels]);
    },
    async showsOrdinary(count: number) {
      await expect(chart.measured).toHaveCount(count);
    },
    async showsNote(words: string) {
      await expect(page.getByText(words, { exact: true })).toBeVisible();
    },
    async sameDateAsLastOrdinary() {
      expect((await centreOf(large.first().locator("path"))).x).toBeCloseTo(
        (await centreOf(chart.measured.last())).x,
        1,
      );
    },
  };
}
