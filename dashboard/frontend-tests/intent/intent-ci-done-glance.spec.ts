// A Done landing's CI wall time read against its recent builds, between the
// live comparison's Build table and its entry table: the compact readout's
// words and cue in light and dark, and the chart's marks, average line and
// the readouts a pointer or keyboard focus shows on its marks.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { emulateMedia } from "../review/browser-session.ts";
import { doneWallTimeHistory } from "./intent-ci-done-history-page.ts";
import { shownComparison } from "./intent-ci-comparison-page.ts";
import {
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

test("a Done landing's CI wall time reads against its recent builds between the endpoints and the entry table", async () => {
  let landing = "";
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
    ci: {
      readDoneWallTimeHistory: (...[, endpoint]) => {
        landing = endpoint.revision.slice(0, 7);
        return Promise.resolve(
          makeMe.aDoneWallTimeHistory
            .priors([
              500000,
              "failed",
              502000,
              "missing",
              504000,
              506000,
              508000,
              504000,
            ])
            .averaging(504000, 6)
            .measured(484000)
            .through(endpoint.revision)
            .please(),
        );
      },
    },
  });
  const history = await doneWallTimeHistory();
  await expect
    .poll(history.selected)
    .toBe(`Selected landing ${landing} · 8 min 4 s`);
  expect(history.average()).toBe(
    "Prior-build average · 8 min 24 s · 6 prior builds used",
  );
  expect(history.change()).toBe("vs. prior average · −20 s (−4%)");
  expect(history.changeCue()).toBe("faster");
  expect(history.status()).toBeUndefined();
  await expect.element(history.refresh).toBeVisible();

  const comparison = await shownComparison();
  await expect.poll(history.standsBetweenTables).toBe(true);
  expect(comparison.wallTimes()[2]).toBe("4 min");
  expect(history.text()).not.toMatch(
    /Builds and reference evidence|Median|calibration|retention can change its prior sample/,
  );

  // Eight priors and the selected landing, the average line dashed.
  expect(history.chartMarks()).toBe(9);
  expect(history.drawn()).toEqual({ selected: 1, failed: 1, unavailable: 1 });
  expect(history.averageDashed()).toBe(true);
  expect(history.averageLabel()).toBe("Prior-build average 8 min 24 s");
  expect(history.chartReadout()).toBe("Nov 5 · Selected landing · 8 min 4 s");
  await userEvent.hover(history.mark("Oct 29 · Failed build"));
  await expect.poll(history.chartReadout).toBe("Oct 29 · Failed build");
  const missing = history.mark("Oct 31 · No timing · No CI proof summary");
  (missing.element() as HTMLElement).focus();
  await expect
    .poll(history.chartReadout)
    .toBe("Oct 31 · No timing · No CI proof summary");

  await emulateMedia([{ name: "prefers-color-scheme", value: "dark" }]);
  await expect.poll(history.changeCue).toBe("faster");
  expect(history.change()).toBe("vs. prior average · −20 s (−4%)");
});
