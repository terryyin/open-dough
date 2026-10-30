// The native checkbox changes the displayed comparison; marking keeps the
// whole opened snapshot through a touch orientation change.
import { expectSettledPage } from "./dashboardPage.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { expect, test } from "./support/preparationPage.ts";
import { reviewFeedback } from "./support/reviewContextLine.ts";
import { pageFits } from "./support/reviewPanes.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keptStoryAMark, nextSnapshot } from "./support/storyReviewMark.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { storyWorktree } from "./support/storyReviewWorktree.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} review by touch`, () => {
  test.use({ viewport: portrait, hasTouch: true, reducedMotion: "reduce" });

  test("the touch checkbox changes only the displayed comparison and Mark reviewed still marks the whole snapshot", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    await keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    await expectSettledPage(page);
    const action = card.getByRole("button", { name: "Review changes" });
    await action.scrollIntoViewIfNeeded();
    const snapshot = nextSnapshot(page);
    await tapWhereShown(action);
    const opened = await snapshot;
    const review = page.getByRole("region", { name: "Story review" });
    await expect(
      review.getByRole("list", { name: "7 changed files" }),
    ).toBeVisible();
    const check = review.getByRole("checkbox", {
      name: "Include uncommitted changes",
    });
    const label = review.locator("label", {
      hasText: "Include uncommitted changes",
    });
    await label.scrollIntoViewIfNeeded();
    await tapWhereShown(label);
    await expect(check).not.toBeChecked();
    await expect(
      review.getByRole("list", { name: "4 changed files" }),
    ).toBeVisible();
    await expect(review).toContainText(
      "Uncommitted changes are left out. Mark reviewed still marks the whole snapshot.",
    );
    await page.setViewportSize(landscape);
    await expect(check).not.toBeChecked();
    const mark = review.getByRole("button", {
      name: "Mark reviewed",
      exact: true,
    });
    // These are scrolling context controls; the pinned header never scrolls.
    await mark.scrollIntoViewIfNeeded();
    await tapWhereShown(mark);
    await expect(reviewFeedback(review)).toHaveText("Marked reviewed.");
    expect(keptStoryAMark(dashboard)?.tree).toBe(opened.tree);
    expect(await pageFits(page)).toBe(true);
    await tapWhereShown(
      review.getByRole("button", { name: "Close", exact: true }),
    );
    await expect(action).toBeFocused();
  });
});
