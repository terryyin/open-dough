// One retained scope history whose chart shows every kind of history mark,
// with the readouts and drawing a reader expects of it, for the Done and
// Project Intent chart-mark specs
// (../../frontend-tests/intent-*ci-history-chart-marks.spec.ts).
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ScopeGlanceEntry } from "../../src/ciScopeHistory.ts";
import {
  centreOf,
  expectMarkOver,
  type HistoryChart,
} from "../ciHistoryChartPage.ts";
import { expect } from "../dashboardTest.ts";

// Retained test-case execution times through `selectedRevision`: two joined
// builds, a failed build, a measured zero, a build whose timing is
// unavailable, one more measured build and the selected build, whose scope
// measurement is incompatible with the builds before it.
export function markedScopeHistory(selectedRevision: string) {
  const build = (day: number) => ({
    key: `run/${String(day)}/1`,
    date: `2026-11-0${String(day)}T10:00:00Z`,
    selected: false,
    landings: [{ selected: false, provenance: "exact" as const }],
  });
  const measured = (
    day: number,
    ms: number,
    segment = "case/1",
  ): ScopeGlanceEntry => ({
    ...build(day),
    kind: "point",
    readings: [{ kind: "point", unit: "case", ms, segment }],
  });
  const untimed = (
    day: number,
    status: "failed" | "unavailable",
    reason: string,
  ): ScopeGlanceEntry => ({
    ...build(day),
    kind: "gap",
    gap: { status, reason },
    readings: [{ kind: "gap", unit: "case", status, reason }],
  });
  const selected = measured(8, 1500, "case/2");
  return makeMe.aScopeHistoryGlance
    .with({
      path: "dashboard/tests",
      selectedRevision,
      availability: "retained",
      entries: [
        measured(2, 1000),
        measured(3, 1200),
        untimed(4, "failed", "Failed CI build"),
        measured(5, 0),
        untimed(6, "unavailable", "Expired CI proof summary"),
        measured(7, 1600),
        {
          ...selected,
          selected: true,
          landings: [{ selected: true, provenance: "exact" }],
        },
      ],
      references: [
        {
          unit: "case",
          reference: {
            endpoint: selectedRevision,
            sampleCount: 4,
            averageMs: 950,
          },
        },
      ],
    })
    .please();
}

export async function serveMarkedScopeHistory(
  page: Page,
  selectedRevision: string,
) {
  const collected = markedScopeHistory(selectedRevision);
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
}

// The readouts of the builds before the selected one, oldest first.
export const failedReadout = "Nov 4 · Failed build";
export const zeroReadout = "Nov 5 · 0 ms";
export const unavailableReadout =
  "Nov 6 · No timing · Expired CI proof summary";
export const readoutsBefore = [
  "Nov 2 · 1.0 s",
  "Nov 3 · 1.2 s",
  failedReadout,
  zeroReadout,
  unavailableReadout,
  "Nov 7 · 1.6 s",
];

// Each build's mark by shape and place: measured builds on the duration axis,
// a measured zero on its lowest line, the selected build (`selected`, its
// readout) as a diamond, the prior average dashed, the line broken by each
// build without timing and by the incompatible selected measurement, and the
// failed and unavailable builds on their own row below the axis, each under
// its own button, left to right by date.
export async function expectMarkedScopeHistoryDrawn(
  chart: HistoryChart,
  selected: string,
) {
  await expect(chart.measured).toHaveCount(4);
  await expect(chart.selected).toHaveCount(1);
  await expect(chart.selected).toHaveAttribute("d", /^M[^M]+Z$/);
  await expect(chart.failed).toHaveCount(1);
  await expect(chart.unavailable).toHaveCount(1);
  await expect(chart.average).toHaveCSS("stroke-dasharray", /\d/);
  await expect(chart.line).toHaveAttribute(
    "d",
    /^M[^ML]+L[^ML]+M[^ML]+M[^ML]+M[^ML]+$/,
  );
  await expect(chart.axisLabels.first()).toHaveText("0 ms");
  await expect(chart.axisLabels).toContainText(["0 ms", "500 ms", "1.0 s"]);
  await expect(chart.drawing).toContainText("Nov 2");
  await expect(chart.drawing).toContainText("Nov 8");
  const readouts = [...readoutsBefore, selected];
  await expect(chart.marks).toHaveCount(readouts.length);
  const across = await Promise.all(
    readouts.map(async (readout) => (await centreOf(chart.mark(readout))).x),
  );
  expect(across).toEqual([...across].sort((a, b) => a - b));
  expect(new Set(across).size).toBe(readouts.length);
  const zero = chart.measured.nth(2);
  await expectMarkOver(chart, zeroReadout, zero);
  await expectMarkOver(chart, selected, chart.selected);
  await expectMarkOver(chart, failedReadout, chart.failed);
  await expectMarkOver(chart, unavailableReadout, chart.unavailable);
  const axisFloor = (await centreOf(chart.grid.first())).y;
  expect((await centreOf(zero)).y).toBeCloseTo(axisFloor, 0);
  const failedRow = (await centreOf(chart.failed)).y;
  expect(failedRow).toBeGreaterThan(axisFloor + 8);
  expect((await centreOf(chart.unavailable)).y).toBeCloseTo(failedRow, 0);
}
