// The shared dated CI history chart (../src/IntentCiHistoryChart.tsx) as a
// reader meets it: its drawing's marks by shape, each mark's button over the
// drawing and the readout an inspected mark shows. Scenarios choose the
// chart, the marks they expect and each readout's words.
import type { Locator, Page } from "@playwright/test";
import {
  expectChartMarkContrast,
  expectReadableContrast,
} from "./accessibleReading.ts";
import { expect } from "./dashboardTest.ts";
import { backgroundOf, tokenColour } from "./pageColours.ts";

export type InspectBy = "pointer" | "touch";

// The chart whose drawing is named `name` within `scope`.
export function historyChart(scope: Locator, name: string) {
  const named = { name, exact: true };
  const box = scope
    .locator(".intent-ci-history-chart")
    .filter({ has: scope.page().getByRole("img", named) });
  const drawing = box.getByRole("img", named);
  return {
    box,
    drawing,
    marks: box.getByRole("button"),
    mark: (readout: string) =>
      box.getByRole("button", { name: readout, exact: true }),
    readout: box.locator(".intent-ci-history-readout"),
    measured: drawing.locator("circle.intent-ci-history-point"),
    selected: drawing.locator("path.intent-ci-history-point"),
    failed: drawing.locator(".intent-ci-history-failed"),
    unavailable: drawing.locator(".intent-ci-history-unavailable"),
    line: drawing.locator(".intent-ci-history-line"),
    average: drawing.locator(".intent-ci-history-reference line"),
    averageLabel: drawing.locator(".intent-ci-history-reference title"),
    grid: drawing.locator(".intent-ci-history-grid"),
    axisLabels: drawing.locator("g:has(> .intent-ci-history-grid) > text"),
  };
}

export type HistoryChart = ReturnType<typeof historyChart>;

// Inspect the mark named `readout` by pointer hover or a tap; the chart's
// readout then names it.
export async function inspectMark(
  chart: HistoryChart,
  readout: string,
  by: InspectBy,
) {
  const mark = chart.mark(readout);
  if (by === "pointer") await mark.hover();
  else await mark.tap();
  await expect(chart.readout).toHaveText(readout);
}

// Tab reaches the first mark from the stop before it and moves on through
// the marks in the order given, each focus showing that mark's readout.
export async function expectMarksByTab(
  page: Page,
  chart: HistoryChart,
  readouts: readonly string[],
) {
  const [first, ...rest] = readouts;
  if (first === undefined) return;
  await chart.mark(first).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(chart.mark(first)).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(chart.mark(first)).toBeFocused();
  await expect(chart.readout).toHaveText(first);
  for (const readout of rest) {
    await page.keyboard.press("Tab");
    await expect(chart.mark(readout)).toBeFocused();
    await expect(chart.readout).toHaveText(readout);
  }
}

// Where a drawn mark, grid line or button sits on the page.
export const centreOf = async (element: Locator) => {
  const box = await element.boundingBox();
  if (box === null) throw new Error("mark is not drawn");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

// The button of `readout` lies over the drawn `shape` it inspects.
export async function expectMarkOver(
  chart: HistoryChart,
  readout: string,
  shape: Locator,
) {
  const button = await centreOf(chart.mark(readout));
  const drawn = await centreOf(shape);
  expect(Math.abs(button.x - drawn.x)).toBeLessThan(1.5);
  expect(Math.abs(button.y - drawn.y)).toBeLessThan(1.5);
}

// The SVG paints the browser computes for a drawn mark.
const paintOf = (shape: Locator) =>
  shape.evaluate((element) => {
    const style = getComputedStyle(element);
    return { fill: style.fill, stroke: style.stroke };
  });

// In the current appearance: a failed build's × in the failure colour.
export async function expectFailedMarkPainted(page: Page, chart: HistoryChart) {
  const failed = await paintOf(chart.failed.first());
  expect(failed.stroke).toBe(await tokenColour(page, "--problem"));
  expect(failed.fill).toBe("none");
}

// In the current appearance: a failed build's × in the failure colour, an
// unavailable timing's mark hollow on the chart's own surface, and the
// failed, unavailable, measured and selected marks and the readout readable
// against it.
export async function expectMarksPainted(page: Page, chart: HistoryChart) {
  await expectFailedMarkPainted(page, chart);
  const hollow = await paintOf(chart.unavailable.first());
  const surface = await backgroundOf(chart.box);
  expect(hollow.fill).toBe(surface);
  expect(hollow.stroke).not.toBe(surface);
  expect(hollow.stroke).not.toBe((await paintOf(chart.measured.first())).fill);
  for (const mark of [
    chart.failed.first(),
    chart.unavailable.first(),
    chart.measured.first(),
    chart.selected,
  ])
    await expectChartMarkContrast(mark);
  await expectReadableContrast(chart.readout);
}
