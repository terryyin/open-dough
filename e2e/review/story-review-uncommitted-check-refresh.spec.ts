// The check that leaves uncommitted changes out of all changes
// (./story-review-uncommitted-check.spec.ts) keeps its state, of Story A's
// worktree (../../dashboard/test-support/support/storyReviewWorktree.ts). Off, Refresh after the agent
// commits one file and edits another lists the new committed files, still
// off, and announces their count; once everything is committed Refresh
// offers no check over the whole snapshot, and uncommitted changes appearing
// later are offered included. Commits offers no check,
// and returning to All changes finds it as it was left. Off, Previous file
// and Next file move through the committed files alone and a binary file's
// diff is read to the head's tree; Close and Review changes starts with the
// check on.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { storyReviewFileEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  openIntentReviewChanges,
  openReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  commitAll,
  git,
  storyWorktree,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

const committedFiles = ["gone.txt", "image.png", "new.txt", "story.txt"];

const refreshed = (files: number) =>
  new RegExp(
    `^Review refreshed: ${String(files)} changed files against baseline [0-9a-f]{7}\\.$`,
  );

test("Refresh keeps the check off while uncommitted changes remain, drops it when none do, and offers it on when they return", async ({
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
  await review.comparison.includeUncommitted(false);
  await review.files.expectOutsideRows(committedFiles);

  // The agent commits the staged file and keeps editing another.
  git(workspace, "commit", "--quiet", "-m", "staged edit");
  writeFileSync(path.join(workspace, "unstaged.txt"), "on\n", { flag: "a" });
  const partly = (await review.refreshAndAnswer()).snapshot;
  expect(partly.files).toHaveLength(7);
  await review.files.expectOutsideRows([
    "gone.txt",
    "image.png",
    "new.txt",
    "staged.txt",
    "story.txt",
  ]);
  await review.comparison.expectUncommittedIncluded(false);
  await review.expectFeedback(refreshed(5));

  // The agent commits everything: no check, the whole snapshot.
  commitAll(workspace, "the rest");
  const committed = (await review.refreshAndAnswer()).snapshot;
  expect(committed.committed).toBeUndefined();
  await review.files.expectOutsideRows([
    "fresh",
    "  new.txt",
    "gone.txt",
    "image.png",
    "new.txt",
    "staged.txt",
    "story.txt",
    "unstaged.txt",
  ]);
  await review.comparison.expectUncommittedIncluded("not offered");
  await review.expectFeedback(refreshed(7));

  // Uncommitted work again: the check is back, on.
  writeAt(workspace, "again.txt", "again\n");
  const again = (await review.refreshAndAnswer()).snapshot;
  expect(again.committed?.files).toHaveLength(7);
  await review.files.expectOutsideCount(8);
  await review.comparison.expectUncommittedIncluded(true);
  await review.expectFeedback(refreshed(8));
});

test("Commits offers no check, and All changes finds it as it was left", async ({
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

  await review.comparison.expectUncommittedIncluded(true);
  await review.comparison.includeUncommitted(false);
  await review.files.expectOutsideRows(committedFiles);

  await review.comparison.choose("Commits");
  await review.commits.expectRowText(0, /^Uncommitted changes$/);
  await review.comparison.expectUncommittedIncluded("not offered");

  await review.comparison.choose("All changes");
  await review.comparison.expectUncommittedIncluded(false);
  await review.files.expectOutsideRows(committedFiles);
});

test("with the check off the file moves stay within the committed files and a binary file reads to the head's tree; reopening starts with the check on", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const review = await openReviewChanges(page, card);
  const { snapshot: shown, files, diffs } = review;
  const image = "Modified image.png";
  const noDiff = "This file has no textual diff: Git reads it as binary.";
  await files.chooseShown(image, "keyboard");
  await diffs.expectShows(image, noDiff);

  // Off: the same answer for the committed image, read to the head's tree.
  const read = page.waitForRequest((request) => {
    const { pathname, searchParams } = new URL(request.url());
    return (
      pathname === storyReviewFileEndpoint &&
      searchParams.get("path") === "image.png"
    );
  });
  await review.comparison.includeUncommitted(false);
  const asked = new URL((await read).url()).searchParams;
  expect(shown.committed?.tree).not.toBe(shown.tree);
  expect(asked.get("tree")).toBe(shown.committed?.tree);
  expect(asked.get("baseline")).toBe(shown.baseline);
  await files.expectSelected(image);
  await diffs.expectShows(image, noDiff);
  await diffs.expectNoLines(image);

  // The moves end at the first and last committed file.
  await files.move("Previous file");
  await files.expectSelected("Deleted gone.txt");
  await files.expectMoveAtEnd("Previous file");
  for (const name of [image, "Renamed old.txt → new.txt", "Added story.txt"]) {
    await files.move("Next file");
    await files.expectSelected(name);
  }
  await files.expectMoveAtEnd("Next file");

  await review.close();
  const reopened = await openReviewChanges(page, card);
  await reopened.comparison.expectUncommittedIncluded(true);
  await reopened.files.expectListed("7 changed files");
});
