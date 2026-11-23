// The shared history chart's marks and readouts on a Done story's scope
// timing history: each build's timing or status by shape, and a short readout
// by pointer, keyboard and touch. Project Intent's chart and both appearances
// are in ./intent-project-ci-history-chart-marks.spec.ts. Collection and
// retained projection belong to the integrated journeys; this substitute
// supplies one retained history to the mounted comparison.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { useTouchScreen } from "../navigation/board-touch-page.ts";
import { openDoneScopeHistory } from "./intent-done-scope-history.ts";
import {
  failed,
  markedHistory,
  readoutsBefore,
  unavailable,
  zero,
} from "./intent-marked-scope-history-fixtures.ts";

const selected = "Nov 8 · Selected landing · 1.5 s";
const readouts = [...readoutsBefore, selected];

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
  expect(chart.drawnUnder(failed, "failed")).toBe(true);
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
