// All changes of a story's review can leave its uncommitted changes out, of
// Story A's worktree (../../dashboard/test-support/support/storyReviewWorktree.ts) with a committed
// file edited again: the check “Include uncommitted changes” is on at
// opening over the whole snapshot. Off, the review lists the committed files
// alone with their committed lines, and switching back shows the whole
// snapshot without reading a new snapshot or commit range. The selected
// diff stays while its file is part of the comparison. A worktree without uncommitted changes offers no check; one with
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
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
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
    const review = await openIntentReviewChanges(page, card);
    const { files, diffs } = review;
    const story = "Added story.txt";

    // On at opening: the whole snapshot.
    await files.expectOutsideCount(7);
    await review.comparison.expectUncommittedIncluded(true);
    await files.choose(story, "keyboard");

    await diffs.expectShows(story, "+story", "+more");
    const requests = reviewRequests(page);

    // Off: the committed files, lines, and counts alone.
    await review.comparison.includeUncommitted(false);
    await files.expectOutsideRows([
      "gone.txt",
      "image.png",
      "new.txt",
      "story.txt",
    ]);
    await files.expectOutsideCount(4);
    await diffs.expectShows(story, "+story");
    await diffs.expectLacks(story, "+more");
    await review.comparison.expectUncommittedIncluded(false);

    // On again: the whole snapshot, as read at opening.
    await review.comparison.includeUncommitted(true);
    await files.expectOutsideCount(7);

    await diffs.expectShows(story, "+more");
    expect(requests()).toEqual([]);
  });

  test("the selected file stays selected while the committed files list it, and drops the diff when the committed files omit it", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { files } = review;

    await files.choose("Added story.txt", "keyboard");
    await review.comparison.includeUncommitted(false);
    await files.expectOutsideCount(4);
    await files.expectSelected("Added story.txt");

    await review.comparison.includeUncommitted(true);
    await files.expectSelected("Added story.txt");
    await files.choose("Modified staged.txt", "keyboard");
    await files.expectSelected("Modified staged.txt");
    await review.comparison.includeUncommitted(false);
    await review.diffs.expectAbsent();
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
    const review = await openIntentReviewChanges(page, card);
    await review.files.expectOutsideCount(6);
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
    const review = await openIntentReviewChanges(page, card);
    await review.files.expectOutsideCount(1);
    await review.comparison.expectUncommittedIncluded(true);

    await review.comparison.includeUncommitted(false);
    await review.expectText(
      /Nothing is committed yet: every change in this worktree is uncommitted\./,
    );
    await review.files.expectNone();
    await review.diffs.expectAbsent();
    await review.comparison.expectUncommittedIncluded(false);

    await review.comparison.includeUncommitted(true);
    await review.files.expectOutsideCount(1);
  });
});
