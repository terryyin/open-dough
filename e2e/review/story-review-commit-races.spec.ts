// A range read owns the chosen points; delivering an earlier real answer
// after a newer range has settled cannot change its heading, files or diff.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { storyReviewRangeEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { holdNextReviewResponse } from "../../dashboard/test-support/support/holdReviewResponse.ts";

test("an earlier pending range cannot answer the later chosen range", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const review = await openReviewChanges(page, await openBacklog(page, origin));
  const { commits, files, diffs } = review;
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewRangeEndpoint,
  );
  try {
    await review.comparison.choose("Commits");
    const response = await held.ready;
    expect(await response.json()).toMatchObject({
      kind: "comparison",
      files: [
        { kind: "added", path: "fresh/new.txt" },
        { kind: "modified", path: "staged.txt" },
        { kind: "modified", path: "unstaged.txt" },
      ],
    });
    await commits.press(3);
    await commits.choose(3);
    await commits.expectRange("Changes in 1 commit", "story file to");
    await files.choose("1 changed file", "Added story.txt");
    await diffs.expectLines("added", ["+story"]);
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
    await commits.expectRange("Changes in 1 commit", "story file to");
    await files.expectListed("1 changed file", ["Added story.txt"]);
    await diffs.expectLines("added", ["+story"]);
    await review.expectNoText("The chosen commits changed nothing.");
  } finally {
    held.release();
    await held.delivery;
  }
});
