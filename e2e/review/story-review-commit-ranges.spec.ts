// A contiguous range uses its oldest parent and newest tree, while trunk
// the comparison restates the starting tree across trunk integrations.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { olderGit } from "../../dashboard/test-support/support/storyReviewOlderGit.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import {
  observed,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

// Both test objects here start from Story A's declared history.
test.use({ originRepository: storyARepository });

test("two ends select three commits in either direction, reset to one, and survive switching comparisons", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  const before = observed(workspace);
  keepLaunchRecord(dashboard, workspace);
  const review = await openIntentReviewChanges(
    page,
    await openBacklog(page, origin),
  );
  const { snapshot, commits, files, diffs } = review;
  const fourFiles = ["gone.txt", "image.png", "new.txt", "story.txt"];
  await review.comparison.choose("Commits");
  await commits.chooseAlone("last");
  await commits.choose(2, (row) => row.press("Enter"));
  await commits.expectRange(
    "Changes in 3 commits",
    `From ${snapshot.commits[3]?.shortRevision} rename with a small edit to ${snapshot.commits[1]?.shortRevision} delete a file and redraw the image.`,
  );
  for (const at of [2, 3, 4]) await commits.expectChosen(at);
  await commits.expectChosen(0, false);
  await files.expectOutsideRows(fourFiles);
  await files.choose("Renamed old.txt → new.txt");
  await diffs.expectLines("added", ["+renamed"]);
  await review.expectNoText("Trunk was integrated within the range");

  // Starting from the newer end selects the same three commits.
  await commits.choose(2);
  await commits.expectRange("Changes in 1 commit");
  await commits.expectChosen(3, false);
  await commits.choose("last");
  await commits.expectRange("Changes in 3 commits");
  await files.expectOutsideRows(fourFiles);
  await review.comparison.choose("All changes");
  await commits.expectNoRange("Changes in 3 commits");
  await review.comparison.choose("Commits");
  await commits.expectRange("Changes in 3 commits");
  await files.expectOutsideRows(fourFiles);
  expect(observed(workspace)).toEqual(before);
});

olderGit(
  "older Git explains a range across integration with no files, while one below it works",
  async ({ page, dashboard, origin }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const review = await openIntentReviewChanges(
      page,
      await openBacklog(page, origin),
    );
    const { commits, files } = review;
    await review.comparison.choose("Commits");
    await commits.chooseAlone(1);
    await commits.choose("last");
    for (const at of [1, 2, 3, 4]) await commits.expectChosen(at);
    await review.expectText(
      "This machine's Git cannot leave out trunk's changes integrated within the chosen commits, so this range cannot be compared across them.",
    );
    await files.expectNone();
    await commits.choose("last");
    await commits.choose(2);
    await commits.expectRange("Changes in 3 commits");
    await files.expectOutsideRows([
      "gone.txt",
      "image.png",
      "new.txt",
      "story.txt",
    ]);
    await review.expectNoText("cannot be compared");
  },
);
