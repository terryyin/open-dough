// A failed local entry history read beside a Done story's comparison: the
// story, its comparison and the part order stay, and the history offers its
// own Retry, reads while the retried read is held, then charts its answer
// above the comparison on a phone. The collection-to-Summary journey owns
// actual retained evidence.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { rowTextsOf } from "./intent-ci-comparison-page.ts";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  openScopeSummary,
  scopeHistoryIn,
} from "./intent-scope-history-page.ts";
import {
  doneEntryComparisonRows,
  doneEntryOwnFigures,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const collected = (path: string, selectedRevision: string) =>
  makeMe.aScopeHistoryGlance
    .with({
      path,
      selectedRevision,
      availability: "retained",
      entries: [
        {
          key: `adapter/${JSON.stringify(["run-a", "opaque-attempt+#", "1".repeat(40)])}`,
          kind: "point",
          date: "2026-11-05T10:00:00Z",
          selected: false,
          landings: [{ selected: false, provenance: "exact" }],
          readings: [
            { kind: "point", unit: "case", ms: 1200, segment: "case/1" },
          ],
        },
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-06T10:00:00Z",
          selected: true,
          landings: [{ selected: true, provenance: "exact" }],
          readings: [{ kind: "point", unit: "case", ms: 0, segment: "case/1" }],
        },
      ],
    })
    .please();

test("a failed local entry history read keeps the selected Done story and comparison and offers its own retry", async () => {
  let reads = 0;
  let release: () => void = () => undefined;
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
    ci: {
      readScopeHistory: (...[, path, endpoint]) => {
        reads += 1;
        if (reads === 1)
          return Promise.reject(new Error("Local history unavailable"));
        return new Promise((resolve) => {
          release = () => {
            resolve(collected(path, endpoint.revision));
          };
        });
      },
    },
  });
  await page.viewport(390, 844);
  await intentStoryCompare().chooseTab("Changes");
  const summary = await openScopeSummary("dashboard/tests");
  const history = scopeHistoryIn(summary);
  const table = summary.getByRole("table", {
    name: "CI proof of the immediate folders and files of dashboard/tests",
    exact: true,
  });
  await expect
    .element(history.failure)
    .toHaveTextContent("Local history unavailable");
  expect(intentStoryCompare().headerText()).toContain("Story A");
  const rows = rowTextsOf(table);
  expect(rows).toEqual(doneEntryComparisonRows);
  const ownFigures = () =>
    comparisonIn(summary).figuresOf("CI proof of dashboard/tests");
  expect(ownFigures()).toEqual(doneEntryOwnFigures);
  expect(history.standsAbove(table)).toBe(true);
  expect(reads).toBe(1);

  await userEvent.click(history.retry);
  await expect.poll(() => reads).toBe(2);
  await expect
    .poll(history.text)
    .toContain("Reading collected test execution times…");
  expect(history.failure.query()).toBeNull();
  expect(rowTextsOf(table)).toEqual(rows);
  expect(ownFigures()).toEqual(doneEntryOwnFigures);

  release();
  // The history charts above the comparison it leaves intact.
  const chart = await history.chart("test cases", "selected landing");
  expect(chart.readout()).toBe("Nov 6 · Selected landing · 0 ms");
  expect(chart.marks()).toBe(2);
  expect(() => chart.markY("Nov 5 · 1.2 s")).not.toThrow();
  expect(history.failure.query()).toBeNull();
  expect(rowTextsOf(table)).toEqual(rows);
  expect(ownFigures()).toEqual(doneEntryOwnFigures);
  expect(intentStoryCompare().headerText()).toContain("Story A");
  expect(history.standsAbove(table)).toBe(true);
  expect(history.scrollingSideways()).toEqual([]);
});
