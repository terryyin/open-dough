// A story's review stays the snapshot taken when it opened, of Story A's
// worktree (../../dashboard/test-support/support/storyReviewWorktree.ts), while the worktree moves on:
// a further commit to the open file and a new file change neither the file
// list nor the open diff, even when another file is selected and the first
// reopened. Refresh takes a new snapshot that lists the new file and shows
// the edit in the still selected file's diff, leaves the keyboard on Refresh,
// and announces that it is done in the review's status above the work area,
// beneath the context line, where it stays while the file browser scrolls.
// Closing the review and editing the worktree meanwhile, reopening it reads
// a fresh snapshot with that edit, opened on the first file in the browser's
// order. Once the selected file is reverted in the worktree, Refresh selects
// the first file.

import { diffLines } from "../../dashboard/test-support/support/reviewPanes.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { expectFixedWhileScrolled } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  git,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

test("a story's review stays fixed while its worktree changes until Refresh", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const action = reviewChanges(card);
  let review = await openReviewChanges(page, card);
  // The review's details are shown, so its context line is in the top.
  await review.details.show();
  const listed = [
    "fresh",
    "  new.txt",
    "gone.txt",
    "image.png",
    "new.txt",
    "staged.txt",
    "story.txt",
    "unstaged.txt",
  ];
  let list = "7 changed files";
  await review.files.expectRows(list, listed);
  const select = (name: string) => review.files.choose(list, name, "keyboard");
  const unstagedDiff = "Modified unstaged.txt";
  const codeLines = () => diffLines(review.diffs.toRead(unstagedDiff));
  const printedLines = () => codeLines().allTextContents();
  const edit = "+edited after the review opened";
  await select(unstagedDiff);
  await expect(codeLines()).toHaveCount(12);
  const openedLines = await printedLines();
  expect(openedLines).toContain("-unstaged 5");

  // The worktree moves on: the open file gets a further committed edit, and
  // a new file appears.
  const unstaged = path.join(workspace, "unstaged.txt");
  writeFileSync(unstaged, "edited after the review opened\n", { flag: "a" });
  git(workspace, "add", "unstaged.txt");
  git(workspace, "commit", "--quiet", "-m", "further edit");
  writeFileSync(path.join(workspace, "later.txt"), "later\n");

  await test.step("the list and the open diff stay as the review took them", async () => {
    await review.files.expectRows(list, listed);
    expect(await printedLines()).toEqual(openedLines);
  });

  await test.step("selecting another file and reopening the first shows the same diff", async () => {
    await select("Modified staged.txt");
    await review.diffs.expectShows("Modified staged.txt", "+more");
    await select(unstagedDiff);
    await expect(codeLines()).toHaveCount(12);
    expect(await printedLines()).toEqual(openedLines);
    expect(await printedLines()).not.toContain(edit);
    await review.files.expectRows(list, listed);
  });

  await test.step("Refresh lists the new file and shows the edit, keeps focus, and announces it", async () => {
    await review.refreshAndAnswer("keyboard");
    list = "8 changed files";
    await review.files.expectRows(list, [
      "fresh",
      "  new.txt",
      "gone.txt",
      "image.png",
      "later.txt",
      "new.txt",
      "staged.txt",
      "story.txt",
      "unstaged.txt",
    ]);
    await review.status.expectFeedback(
      /^Review refreshed: 8 changed files against baseline [0-9a-f]{7}\.$/,
    );
    // The open file stays selected, its diff read from the new snapshot.
    await review.files.expectChosen(list, unstagedDiff);
    await review.diffs.expectLine(unstagedDiff, edit);
    expect(await printedLines()).toEqual(
      expect.arrayContaining(["-unstaged 5", edit]),
    );
    await review.status.expectRefreshFocused();
    await review.expectFilesToggleNamed("Hide files");
    // The message sits beneath the context line, above the body, and both
    // stay in place while the file browser scrolls.
    const { feedback, contextLine, body, fileBrowser } =
      review.frame.partsToMeasure();
    const statusBox = await feedback.boundingBox();
    const lineBox = await contextLine.boundingBox();
    const bodyBox = await body.boundingBox();
    expect(statusBox?.y).toBeGreaterThanOrEqual(
      (lineBox?.y ?? 0) + (lineBox?.height ?? 0),
    );
    expect(bodyBox?.y).toBeGreaterThanOrEqual(
      (statusBox?.y ?? 0) + (statusBox?.height ?? 0),
    );
    await expectFixedWhileScrolled(page, fileBrowser, [contextLine, feedback]);
  });

  await test.step("an edit made while the review is closed is in the snapshot the reopened review reads", async () => {
    await review.close();
    await expect(action).toBeFocused();
    writeFileSync(path.join(workspace, "while-closed.txt"), "closed\n");
    review = await openReviewChanges(page, card);
    await review.expectRead();
    list = "9 changed files";
    await review.files.expectListed(list, ["Added while-closed.txt"]);
    // A fresh opening: the first file selected, not the one selected before
    // Close, and no refresh announced.
    await review.files.expectChosen(list, "Added fresh/new.txt");
    await review.files.expectChosen(list, unstagedDiff, false);
    await review.diffs.expectShows("Added fresh/new.txt", "+untracked");
    await review.status.expectFeedback("");
  });

  await test.step("Refresh selects the first file once the selected file is reverted", async () => {
    await select(unstagedDiff);
    await review.diffs.expectLine(unstagedDiff, edit);
    git(workspace, "checkout", merged, "--", "unstaged.txt");
    await review.status.refreshByKeyboard();
    list = "8 changed files";
    await review.files.expectChosen(list, "Added fresh/new.txt");
    await review.files.expectNotShown(unstagedDiff);
    await review.diffs.expectShows("Added fresh/new.txt", "+untracked");
  });
});
