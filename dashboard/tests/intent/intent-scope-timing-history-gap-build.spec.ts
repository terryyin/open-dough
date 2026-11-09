// Presentation of a named stand-in build beside an unmeasured scoped gap.
// Actual collection-to-public metadata is proved in landed-ci-history-gaps.
import { expect, test } from "../support/preparationPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";

test("a final proof gap names its later build and keyboard link without counting it as measured", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const later = "d".repeat(40);
  const collected = makeMe.aCiScopeHistory
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
          reason: "Expired CI proof summary",
          readings: [],
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-07T10:00:00Z",
              selected: true,
              provenance: "later",
            },
          ],
          build: {
            revision: later,
            provenance: "later",
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
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
  const history = summary.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  await expect(history).toContainText(
    "No complete test execution times are available for this scope.",
  );
  await expect(history).toContainText("0 measured builds");
  await expect(history.getByRole("img")).toHaveCount(0);
  const row = history.getByRole("listitem");
  await expect(row).toHaveText(
    `Nov 7 · Expired CI proof summary · Selected landing · Later trunk build, includes later changes ${shortSha(later)} · Run 42 · attempt 1 · Represents ${shortSha(setup.completion)} (selected landing) (later trunk build, includes later changes)`,
  );
  const link = row.getByRole("link", { name: "Run 42 · attempt 1" });
  await expect(link).toHaveAttribute("href", "https://ci.invalid/runs/42");
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(link).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await expect(row.locator("time")).toHaveAttribute(
    "datetime",
    "2026-11-07T10:00:00Z",
  );
  await expectNoSidewaysScrollIn(page, history);
});
