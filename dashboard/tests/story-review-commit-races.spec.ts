// A range read owns the chosen points; delivering an earlier real answer
// after a newer range has settled cannot change its heading, files or diff.
import { expect, test } from "./support/preparationPage.ts";
import { storyReviewRangeEndpoint } from "../src/storyReview.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import { storyWorktree } from "./support/storyReviewWorktree.ts";
import { holdNextReviewResponse } from "./support/holdReviewResponse.ts";

test("an earlier pending range cannot answer the later chosen range", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewRangeEndpoint,
  );
  try {
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    const response = await held.ready;
    expect(await response.json()).toMatchObject({
      kind: "comparison",
      files: [
        { kind: "added", path: "fresh/new.txt" },
        { kind: "modified", path: "staged.txt" },
        { kind: "modified", path: "unstaged.txt" },
      ],
    });
    const rows = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await rows.nth(3).click();
    await rows.nth(3).click();
    const heading = review.getByRole("heading", {
      name: "Changes in 1 commit",
    });
    const files = review.getByRole("list", {
      name: "1 changed file",
      exact: true,
    });
    await expect(heading).toBeVisible();
    await expect(review.locator(".story-review-since")).toContainText(
      "story file to",
    );
    await files
      .getByRole("button", { name: "Added story.txt", exact: true })
      .click();
    await expect(review.locator(".story-review-added")).toHaveText(["+story"]);
    held.release();
    await held.delivery;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    await expect(heading).toBeVisible();
    await expect(review.locator(".story-review-since")).toContainText(
      "story file to",
    );
    await expect(
      files.getByRole("button", { name: "Added story.txt", exact: true }),
    ).toBeVisible();
    await expect(review.locator(".story-review-added")).toHaveText(["+story"]);
    await expect(review).not.toContainText(
      "The chosen commits changed nothing.",
    );
  } finally {
    held.release();
    await held.delivery;
  }
});
