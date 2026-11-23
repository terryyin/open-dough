// The virtual newest item accounts for the whole snapshot without pretending
// to be a commit.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { storyReviewRangeEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  observed,
  storyWorktree,
  unchangedRepository,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { withLocalState } from "../../Distribution/tests/support/repository-local-state.mjs";

// Story A's worktree straight off trunk with one untracked file.
test.use({
  originRepository: withLocalState(unchangedRepository, {
    untracked: { "only.txt": "only uncommitted\n" },
  }),
});

test.describe("from Story A's declared history", () => {
  test.use({ originRepository: storyARepository });

  test("Uncommitted changes alone reads staged, unstaged and untracked files; through the oldest commit it equals All changes", async ({
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
    expect(snapshot.uncommitted).toMatchObject({
      kind: "uncommitted",
      tree: snapshot.tree,
      baseline: snapshot.baseline,
    });
    expect(snapshot.uncommitted).not.toHaveProperty("revision");
    expect(snapshot.uncommitted).not.toHaveProperty("committedAt");
    await review.comparison.choose("Commits");
    await commits.expectRowText(0, /^Uncommitted changes$/);
    await commits.expectNoTime(0);
    await commits.expectChosen(0);
    await commits.expectRange(/^Uncommitted changes$/);
    await files.expectOutsideRows([
      "fresh",
      "  new.txt",
      "staged.txt",
      "unstaged.txt",
    ]);
    await files.choose("Modified staged.txt");
    await diffs.expectLines("added", ["+more"]);
    await files.choose("Modified unstaged.txt");
    await diffs.expectLines("removed", ["-unstaged 5"]);
    await files.choose("Added fresh/new.txt");
    await diffs.expectLines("added", ["+untracked"]);
    await files.expectOutsideLacks("ignored.log");
    const rangeRead = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === storyReviewRangeEndpoint,
    );
    await commits.choose("last");
    expect(await (await rangeRead).json()).toMatchObject({
      kind: "comparison",
      files: snapshot.files,
      tree: snapshot.tree,
    });
    await commits.expectRange(
      "Changes in 4 commits and Uncommitted changes",
      "to Uncommitted changes.",
    );
    await files.expectOutsideCount(7);
    expect(observed(workspace)).toEqual(before);
  });
});

test("an uncommitted-only snapshot offers Commits without inventing a commit", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const review = await openIntentReviewChanges(
    page,
    await openBacklog(page, origin),
  );
  expect(review.snapshot.commits).toEqual([]);
  await review.comparison.choose("Commits");
  await review.expectRead();
  await review.commits.expectRows(["Uncommitted changes"]);
  await review.files.expectOutsideFiles(1, ["Added only.txt"]);
  await review.files.choose("Added only.txt");
  await review.diffs.expectLines("added", ["+only uncommitted"]);
});
