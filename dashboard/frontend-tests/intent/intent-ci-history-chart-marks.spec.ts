// The shared history chart's marks on a Done story's scope timing history,
// each read by touch on a phone. Project Intent's chart, its marks by shape
// and their reading by pointer and keyboard in both appearances are in
// ./intent-project-ci-history-chart-marks.spec.ts. Collection and
// retained projection belong to the integrated journeys; this substitute
// supplies one retained history to the mounted comparison.
import { expect, test } from "vitest";
import { useTouchScreen } from "../navigation/board-touch-page.ts";
import { openDoneScopeHistory } from "./intent-done-scope-history.ts";
import {
  failed,
  markedHistory,
  unavailable,
} from "./intent-marked-scope-history-fixtures.ts";

const selected = "Nov 8 · Selected landing · 1.5 s";

test("tapping a Done scope history mark on a touch phone shows its readout", async () => {
  await useTouchScreen();
  const { history } = await openDoneScopeHistory(markedHistory, {
    phone: true,
  });
  const chart = await history.chart("test cases", "selected landing");
  for (const readout of [failed, unavailable, selected]) {
    await chart.tapMark(readout);
    await expect.poll(chart.readout).toBe(readout);
  }
  expect(history.scrollingSideways()).toEqual([]);
});
