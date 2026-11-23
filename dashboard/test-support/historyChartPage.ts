// The shared dated history chart (../src/HistoryChart.tsx) as a reader
// meets it: its drawing's marks by shape, each mark's button over the
// drawing and the readout an inspected mark shows. Scenarios choose the
// chart, the marks they expect and each readout's words.
import type { Locator } from "@playwright/test";

export type InspectBy = "pointer" | "touch";

// The chart whose drawing is named `name` within `scope`.
export function historyChart(scope: Locator, name: string | RegExp) {
  const named = { name, exact: true };
  const box = scope
    .locator(".history-chart-chart")
    .filter({ has: scope.page().getByRole("img", named) });
  const drawing = box.getByRole("img", named);
  return {
    box,
    drawing,
    marks: box.getByRole("button"),
    mark: (readout: string) =>
      box.getByRole("button", { name: readout, exact: true }),
    readout: box.locator(".history-chart-readout"),
    measured: drawing.locator(":is(circle, polygon).history-chart-point"),
    selected: drawing.locator("path.history-chart-point"),
    failed: drawing.locator(".history-chart-failed"),
    unavailable: drawing.locator(".history-chart-unavailable"),
    line: drawing.locator(".history-chart-line"),
    average: drawing.locator(".history-chart-reference line"),
  };
}

export type HistoryChart = ReturnType<typeof historyChart>;

// Where a drawn mark, grid line or button sits on the page.
export const centreOf = async (element: Locator) => {
  const box = await element.boundingBox();
  if (box === null) throw new Error("mark is not drawn");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
