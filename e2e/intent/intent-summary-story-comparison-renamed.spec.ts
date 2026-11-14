// A real completed Story Branch comparison keeps a rename's original diff
// and outside-location route to Review changes after trunk renames it again.

import { makeMe } from "../../tests/support/makeMe.mjs";
import { expandIntentGroup } from "../../dashboard/tests/intentPerspectivePage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../../dashboard/tests/support/intentSummaryStoryComparisonFixture.ts";
import { selectDoneStoryForSummaryComparison } from "../../dashboard/tests/support/selectDoneStoryForSummaryComparison.ts";
import {
  intentDiff,
  intentFile,
  openReviewFromIntent,
  outsideCount,
  reviewDiff,
  storyOnly,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import { lines } from "../../dashboard/tests/support/storyReviewWorktree.ts";

test("a Done Story Branch rename keeps its original diff and Review changes after a later trunk rename", async ({
  page,
  origin,
}) => {
  const later = makeMe.aRepository
    .withRevision("rename-again", {
      backlog: null,
      remove: ["dashboard/tests/renamed.spec.ts"],
      files: {
        "dashboard/tests/renamed-again.spec.ts": `${lines("old")}later trunk rewrite\n`,
      },
    })
    .please().revisions[0];
  await publishSummaryComparisonStory(page, origin, { later });
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  await expandIntentGroup(intent, "dashboard/tests");
  const name = summaryComparisonChanges.renamed;
  await expect(
    intentFile(intent, "dashboard/tests/renamed-again.spec.ts"),
  ).toHaveCount(0);
  const original = await intentDiff(intent, name);
  expect(original).toContain("renamed");
  expect(original).not.toContain("later trunk rewrite");
  await storyOnly(intent).check();
  expect(await intentDiff(intent, name)).toBe(original);
  await expect(outsideCount(intent)).toBeVisible();
  await openReviewFromIntent(page, intent);
  expect(await reviewDiff(page, name)).toBe(original);
  await expect(intentFile(intent, name)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
