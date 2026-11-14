import { closeSidePanel } from "../../dashboard/tests/sidePanelFrame.ts";
import { reviewRefresh } from "../../dashboard/tests/support/reviewControls.ts";
// A story's review stays the snapshot taken when it opened, of Story A's
// worktree (../../dashboard/tests/support/storyReviewWorktree.ts), while the worktree moves on:
// a further commit to the open file and a new file change neither the file
// list nor the open diff, even when another file is selected and the first
// reopened. Refresh takes a new snapshot that lists the new file and shows
// the edit in the still selected file's diff, leaves the keyboard on Refresh,
// and announces that it is done in the review's fixed top, beneath the
// context line, where it stays while the file browser scrolls. Closing the
// review and editing the worktree meanwhile, reopening it reads a fresh
// snapshot with that edit, opened on the first file in the browser's order.
// Once the selected file is reverted in the worktree, Refresh selects the
// first file.

import { diffLines } from "../../dashboard/tests/support/reviewPanes.ts";
import { reviewRegion } from "../../dashboard/tests/support/storyReviewMark.ts";
import { reviewChanges } from "../../dashboard/tests/storyCardControls.ts";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  contextLine,
  expectFixedWhileScrolled,
  fileBrowser,
  reviewBody,
  reviewFeedback,
} from "../../dashboard/tests/support/reviewContextLine.ts";
import { expectReviewRead } from "../../dashboard/tests/support/reviewRead.ts";
import {
  expectTreeRows,
  changedFilesList,
  fileDiff,
  listedFile,
} from "../../dashboard/tests/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/tests/support/sessionDialog.ts";
import {
  git,
  storyWorktree,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/tests/support/storyLaunchRecord.ts";

test("a story's review stays fixed while its worktree changes until Refresh", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const action = reviewChanges(card);
  await action.click();
  const review = reviewRegion(page);
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
  const opened = changedFilesList(review, "7 changed files");
  await expectTreeRows(opened, listed);
  const select = (name: string) =>
    listedFile(review, name, { exact: true }).press("Enter");
  const diff = fileDiff(review, "Modified unstaged.txt");
  const codeLines = () => diffLines(diff);
  const printedLines = () => codeLines().allTextContents();
  const edit = "+edited after the review opened";
  await select("Modified unstaged.txt");
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
    await expectTreeRows(opened, listed);
    expect(await printedLines()).toEqual(openedLines);
  });

  await test.step("selecting another file and reopening the first shows the same diff", async () => {
    await select("Modified staged.txt");
    await expect(fileDiff(review, "Modified staged.txt")).toContainText(
      "+more",
    );
    await select("Modified unstaged.txt");
    await expect(codeLines()).toHaveCount(12);
    expect(await printedLines()).toEqual(openedLines);
    expect(await printedLines()).not.toContain(edit);
    await expectTreeRows(opened, listed);
  });

  await test.step("Refresh lists the new file and shows the edit, keeps focus, and announces it", async () => {
    const refresh = reviewRefresh(review);
    await refresh.focus();
    await refresh.press("Enter");
    const refreshed = changedFilesList(review, "8 changed files");
    await expectTreeRows(refreshed, [
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
    const status = reviewFeedback(review);
    await expect(status).toHaveText(
      /^Review refreshed: 8 changed files against baseline [0-9a-f]{7}\.$/,
    );
    // The open file stays selected, its diff read from the new snapshot.
    await expect(
      listedFile(refreshed, "Modified unstaged.txt"),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(diff.getByText(edit, { exact: true })).toBeVisible();
    expect(await printedLines()).toEqual(
      expect.arrayContaining(["-unstaged 5", edit]),
    );
    await expect(refresh).toBeFocused();
    await expect(
      contextLine(review).getByRole("button", { name: "Hide files" }),
    ).toBeVisible();
    // The message sits beneath the context line, above the body, and both
    // stay in place while the file browser scrolls.
    const statusBox = await status.boundingBox();
    const lineBox = await contextLine(review).boundingBox();
    const bodyBox = await reviewBody(review).boundingBox();
    expect(statusBox?.y).toBeGreaterThanOrEqual(
      (lineBox?.y ?? 0) + (lineBox?.height ?? 0),
    );
    expect(bodyBox?.y).toBeGreaterThanOrEqual(
      (statusBox?.y ?? 0) + (statusBox?.height ?? 0),
    );
    await expectFixedWhileScrolled(page, fileBrowser(review), [
      contextLine(review),
      status,
    ]);
  });

  await test.step("an edit made while the review is closed is in the snapshot the reopened review reads", async () => {
    await closeSidePanel(review);
    await expect(review).toHaveCount(0);
    await expect(action).toBeFocused();
    writeFileSync(path.join(workspace, "while-closed.txt"), "closed\n");
    await action.click();
    await expectReviewRead(review);
    const reopened = changedFilesList(review, "9 changed files");
    await expect(listedFile(reopened, "Added while-closed.txt")).toBeVisible();
    // A fresh opening: the first file selected, not the one selected before
    // Close, and no refresh announced.
    await expect(listedFile(reopened, "Added fresh/new.txt")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(listedFile(reopened, "Modified unstaged.txt")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(fileDiff(review, "Added fresh/new.txt")).toContainText(
      "+untracked",
    );
    await expect(reviewFeedback(review)).toHaveText("");
  });

  await test.step("Refresh selects the first file once the selected file is reverted", async () => {
    await select("Modified unstaged.txt");
    await expect(diff.getByText(edit, { exact: true })).toBeVisible();
    git(workspace, "checkout", merged, "--", "unstaged.txt");
    await reviewRefresh(review).press("Enter");
    await expectReviewRead(review);
    const refreshed = changedFilesList(review, "8 changed files");
    await expect(listedFile(refreshed, "Added fresh/new.txt")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(listedFile(refreshed, "Modified unstaged.txt")).toHaveCount(0);
    await expect(fileDiff(review, "Added fresh/new.txt")).toContainText(
      "+untracked",
    );
  });
});
