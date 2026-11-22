// Anchored range identities survive new heads and refreshed virtual points;
// vanished endpoints reset permanently to the latest default.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  commitAll,
  git,
  storyFromBase,
  storyWorktree,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { holdNextReviewResponse } from "../../dashboard/test-support/support/holdReviewResponse.ts";
import { storyReviewFileEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";

// Story A's worktree off trunk with its first story commit.
test.use({
  originRepository: storyFromBase()
    .withUnpublishedRevision("first story commit", {
      files: { "first.txt": "first\n" },
    })
    .please(),
});

test("the first Commits default uses the current snapshot, then new commits and switching keep its anchored ends", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const review = await openReviewChanges(page, await openBacklog(page, origin));
  const { commits, files, diffs, status } = review;
  writeAt(workspace, "second.txt", "second\n");
  commitAll(workspace, "second story commit");
  const second = (await review.refreshAndAnswer()).snapshot;
  await diffs.expectSettled();
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewFileEndpoint,
  );
  try {
    await review.comparison.choose("Commits");
    await review.expectRead();
    await commits.expectChosen(0);
    await commits.expectRowText(0, "second story commit");
    await files.expectListed("1 changed file", ["Added second.txt"]);
    expect(await (await held.ready).json()).toMatchObject({ kind: "diff" });
    writeAt(workspace, "third.txt", "third\n");
    commitAll(workspace, "third story commit");
    await review.refreshAndAnswer();
    await commits.expectChosen(0, false);
    await commits.expectChosen(1);
    await status.expectStatusCount(2);
    await diffs.expectReading("Reading the file's diff…");
    await review.status.expectFeedback(
      "Review refreshed: 1 changed file in the chosen range.",
    );
  } finally {
    held.release();
    await held.delivery;
  }
  await commits.choose("last");
  await commits.expectRange("Changes in 2 commits");
  writeAt(workspace, "fourth.txt", "fourth\n");
  commitAll(workspace, "fourth story commit");
  await review.refreshAndAnswer();
  await review.status.expectFeedback(
    "Review refreshed: 2 changed files in the chosen range.",
  );
  await commits.expectChosen(2);
  await commits.expectChosen("last");
  await review.comparison.choose("All changes");
  await review.comparison.choose("Commits");
  await commits.expectRange("Changes in 2 commits");
  // Once both chosen ends reach trunk, the latest item becomes the default.
  git(workspace, "push", "--quiet", "origin", `${second.head}:main`);
  const landed = (await review.refreshAndAnswer()).snapshot;
  // The refreshed snapshot moves the chosen range, which is read again.
  await review.expectRead();
  expect(landed.commits.map(({ subject }) => subject)).toEqual([
    "fourth story commit",
    "third story commit",
  ]);
  await commits.expectChosen(0);
  await commits.expectChosen("last", false);
  await commits.expectRangeSays("fourth story commit to");
  await review.status.expectFeedback(
    "Review refreshed: 1 changed file in the chosen range.",
  );
});

test.describe("from Story A's declared history", () => {
  test.use({ originRepository: storyARepository });

  test("Refresh updates virtual points, resets a vanished virtual end, and does not resurrect it when uncommitted changes return", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const review = await openReviewChanges(
      page,
      await openBacklog(page, origin),
    );
    const { snapshot, commits, files, diffs, status } = review;
    await review.comparison.choose("Commits");
    await review.expectRead();
    await files.expectListed("3 changed files");
    writeAt(workspace, "later.txt", "later virtual point\n");
    await diffs.expectSettled();
    const held = await holdNextReviewResponse(
      page,
      dashboard.origin,
      storyReviewFileEndpoint,
    );
    try {
      const changed = (await review.refreshAndAnswer()).snapshot;
      expect(await (await held.ready).json()).toMatchObject({ kind: "diff" });
      expect(changed.uncommitted?.tree).not.toBe(snapshot.uncommitted?.tree);
      await commits.expectChosen(0);
      await files.expectRows("4 changed files", [
        "fresh",
        "  new.txt",
        "later.txt",
        "staged.txt",
        "unstaged.txt",
      ]);
      await status.expectStatusCount(2);
      await diffs.expectReading("Reading the file's diff…");
      await review.status.expectFeedback(
        "Review refreshed: 4 changed files in the chosen range.",
      );
    } finally {
      held.release();
      await held.delivery;
    }
    await commits.choose("last");
    await commits.expectRange("Changes in 4 commits and Uncommitted changes");
    commitAll(workspace, "commit worktree changes");
    const committed = (await review.refreshAndAnswer()).snapshot;
    // The refreshed snapshot moves the chosen range, which is read again.
    await review.expectRead();
    expect(committed.uncommitted).toBeUndefined();
    await commits.expectRowText(0, "commit worktree changes");
    await commits.expectChosen(0);
    await commits.expectChosen("last", false);
    await commits.expectRange("Changes in 1 commit");
    await review.status.expectFeedback(
      "Review refreshed: 4 changed files in the chosen range.",
    );
    writeAt(workspace, "again.txt", "new uncommitted changes\n");
    const again = (await review.refreshAndAnswer()).snapshot;
    expect(again.uncommitted?.kind).toBe("uncommitted");
    await commits.expectRowText(0, /^Uncommitted changes$/);
    await commits.expectChosen(0, false);
    await commits.expectChosen(1);
    await commits.expectChosen("last", false);
    await commits.expectRange("Changes in 1 commit");
    await files.expectListLacks("4 changed files", "again.txt");
  });
});
