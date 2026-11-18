// Focused drawing observations for Usage's shared history chart.
import type { Locator, Page } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { centreOf, expectMarkOver, historyChart } from "../historyChartPage.ts";
import {
  expectChartMarkContrast,
  expectReadableContrast,
} from "../accessibleReading.ts";
import { expectNoSidewaysScrollAndWholeText } from "../pageLayout.ts";
import { tokenColour } from "../pageColours.ts";

// A drawn mark's shape: a circle, or how many corners its outline turns.
const shapeOf = (mark: Locator) =>
  mark.evaluate((element) => {
    if (element.tagName === "circle") return "circle";
    const outline =
      element.getAttribute("points") ?? element.getAttribute("d") ?? "";
    const corners = outline.match(/-?[\d.]+[ ,]-?[\d.]+/g) ?? [];
    return `${String(corners.length)} corners`;
  });
// The drawing's name over time or, with equal spacing, in task order.
export const usageChartName =
  /^Token index per finished task (by end date|in task order, equally spaced)$/;
export function usageChart(page: Page) {
  const chart = historyChart(
    page.getByRole("region", { name: "Token index trend", exact: true }),
    usageChartName,
  );
  const large = chart.drawing.locator(".history-chart-overflow");
  return {
    async showsLatestMedian(value: string) {
      await expect(page.locator(".usage-median strong")).toHaveText(value);
    },
    async showsMedianOverflow(
      labels: readonly string[],
      readouts: readonly string[],
    ) {
      const overflow = chart.drawing.locator(".history-chart-trend-overflow");
      await expect(overflow.locator("text")).toHaveText([...labels]);
      const values = chart.box.getByRole("list", {
        name: "Above-scale trend values",
      });
      await expect(values.getByRole("listitem")).toHaveText([...readouts]);
      await expect(values.getByRole("button")).toHaveCount(0);
      for (const text of await overflow.locator("text").all()) {
        await expect(text).toBeVisible();
        await expectReadableContrast(text);
      }
    },
    async showsMedianAtLargeDate() {
      const median = await centreOf(
        chart.drawing.locator(".history-chart-trend-overflow path").first(),
      );
      expect(median.x).toBeCloseTo(
        (await centreOf(large.first().locator("path"))).x,
        1,
      );
    },
    async showsDistinctMedianAboveDots() {
      const line = chart.line;
      await expect(line).toHaveCount(1);
      const paint = await line.evaluate(
        (element) => getComputedStyle(element).stroke,
      );
      expect(paint).not.toBe(
        await chart.measured
          .first()
          .evaluate((element) => getComputedStyle(element).fill),
      );
      expect(
        await chart.drawing.evaluate((drawing) => {
          const trend = drawing.querySelector(".history-chart-trend");
          return (
            trend !== null &&
            [
              ...drawing.querySelectorAll(
                ".history-chart-point,.history-chart-partial",
              ),
            ].every((mark) =>
              Boolean(
                mark.compareDocumentPosition(trend) &
                Node.DOCUMENT_POSITION_FOLLOWING,
              ),
            )
          );
        }),
      ).toBe(true);
      await expectChartMarkContrast(line);
    },
    // Each named mark's centre, in the order given.
    async markCentres(readouts: readonly string[]) {
      return Promise.all(
        readouts.map((readout) => centreOf(chart.mark(readout))),
      );
    },
    // Claude Code's points and median take colours apart from Codex's, each
    // readable on the chart; its points take another shape, its partial ones
    // keep the caution stroke and its median is also dashed.
    async showsDistinctTraces() {
      const paint = (element: Locator, property: "fill" | "stroke") =>
        element.evaluate(
          (each, name) => getComputedStyle(each).getPropertyValue(name),
          property,
        );
      const second = ".history-chart-trace-1";
      const { measured, partial } = chart;
      const codexPoint = measured.and(page.locator(`:not(${second})`)).first();
      const claudePoint = measured.and(page.locator(second)).first();
      const codexPartial = partial.and(page.locator(`:not(${second})`)).first();
      const claudePartial = partial.and(page.locator(second)).first();
      const codexLine = chart.drawing.locator(
        `.history-chart-trend:not(${second})`,
      );
      const claudeLine = chart.drawing.locator(`.history-chart-trend${second}`);
      expect(await shapeOf(codexPoint)).toBe("circle");
      expect(await shapeOf(codexPartial)).toBe("4 corners");
      expect(await shapeOf(claudePoint)).toBe("3 corners");
      expect(await shapeOf(claudePartial)).toBe("3 corners");
      expect(await paint(claudePoint, "fill")).not.toBe(
        await paint(codexPoint, "fill"),
      );
      const caution = await tokenColour(page, "--caution");
      for (const hollow of [codexPartial, claudePartial]) {
        expect(await paint(hollow, "stroke")).toBe(caution);
        expect(await paint(hollow, "fill")).not.toBe(
          await paint(claudePoint, "fill"),
        );
      }
      expect(await paint(claudeLine, "stroke")).not.toBe(
        await paint(codexLine, "stroke"),
      );
      await expect(claudeLine).toHaveCSS("stroke-dasharray", "6px, 3px");
      await expect(codexLine).toHaveCSS("stroke-dasharray", "none");
      for (const mark of [claudePoint, claudePartial, codexPartial, claudeLine])
        await expectChartMarkContrast(mark);
    },
    // Whichever tool's task is selected, it is the one larger diamond
    // labelled "Selected task".
    async showsSelectedDiamond() {
      await expect(chart.selected).toHaveCount(1);
      expect(await shapeOf(chart.selected)).toBe("4 corners");
      await expect(chart.drawing.locator(".history-chart-selected")).toHaveText(
        "Selected task",
      );
    },
    async showsSeparatedMedianLevels() {
      await expect(chart.line).toHaveAttribute(
        "d",
        /^M[^ML]+L[^ML]+ M[^ML]+L[^ML]+$/,
      );
    },
    async fitsReadingWindow() {
      await expectNoSidewaysScrollAndWholeText(page);
      const drawing = await chart.drawing.boundingBox();
      expect(drawing).not.toBeNull();
      if (drawing === null) return;
      for (const text of await chart.drawing
        .locator(
          ".history-chart-overflow text,.history-chart-trend-overflow text",
        )
        .all()) {
        const box = await text.boundingBox();
        expect(box).not.toBeNull();
        if (box !== null) {
          expect(box.y).toBeGreaterThanOrEqual(drawing.y - 1);
          expect(box.y + box.height).toBeLessThanOrEqual(
            drawing.y + drawing.height + 1,
          );
          expect(box.x).toBeGreaterThanOrEqual(drawing.x - 1);
          expect(box.x + box.width).toBeLessThanOrEqual(
            drawing.x + drawing.width + 1,
          );
        }
      }
    },
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
