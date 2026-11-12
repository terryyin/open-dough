// Review changes for a completed story whose integration merge resolved a
// conflict, made its own edits and restored a trunk file that `merge-tree`
// directory-rename heuristics moved (SEED-253 key example 1).
import { fileDiff, listedFile } from "../support/reviewTreeRows.ts";
import { reviewRegion } from "../support/storyReviewMark.ts";
import { expect, test } from "../support/preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { readReview } from "../support/launchLandingReview.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";

test("a completed story's integration edits open with their diffs beside its mixed conflict file", async ({
  page,
  origin,
}) => {
  const { completion } = await completedPublishedStory(
    origin,
    "story-branch",
    "own-conflict-extra",
  );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  expect(await readReview(page, card)).toMatchObject({
    kind: "published",
    completion,
  });
  const review = reviewRegion(page);
  await expect(review).toContainText("Published completion");
  await expect(review).not.toContainText("other.json");
  const shared = "Modified shared.txt, includes trunk's changes";
  await listedFile(review, shared, { exact: true }).click();
  await expect(fileDiff(review, shared, { exact: true })).toContainText(
    "+resolved story and trunk",
  );
  const edit = "Added merge-resolution.txt";
  await listedFile(review, edit, { exact: true }).click();
  await expect(fileDiff(review, edit, { exact: true })).toContainText(
    "+integration edit",
  );
  const renamed = "Renamed checks/before.test.mjs → checks/after.test.mjs";
  await listedFile(review, renamed, { exact: true }).click();
  await expect(fileDiff(review, renamed, { exact: true })).toContainText(
    "+renamed",
  );
});
