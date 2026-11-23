// A Done story's scope history whose selected landing has no measured build
// of its own: a later trunk build standing in for a selected gap, unverified
// landing order, and a pending selected build. The collection-to-Summary
// journey owns actual retained evidence; landed-ci-history-gaps proves the
// collected metadata.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  expectDoneEntryComparisonKept,
  openDoneScopeHistory,
} from "./intent-done-scope-history.ts";
import { doneCompletion } from "./intent-story-compare-stories.ts";

test("a selected proof gap from a later trunk build reads its status and stand-in without counting it as measured", async () => {
  const expired = {
    status: "unavailable",
    reason: "Expired CI proof summary",
  } as const;
  const { history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "retained",
          entries: [
            {
              key: "landing/expired",
              kind: "gap",
              date: "2026-11-07T10:00:00Z",
              selected: true,
              gap: expired,
              readings: [{ kind: "gap", unit: "case", ...expired }],
              landings: [{ selected: true, provenance: "later" }],
            },
          ],
          references: [
            {
              unit: "case",
              reference: {
                endpoint: selectedRevision,
                selected: {
                  key: "landing/expired",
                  date: "2026-11-07T10:00:00Z",
                  reason: expired.reason,
                },
                sampleCount: 0,
              },
            },
          ],
        })
        .please(),
    { phone: true },
  );
  // Its status and the later build standing for the landing, no change.
  await expect.poll(history.readout).toEqual({
    selected: `Selected landing ${shortSha(doneCompletion)} · No timing · Expired CI proof summary · Later trunk build, includes later changes`,
    average: "Prior-build average · Insufficient history · 0 prior builds used",
    change: undefined,
  });
  expect(history.text()).toContain(
    "No complete test execution times are available for test cases.",
  );
  expect(history.charts()).toBe(0);
  expect(history.scrollingSideways()).toEqual([]);
});

test("unverified local landing order explains the partial cohort while the selected known measurement remains readable", async () => {
  const { summary, history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "order-unavailable",
          entries: [
            {
              key: "run/42/1",
              kind: "point",
              date: "2026-11-08T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "exact" }],
              readings: [
                { kind: "point", unit: "case", ms: 0, segment: "case/1" },
              ],
            },
          ],
        })
        .please(),
  );
  // A brief status for the partial cohort; the selected measurement charts.
  await expect.poll(history.status).toBe("Landing order unverified");
  const chart = await history.chart("test cases", "selected landing");
  expect(chart.marks()).toBe(1);
  expect(chart.readout()).toBe("Nov 8 · Selected landing · 0 ms");
  expectDoneEntryComparisonKept(summary);
});

test("a pending selected build reads its brief status without presenting a measured build or execution time", async () => {
  // The selected landing's build is queued or running, as the server's glance
  // projection of its retained history answers it.
  const pending = {
    status: "unavailable",
    reason: "Pending · CI queued or running",
  } as const;
  const { summary, history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "retained",
          entries: [
            {
              key: "landing/pending",
              kind: "gap",
              date: "2026-11-06T10:00:00Z",
              selected: true,
              gap: pending,
              readings: [],
              landings: [{ selected: true, provenance: "exact" }],
            },
          ],
        })
        .please(),
    { phone: true },
  );
  await expect.poll(history.status).toBe("Pending · CI queued or running");
  expect(history.text()).not.toMatch(
    /(?:\d[\d.]*\s*(?:ms|s|min)\b|(?:Exact|Measured|Reused|Later trunk) build)/,
  );
  expect(history.text()).toContain(
    "No complete test execution times are available for this scope.",
  );
  expect(history.charts()).toBe(0);
  expectDoneEntryComparisonKept(summary);
  expect(history.scrollingSideways()).toEqual([]);
});
