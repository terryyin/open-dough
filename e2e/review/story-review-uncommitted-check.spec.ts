// All changes of a story's review can leave its uncommitted changes out, of
// Story A's worktree (../../dashboard/test-support/support/storyReviewWorktree.ts) with a committed
// file edited again: the check “Include uncommitted changes” is on at
// opening over the whole snapshot. Off, the review lists the committed files
// alone with their committed lines and counts, and says in words, as the
// check's description, that uncommitted changes are left out; on again shows
// the whole snapshot without reading a new snapshot or commit range. The
// selected file stays selected while both list it, and otherwise the first
// file is. A worktree without uncommitted changes offers no check; one with
// nothing committed says so while the check is off and keeps the check.

import type { Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewRangeEndpoint,
} from "../../dashboard/src/storyReviewContract.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  nestedRepository,
  storyWorktree,
  unchangedRepository,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { withLocalState } from "../../Distribution/tests/support/repository-local-state.mjs";

test.describe("from Story A's declared history", () => {
  // Story A's worktree with its committed story file edited again, uncommitted.
  test.use({
    originRepository: withLocalState(storyARepository, {
      unstaged: { "story.txt": "story\nmore\n" },
    }),
  });

  // The snapshot and range requests the page has made so far.
  function reviewRequests(page: Page) {
    const made: string[] = [];
    page.on("request", (request) => {
      const { pathname } = new URL(request.url());
      if ([storyReviewEndpoint, storyReviewRangeEndpoint].includes(pathname))
        made.push(pathname);
    });
    return () => made;
  }

  test("the check leaves uncommitted changes out of all changes and back without reading the snapshot again", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    const { files, diffs } = review;
    const story = "Added story.txt";

    // On at opening: the whole snapshot.
    await files.expectListed("7 changed files");
    await review.comparison.expectUncommittedIncluded(true);
    await files.chooseShown(story, "keyboard");
    await files.expectLineCounts(story, "+2 −0");
    await diffs.expectShows(story, "+story", "+more");
    const requests = reviewRequests(page);

    // Off: the committed files, lines, and counts alone.
    await review.comparison.includeUncommitted(false);
    await files.expectRows("4 changed files", [
      "gone.txt",
      "image.png",
      "new.txt",
      "story.txt",
    ]);
    await files.expectHeading("4 changed files");
    await files.expectListGone("7 changed files");
    await files.expectLineCounts(story, "+1 −0");
    await files.expectDescribed(story, "1 line added, 0 lines removed");
    await diffs.expectShows(story, "+story");
    await diffs.expectLacks(story, "+more");
    await review.comparison.expectUncommittedIncluded(false);

    // On again: the whole snapshot, as read at opening.
    await review.comparison.includeUncommitted(true);
    await files.expectListed("7 changed files");
    await files.expectLineCounts(story, "+2 −0");
    await diffs.expectShows(story, "+more");
    expect(requests()).toEqual([]);
  });

  test("the selected file stays selected while the committed files list it, and otherwise the first file is", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    const { files } = review;

    await files.chooseShown("Added story.txt", "keyboard");
    await review.comparison.includeUncommitted(false);
    await files.expectListed("4 changed files");
    await files.expectSelected("Added story.txt");

    await review.comparison.includeUncommitted(true);
    await files.expectSelected("Added story.txt");
    await files.chooseShown("Modified staged.txt", "keyboard");
    await files.expectSelected("Modified staged.txt");
    await review.comparison.includeUncommitted(false);
    await files.expectSelected("Deleted gone.txt");
    await files.expectNotShown("Modified staged.txt");
  });
});

test.describe("from nested changes", () => {
  test.use({ originRepository: nestedRepository });
  test("a worktree without uncommitted changes offers no check", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    await review.files.expectListed("6 changed files");
    await review.comparison.expectUncommittedIncluded("not offered");
    expect(review.snapshot.committed).toBeUndefined();
  });
});

test.describe("straight off trunk", () => {
  test.use({
    originRepository: withLocalState(unchangedRepository, {
      untracked: { "wip.txt": "work in progress\n" },
    }),
  });
  test("with nothing committed, the check off says so, lists no files, and stays to turn back on", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    await review.files.expectListed("1 changed file");
    await review.comparison.expectUncommittedIncluded(true);

    await review.comparison.includeUncommitted(false);
    await review.status.expectBodyText(
      /^Nothing is committed yet: every change in this worktree is uncommitted\.$/,
    );
    await review.files.expectNone();
    await review.expectNoFilesToggle();
    await review.comparison.expectUncommittedIncluded(false);

    await review.comparison.includeUncommitted(true);
    await review.files.expectListed("1 changed file");
  });
});
