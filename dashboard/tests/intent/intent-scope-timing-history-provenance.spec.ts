import {
  scopeHistory,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
// How a reused equivalent or later trunk build stands for the landings its
// timing represents. The collection-to-Summary journey owns actual retained
// evidence; this substitute supplies one retained history.

import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { shortSha } from "../../src/baseCiWording.ts";

test("a later trunk build that supplies the selected timing stays named in the readout and each mark names its build's role", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const equivalent = "a".repeat(40);
  const preparation = "b".repeat(40);
  const skipped = "c".repeat(40);
  const later = "d".repeat(40);
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          key: "run/41/1",
          kind: "point",
          date: "2026-11-04T10:00:00Z",
          selected: false,
          landings: [
            {
              revision: preparation,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: false,
            },
            {
              revision: skipped,
              receivedAt: "2026-11-06T10:00:00Z",
              selected: false,
            },
          ],
          build: {
            revision: equivalent,
            runId: 41,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/41",
            provenance: "equivalent",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 1200,
              entry: "dashboard/tests",
              segment: "case/1",
            },
          ],
        },
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-08T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-07T10:00:00Z",
              selected: true,
            },
          ],
          build: {
            revision: later,
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
            provenance: "later",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 2400,
              entry: "dashboard/tests",
              segment: "case/1",
            },
          ],
        },
      ],
      references: [
        {
          unit: "case",
          reference: {
            endpoint: setup.completion,
            selected: {
              key: "run/42/1",
              date: "2026-11-08T10:00:00Z",
              ms: 2400,
            },
            evidence: [],
            sampleCount: 1,
          },
        },
      ],
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  await expect(scopeHistoryReading(history).selected).toHaveText(
    `Selected landing ${shortSha(setup.completion)} · 2.4 s · Later trunk build, includes later changes`,
  );
  // Each measured build by its date, timing and role.
  const chart = scopeHistoryChart(history, "test cases");
  await expect(chart.drawing.locator("title")).toHaveText([
    "Nov 4 · 1.2 s · test cases · Reused equivalent first-parent build",
    "Nov 8 · 2.4 s · test cases · Later trunk build, includes later changes · Selected landing",
  ]);
  await expect(chart.readout).toHaveText("Nov 8 · Selected · 2.4 s");
  await expect(history).not.toContainText(shortSha(later));
  await expectNoSidewaysScrollIn(page, history);
});
