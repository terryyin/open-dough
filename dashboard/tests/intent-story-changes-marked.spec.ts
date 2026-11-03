// Intent's comparison for a story with a review mark: Intent shows all
// changes, including uncommitted ones, and its Review changes link opens
// Review changes on that same comparison, with the files Intent counted and
// the same diff, whether the review is opened afresh or is already shown on
// another choice. Review changes opened from the card keeps its own default,
// the changes since the review. The unmarked journey:
// ./intent-story-changes.spec.ts.

import type { Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  intentDiff,
  openReviewFromIntent,
  reviewDiff,
  selectTakenStoryInIntent,
} from "./support/intentStoryPage.ts";
import { changed } from "./support/intentStoryWorktree.ts";
import {
  expectShown,
  markReviewed,
  openStoryReview,
  reviewRegion,
  uncommittedCheck,
} from "./support/storyReviewMark.ts";

test.setTimeout(120_000);

// Review changes lists every file Intent counted, the outside ones too.
async function expectIntentFiles(page: Page) {
  const files = reviewRegion(page).locator(".story-review-files");
  for (const name of [
    ...Object.values(changed),
    "Modified dashboard/src/App.tsx",
  ])
    await expect(
      files.getByRole("button", { name, exact: true }),
    ).toBeVisible();
}

const closeReview = async (page: Page) => {
  await reviewRegion(page)
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(reviewRegion(page)).toHaveCount(0);
};

test("Intent's Review changes link opens a marked story's review on Intent's comparison, all changes including uncommitted ones", async ({
  page,
  origin,
}) => {
  const { card, intent } = await selectTakenStoryInIntent(page, origin);
  const { development, intentChoice } = parts(page);
  const review = reviewRegion(page);
  const inIntent = await intentDiff(intent, changed.modified);
  const added = await intentDiff(intent, changed.added);

  await test.step("the story is marked reviewed from its card", async () => {
    await development.click();
    await openStoryReview(page, card);
    await markReviewed(review);
    // Closing the review clears the selected story; select it again for Intent.
    await closeReview(page);
    await card.getByRole("heading", { level: 3 }).click();
    await intentChoice.click();
  });

  await test.step("Intent's link opens Review changes on all changes, including uncommitted ones, with Intent's files and diffs", async () => {
    await openReviewFromIntent(page, intent);
    await expectShown(review, "All changes");
    await expect(uncommittedCheck(review)).toBeChecked();
    await expectIntentFiles(page);
    expect(await reviewDiff(page, changed.modified)).toBe(inIntent);
    expect(await reviewDiff(page, changed.added)).toBe(added);
    await closeReview(page);
  });

  await test.step("Review changes opened from the card keeps its own default, since the review", async () => {
    await development.click();
    await openStoryReview(page, card);
    await expectShown(review, "Since the review");
  });

  await test.step("Intent's link turns the review already shown to Intent's comparison", async () => {
    await intentChoice.click();
    await openReviewFromIntent(page, intent);
    await expectShown(review, "All changes");
    await expectIntentFiles(page);
    expect(await reviewDiff(page, changed.modified)).toBe(inIntent);
  });
});
