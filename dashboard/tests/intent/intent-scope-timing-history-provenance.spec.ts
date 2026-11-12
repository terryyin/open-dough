import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import {
  scopeHistory,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
// Supplemental UI recovery proof for the locally collected scope history.
// The collection-to-Summary journey owns actual retained evidence; this
// substitute fails only the local history read beside an existing comparison.

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

test("equivalent and later build evidence names actual measured dates and revisions separately from represented landings", async ({
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
  await expect(history).toContainText("2 measured builds · Nov 4–Nov 8");
  const evidence = scopeHistoryReading(history).evidence;
  await expect(scopeHistoryReading(history).rows).toHaveText([
    `Nov 4 · 1.2 s · test cases · entry dashboard/tests · Reused equivalent first-parent build ${shortSha(equivalent)} · Run 41 · attempt 1 · Represents ${shortSha(preparation)}, ${shortSha(skipped)}`,
    `Nov 8 · 2.4 s · test cases · entry dashboard/tests · Selected landing · Later trunk build, includes later changes ${shortSha(later)} · Run 42 · attempt 1 · Represents ${shortSha(setup.completion)} (selected landing)`,
  ]);
  await expect(
    scopeHistoryReading(history).rows.nth(0).locator("time"),
  ).toHaveAttribute("datetime", "2026-11-04T10:00:00Z");
  await expect(
    scopeHistoryReading(history).rows.nth(1).locator("time"),
  ).toHaveAttribute("datetime", "2026-11-08T10:00:00Z");
  await expect(attemptLink(evidence, "Run 41 · attempt 1")).toHaveAttribute(
    "href",
    "https://ci.invalid/runs/41",
  );
  await expect(attemptLink(evidence, "Run 42 · attempt 1")).toHaveAttribute(
    "href",
    "https://ci.invalid/runs/42",
  );
  await expectNoSidewaysScrollIn(page, history);
});

test("one measured attempt labels every represented landing's exact, reused or later-build role", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const exact = "a".repeat(40);
  const skipped = "b".repeat(40);
  const cancelled = "c".repeat(40);
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
              revision: exact,
              receivedAt: "2026-11-04T10:00:00Z",
              selected: false,
              provenance: "exact",
            },
            {
              revision: skipped,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: false,
              provenance: "equivalent",
            },
            {
              revision: cancelled,
              receivedAt: "2026-11-03T10:00:00Z",
              selected: false,
              provenance: "later",
            },
          ],
          build: {
            revision: exact,
            runId: 41,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/41",
            provenance: "exact",
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
              receivedAt: "2026-11-08T10:00:00Z",
              selected: true,
              provenance: "exact",
            },
          ],
          build: {
            revision: setup.completion,
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
            provenance: "exact",
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
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  await expect(history).toContainText("2 measured builds");
  const rows = scopeHistoryReading(history).rows;
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toHaveText(
    `Nov 4 · 1.2 s · test cases · entry dashboard/tests · Measured build ${shortSha(exact)} · Run 41 · attempt 1 · Represents ${shortSha(exact)} (exact build), ${shortSha(skipped)} (reused equivalent build), ${shortSha(cancelled)} (later trunk build, includes later changes)`,
  );
  expect(
    ((await rows.nth(0).textContent()) ?? "").match(/1\.2 s/g),
  ).toHaveLength(1);
  await expect(attemptLink(rows.nth(0), "Run 41 · attempt 1")).toHaveCount(1);
  await expect(rows.nth(1)).toContainText(
    `${shortSha(setup.completion)} (selected landing) (exact build)`,
  );
});
