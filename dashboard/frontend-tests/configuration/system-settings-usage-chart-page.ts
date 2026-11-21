// Rendered readings from the Usage plot and the marks that open its tasks.
import { expect } from "vitest";
import type { Locator } from "vitest/browser";
import {
  centreOf,
  markContrast,
  paintOf,
  tokenColour,
  type TraceMarks,
} from "./system-settings-usage-chart-mark.ts";
import { usageComparedChartView } from "./system-settings-usage-compared-chart-page.ts";
import { usageLegendView } from "./system-settings-usage-legend-page.ts";
import { usageSpacingView } from "./system-settings-usage-spacing-page.ts";
import type { UsageToolName } from "./system-settings-usage-tools-page.ts";

const measured = ":is(circle, polygon).history-chart-point";
const partial = ".history-chart-partial";
const median = ".history-chart-trend";
const aboveScale = ".history-chart-overflow";
const aboveScaleMedian = ".history-chart-trend-overflow";
const grid = ".history-chart-grid";

const traceSelector = (name: UsageToolName) =>
  name === "Codex" ? ":not(.history-chart-trace-1)" : ".history-chart-trace-1";

const wordsOf = (elements: Iterable<Element>) =>
  [...elements].map((element) => element.textContent.trim());

export function usageChartView(
  view: Locator,
  trend: Locator,
  drawing: () => Element | null,
  mark: (readout: string) => Locator,
) {
  const drawn = (selector: string) => [
    ...(drawing()?.querySelectorAll(selector) ?? []),
  ];
  const singleLine = () => drawing()?.querySelector(median);
  const overflowLabels = () =>
    drawn(`${aboveScale} text, ${aboveScaleMedian} text`);
  const marksFor = (name: UsageToolName): TraceMarks => {
    const trace = traceSelector(name);
    return {
      task: drawn(`${measured}${trace}`)[0],
      partial: drawn(`${partial}${trace}`)[0],
      median: drawn(`${median}${trace}`)[0],
    };
  };
  return {
    ...usageLegendView(trend, marksFor),
    ...usageComparedChartView(trend, drawn, mark, marksFor),
    spacing: usageSpacingView(
      trend,
      drawing,
      (name) => marksFor(name).median,
      () => drawn(`${aboveScaleMedian} path`)[0],
    ),
    medianLines: (name?: UsageToolName) =>
      drawn(
        name === undefined
          ? ".history-chart-line"
          : `${median}${traceSelector(name)}`,
      ),
    async showsMedianOverflow(
      labels: readonly string[],
      readouts: readonly string[],
    ) {
      const values = trend.getByRole("list", {
        name: "Above-scale trend values",
      });
      await expect
        .poll(() => wordsOf(drawn(`${aboveScaleMedian} text`)))
        .toEqual(labels);
      await expect
        .poll(() => wordsOf(values.getByRole("listitem").elements()))
        .toEqual(readouts);
      await expect.element(values.getByRole("button")).not.toBeInTheDocument();
      for (const label of drawn(`${aboveScaleMedian} text`)) {
        expect(label).toBeVisible();
        expect(
          markContrast(label, [paintOf(label).fill]),
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
    async showsMedianAtLargeDate() {
      await expect
        .poll(() => {
          const [medianPath] = drawn(`${aboveScaleMedian} path`);
          const [largePath] = drawn(`${aboveScale} path`);
          return medianPath && largePath
            ? centreOf(medianPath).x - centreOf(largePath).x
            : undefined;
        })
        .toBeCloseTo(0, 1);
    },
    async showsDistinctMedianAboveDots() {
      await expect.poll(() => drawn(median)).toHaveLength(1);
      const line = singleLine();
      const [dot] = drawn(measured);
      if (line === undefined || line === null || dot === undefined)
        throw new Error("The rolling median and task dots were not drawn.");
      expect(line.getBoundingClientRect().width).toBeGreaterThan(
        dot.getBoundingClientRect().width,
      );
      const { stroke, fill } = getComputedStyle(line);
      expect(stroke).not.toBe(getComputedStyle(dot).fill);
      const aboveDots = drawn(`${measured}, ${partial}`).every((each) =>
        Boolean(
          each.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      );
      expect(aboveDots).toBe(true);
      expect(markContrast(line, [stroke, fill])).toBeGreaterThanOrEqual(3);
    },
    async showsSeparatedMedianLevels() {
      await expect
        .poll(() => singleLine()?.getAttribute("d"))
        .toMatch(/^M[^ML]+L[^ML]+ M[^ML]+L[^ML]+$/);
    },
    async ordinarySeparation() {
      await expect.poll(() => drawn(measured).length).toBeGreaterThanOrEqual(2);
      const [first, second] = drawn(measured);
      if (first === undefined || second === undefined)
        throw new Error("Two ordinary task dots were not drawn.");
      return Math.abs(centreOf(first).y - centreOf(second).y);
    },
    async showsOrdinary(count: number) {
      await expect.poll(() => drawn(measured)).toHaveLength(count);
    },
    async sameDateAsLastOrdinary() {
      await expect
        .poll(() => {
          const [large] = drawn(`${aboveScale} path`);
          const ordinary = drawn(measured).at(-1);
          return large && ordinary
            ? centreOf(large).x - centreOf(ordinary).x
            : undefined;
        })
        .toBeCloseTo(0, 1);
    },
    async showsLarge(readouts: readonly string[], labels: readonly string[]) {
      await expect.poll(() => drawn(aboveScale)).toHaveLength(readouts.length);
      await expect
        .poll(() => wordsOf(drawn(`${aboveScale} text`)))
        .toEqual(labels);
      for (const [index, readout] of readouts.entries()) {
        const target = mark(readout);
        await expect.element(target).toBeVisible();
        const shape = drawn(`${aboveScale} path`)[index];
        const [topGrid] = drawn(grid);
        if (shape === undefined || topGrid === undefined)
          throw new Error("The large task or its grid was not drawn.");
        const { x, y } = centreOf(shape);
        const button = centreOf(target.element());
        expect(Math.abs(button.x - x)).toBeLessThan(1.5);
        expect(Math.abs(button.y - y)).toBeLessThan(1.5);
        expect(shape.getAttribute("d")).toMatch(/l10 10 m0 -10 l-10 10$/);
        expect(getComputedStyle(shape).stroke).toBe(
          tokenColour(view.element(), "--problem"),
        );
        expect(y).toBeLessThan(centreOf(topGrid).y);
      }
    },
    async hasAxis(labels: readonly string[]) {
      await expect
        .poll(() => wordsOf(drawn(`g:has(> ${grid}) > text`)))
        .toEqual(labels);
    },
    async fitsReadingWindow() {
      const documentFits = () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth;
      await expect
        .poll(documentFits, { message: "the page does not scroll sideways" })
        .toBe(true);
      await expect.poll(() => clippedUsageContent(view.element())).toEqual([]);
      await expect
        .poll(
          () => {
            const bounds = drawing()?.getBoundingClientRect();
            if (bounds === undefined) return undefined;
            return overflowLabels()
              .filter((label) => {
                const text = label.getBoundingClientRect();
                return (
                  text.top < bounds.top - 1 ||
                  text.bottom > bounds.bottom + 1 ||
                  text.left < bounds.left - 1 ||
                  text.right > bounds.right + 1
                );
              })
              .map((label) => label.textContent);
          },
          { message: "overflow labels stay inside the drawing" },
        )
        .toEqual([]);
    },
  };
}

function clippedUsageContent(view: Element) {
  return [...view.querySelectorAll("*")]
    .filter((element) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width <= 1 && bounds.height <= 1) return false;
      if (
        bounds.width > 0 &&
        (bounds.left < -0.5 ||
          bounds.right > document.documentElement.clientWidth + 0.5)
      )
        return true;
      if (!(element instanceof HTMLElement) || bounds.height === 0)
        return false;
      if (
        element.clientWidth > 0 &&
        element.scrollWidth > element.clientWidth + 1
      )
        return true;
      // Native form controls use their own clipping styles.
      if (element.matches("select, input, textarea, img")) return false;
      const { textOverflow, overflowX, overflowY } = getComputedStyle(element);
      return (
        textOverflow === "ellipsis" ||
        (overflowX !== "visible" && overflowX !== "auto") ||
        (overflowY !== "visible" && overflowY !== "auto")
      );
    })
    .map(
      (element) => `${element.tagName}: ${element.textContent.slice(0, 60)}`,
    );
}
