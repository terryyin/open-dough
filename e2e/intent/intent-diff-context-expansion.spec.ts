// Revealing preceding context above a hunk in Intent's review keeps that hunk
// where the developer was reading. The expansion rules themselves are proved
// in `dashboard/frontend-tests/review/story-review-diff-context-expansion.spec.ts`.

import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openExpandDiff } from "../../dashboard/test-support/support/expandContextDiff.ts";
import { scrollTopOf } from "../../dashboard/test-support/support/reviewPanes.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepPublishedStoryReview } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  expandContextRepository,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

test.use({ originRepository: expandContextRepository });

test("showing preceding lines above a mid-view hunk keeps that hunk in place", async ({
  page,
  dashboard,
  origin,
}) => {
  const expandDiff =
    await test.step("Given a published story's review shows the expand-context file", async () => {
      keepPublishedStoryReview(
        dashboard,
        origin,
        storyWorktree(origin).workspace,
      );
      return openExpandDiff(page, await openBacklog(page, origin));
    });
  const moved =
    await test.step("When the developer shows 20 preceding lines above the hunk mid-view", () =>
      expandDiff.showPrecedingAboveMidViewHunk());
  await test.step("Then the hunk's changed line stays where it was read", async () => {
    expect(moved).toBeLessThan(4);
    expect(
      await scrollTopOf(expandDiff.review.readingToMeasure()),
    ).toBeGreaterThan(0);
  });
});
