import {
  expectScopeReadout,
  scopeHistory,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
// Presentation of a later stand-in build beside an unmeasured selected gap.
// Actual collection-to-public metadata is proved in landed-ci-history-gaps.
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
import { shortSha } from "../../src/baseCiWording.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";

test("a selected proof gap from a later trunk build reads its status and stand-in without counting it as measured", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const later = "d".repeat(40);
  const collected = makeMe.aScopeHistoryGlance
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          key: "landing/expired",
          kind: "gap",
          date: "2026-11-07T10:00:00Z",
          selected: true,
          gap: { status: "unavailable", reason: "Expired CI proof summary" },
          readings: [
            {
              kind: "gap",
              unit: "case",
              status: "unavailable",
              reason: "Expired CI proof summary",
            },
          ],
          landings: [{ selected: true, provenance: "later" }],
        },
      ],
      references: [
        {
          unit: "case",
          reference: {
            endpoint: setup.completion,
            selected: {
              key: "landing/expired",
              date: "2026-11-07T10:00:00Z",
              reason: "Expired CI proof summary",
            },
            sampleCount: 0,
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
  // Its status and the later build standing for the landing, no change.
  await expectScopeReadout(history, {
    selected: `Selected landing ${shortSha(setup.completion)} · No timing · Expired CI proof summary · Later trunk build, includes later changes`,
    average: "Prior-build average · Insufficient history · 0 prior builds used",
  });
  await expect(history).toContainText(
    "No complete test execution times are available for test cases.",
  );
  await expect(scopeHistoryReading(history).charts).toHaveCount(0);
  await expect(history).not.toContainText(shortSha(later));
  await expectNoSidewaysScrollIn(page, history);
});
