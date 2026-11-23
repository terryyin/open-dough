// The shared history chart's marks and readouts on a Done story's scope
// timing history: each build's timing or status by shape, and a short readout
// by pointer, keyboard and touch. Project Intent's chart and both appearances
// are in ./intent-project-ci-history-chart-marks.spec.ts. Collection and
// retained projection belong to the integrated journeys; this substitute
// supplies one retained history to the mounted comparison.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ScopeGlanceEntry } from "../../src/ciScopeHistory.ts";
import { useTouchScreen } from "../navigation/board-touch-page.ts";
import { openDoneScopeHistory } from "./intent-done-scope-history.ts";

const build = (day: number) => ({
  key: `run/${String(day)}/1`,
  date: `2026-11-0${String(day)}T10:00:00Z`,
  selected: false,
  landings: [{ selected: false, provenance: "exact" as const }],
});
const measured = (day: number, ms: number, segment = "case/1") =>
  ({
    ...build(day),
    kind: "point",
    readings: [{ kind: "point", unit: "case", ms, segment }],
  }) satisfies ScopeGlanceEntry;
const untimed = (
  day: number,
  status: "failed" | "unavailable",
  reason: string,
) =>
  ({
    ...build(day),
    kind: "gap",
    gap: { status, reason },
    readings: [{ kind: "gap", unit: "case", status, reason }],
  }) satisfies ScopeGlanceEntry;

// Retained test-case times: two joined builds, a failed build, a measured
// zero, a build without timing, one more measured build and the selected
// build, whose measurement is incompatible with the builds before it.
const markedHistory = (path: string, selectedRevision: string) =>
  makeMe.aScopeHistoryGlance
    .with({
      path,
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
          ...measured(8, 1500, "case/2"),
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

const failed = "Nov 4 · Failed build";
const zero = "Nov 5 · 0 ms";
const unavailable = "Nov 6 · No timing · Expired CI proof summary";
const selected = "Nov 8 · Selected landing · 1.5 s";
const readouts = [
  "Nov 2 · 1.0 s",
  "Nov 3 · 1.2 s",
  failed,
  zero,
  unavailable,
  "Nov 7 · 1.6 s",
  selected,
];

const openMarkedChart = async (phone = false) => {
  const { history } = await openDoneScopeHistory(markedHistory, { phone });
  return {
    history,
    chart: await history.chart("test cases", "selected landing"),
  };
};

test("a Done scope history chart marks each build's timing or status and reads it by pointer and keyboard", async () => {
  const { chart } = await openMarkedChart();
  expect(chart.readout()).toBe(selected);
  expect(chart.markNames()).toEqual(readouts);
  expect(chart.builds()).toEqual({ measured: 4, selected: 1, unavailable: 1 });
  // Broken by the failed and untimed builds and the incompatible selection.
  expect(chart.line()).toMatch(/^M[^ML]+L[^ML]+M[^ML]+M[^ML]+M[^ML]+$/);
  expect(chart.failedUnder(failed)).toBe(true);
  expect(chart.markY(unavailable)).toBeCloseTo(chart.markY(failed), 0);
  expect(chart.markY(failed)).toBeGreaterThan(chart.markY(zero) + 8);
  for (const readout of [failed, unavailable, zero]) {
    await userEvent.hover(chart.mark(readout));
    await expect.poll(chart.readout).toBe(readout);
  }
  await userEvent.unhover(chart.mark(zero));
  // Tab reaches the first mark from the stop before it, then walks on.
  const [first = ""] = readouts;
  chart.mark(first).focus();
  await userEvent.tab({ shift: true });
  const walked: string[] = [];
  for (let step = 0; step < readouts.length; step += 1) {
    await userEvent.tab();
    await expect.poll(chart.readout).toBe(chart.focusedMark());
    walked.push(chart.readout());
  }
  expect(walked).toEqual(readouts);
});

test("tapping a Done scope history mark on a touch phone shows its readout", async () => {
  await useTouchScreen();
  const { history, chart } = await openMarkedChart(true);
  for (const readout of [failed, unavailable, selected]) {
    await chart.tapMark(readout);
    await expect.poll(chart.readout).toBe(readout);
  }
  expect(history.scrollingSideways()).toEqual([]);
});
