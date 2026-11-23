// The shared history chart's marks and readouts on Project Intent's scope
// timing history for the configured trunk: each build's timing or status by
// shape and place under the observed trunk endpoint's words, painted readably
// with focus shown in light and dark appearance, with whole duration labels at
// the narrowest supported width. The Done story's chart, its walk through
// every mark by keyboard, and touch are in
// ./intent-ci-history-chart-marks.spec.ts. The integrated journeys own
// collection; the typed scope history read answers each scope.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { zoomedViewport } from "../navigation/board-accessibility.ts";
import { emulateMedia } from "../review/browser-session.ts";
import { workOf } from "./intent-ci-homepage-page.ts";
import { openDoughSource } from "./intent-ci-status-fixtures.ts";
import {
  failed,
  markedHistory,
  readoutsBefore,
  unavailable,
  zero,
} from "./intent-marked-scope-history-fixtures.ts";
import { mountUnprovenScopeHistory } from "./intent-project-scope-history-fixtures.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";

const endpoint = "Nov 8 · Endpoint · 1.5 s";
const durations = ["0 ms", "500 ms", "1.0 s", "1.5 s", "2.0 s"];
const work = workOf(
  makeMe.aPublishedSource.with({ ...openDoughSource, ref: "trunk" }).please(),
  "a1a1a1a",
);

// Project Intent's Summary for the configured trunk, its retained history
// marked, beside an unread live status.
async function openProjectChart(viewport?: typeof zoomedViewport) {
  await mountUnprovenScopeHistory({
    work,
    ...(viewport && { viewport }),
    readScopeHistory: (...[, path, observed]) =>
      Promise.resolve(markedHistory(path, observed.revision)),
  });
  const history = scopeHistoryIn(await openScopeSummary("dashboard/tests"));
  return {
    history,
    chart: await history.chart("test cases", "observed trunk endpoint"),
  };
}

test("a Project Intent scope history chart marks the observed trunk endpoint's builds and reads them by pointer and keyboard in light and dark", async () => {
  const { chart } = await openProjectChart();
  expect(chart.readout()).toBe(endpoint);
  expect(chart.markNames()).toEqual([...readoutsBefore, endpoint]);
  expect(chart.builds()).toEqual({ measured: 4, selected: 1, unavailable: 1 });
  expect(chart.selectedShape()).toMatch(/^M[^M]+Z$/);
  expect(chart.averageDashes()).toMatch(/\d/);
  expect(chart.axisLabels()).toEqual(durations);
  expect(chart.dateLabels()).toEqual(["Nov 2", "Nov 5", "Nov 8"]);
  const across = chart.markXs();
  expect(across).toEqual([...across].sort((a, b) => a - b));
  expect(new Set(across).size).toBe(across.length);
  expect({
    zero: chart.drawnUnder(zero, "measured"),
    endpoint: chart.drawnUnder(endpoint, "selected"),
    failed: chart.drawnUnder(failed, "failed"),
    unavailable: chart.drawnUnder(unavailable, "unavailable"),
  }).toEqual({ zero: true, endpoint: true, failed: true, unavailable: true });
  expect(chart.markY(zero)).toBeCloseTo(chart.floorY(), 0);
  expect(chart.markY(failed)).toBeGreaterThan(chart.floorY() + 8);
  let previousInk: string | null = null;
  for (const scheme of ["light", "dark"]) {
    await emulateMedia([{ name: "prefers-color-scheme", value: scheme }]);
    // Each scheme repaints the chart rather than rereading the last one.
    await expect.poll(chart.readoutInk).not.toBe(previousInk);
    await expect.poll(chart.painting).toEqual({
      failedInProblemColour: true,
      hollowOnSurface: true,
      marksRead: true,
      readoutRead: true,
    });
    previousInk = chart.readoutInk();
    await userEvent.hover(chart.mark(failed));
    await expect.poll(chart.readout).toBe(failed);
    await userEvent.unhover(chart.mark(failed));
    // Tab walks from the build without timing on to the endpoint's mark.
    chart.mark(unavailable).focus();
    await expect.poll(chart.readout).toBe(unavailable);
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(chart.focusedMark).toBe(endpoint);
    await expect.poll(chart.readout).toBe(endpoint);
    expect(chart.focusPainted()).toBe(true);
  }
});

test("at the narrowest supported width the duration axis labels stay whole inside the chart", async () => {
  const { history, chart } = await openProjectChart(zoomedViewport);
  expect(chart.axisLabels()).toEqual(durations);
  expect(chart.axisLabelsInside()).toBe(durations.length);
  expect(history.scrollingSideways()).toEqual([]);
});
