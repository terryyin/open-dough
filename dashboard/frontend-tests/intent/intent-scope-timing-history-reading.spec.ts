// A failed local entry history read beside a Done story's comparison: the
// story, its comparison and the part order stay, and the history offers its
// own Retry, reads while the retried read is held, then charts its answer
// above the comparison on a phone. The collection-to-Summary journey owns
// actual retained evidence.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  expectDoneEntryComparisonKept,
  openDoneScopeHistory,
} from "./intent-done-scope-history.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

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
  const { summary, history } = await openDoneScopeHistory(
    (path, selectedRevision) => {
      reads += 1;
      if (reads === 1)
        return Promise.reject(new Error("Local history unavailable"));
      return new Promise((resolve) => {
        release = () => {
          resolve(collected(path, selectedRevision));
        };
      });
    },
    { phone: true },
  );
  const table = summary.getByRole("table", {
    name: "CI proof of the immediate folders and files of dashboard/tests",
    exact: true,
  });
  await expect
    .element(history.failure)
    .toHaveTextContent("Local history unavailable");
  expect(intentStoryCompare().headerText()).toContain("Story A");
  expectDoneEntryComparisonKept(summary);
  expect(history.standsAbove(table)).toBe(true);
  expect(reads).toBe(1);

  await userEvent.click(history.retry);
  await expect.poll(() => reads).toBe(2);
  await expect
    .poll(history.text)
    .toContain("Reading collected test execution times…");
  expect(history.failure.query()).toBeNull();
  expectDoneEntryComparisonKept(summary);

  release();
  // The history charts above the comparison it leaves intact.
  const chart = await history.chart("test cases", "selected landing");
  expect(chart.readout()).toBe("Nov 6 · Selected landing · 0 ms");
  expect(chart.marks()).toBe(2);
  expect(() => chart.markY("Nov 5 · 1.2 s")).not.toThrow();
  expect(history.failure.query()).toBeNull();
  expectDoneEntryComparisonKept(summary);
  expect(intentStoryCompare().headerText()).toContain("Story A");
  expect(history.standsAbove(table)).toBe(true);
  expect(history.scrollingSideways()).toEqual([]);
});
