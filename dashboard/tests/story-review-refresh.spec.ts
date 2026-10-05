// A story's review stays the snapshot taken when it opened, of Story A's
// worktree (./support/storyReviewWorktree.ts), while the worktree moves on:
// a further commit to the open file and a new file change neither the file
// list nor the open diff, even when another file is selected and the first
// reopened. Refresh takes a new snapshot that lists the new file and shows
// the edit in the still selected file's diff, leaves the keyboard on Refresh,
// and announces that it is done in the review's fixed top, beneath the
// context line, where it stays while the file browser scrolls. Closing the
// review and editing the worktree meanwhile, reopening it reads a fresh
// snapshot with that edit.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  expectFixedWhileScrolled,
  fileBrowser,
  reviewBody,
  reviewFeedback,
} from "./support/reviewContextLine.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { git, storyWorktree } from "./support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";

test("a story's review stays fixed while its worktree changes until Refresh", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.click();
  const review = page.getByRole("region", { name: "Review changes" });
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
  const opened = review.getByRole("list", { name: "7 changed files" });
  await expect.poll(() => treeRows(opened)).toEqual(listed);
  const select = (name: string) =>
    review.getByRole("button", { name, exact: true }).press("Enter");
  const diff = review.getByRole("region", { name: "Modified unstaged.txt" });
  const diffLines = () => diff.getByRole("listitem").allTextContents();
  const edit = "+edited after the review opened";
  await select("Modified unstaged.txt");
  await expect(diff.getByRole("listitem")).toHaveCount(12);
  const openedLines = await diffLines();
  expect(openedLines).toContain("-unstaged 5");

  // The worktree moves on: the open file gets a further committed edit, and
  // a new file appears.
  const unstaged = path.join(workspace, "unstaged.txt");
  writeFileSync(unstaged, "edited after the review opened\n", { flag: "a" });
  git(workspace, "add", "unstaged.txt");
  git(workspace, "commit", "--quiet", "-m", "further edit");
  writeFileSync(path.join(workspace, "later.txt"), "later\n");

  await test.step("the list and the open diff stay as the review took them", async () => {
    await expect.poll(() => treeRows(opened)).toEqual(listed);
    expect(await diffLines()).toEqual(openedLines);
  });

  await test.step("selecting another file and reopening the first shows the same diff", async () => {
    await select("Modified staged.txt");
    await expect(
      review.getByRole("region", { name: "Modified staged.txt" }),
    ).toContainText("+more");
    await select("Modified unstaged.txt");
    await expect(diff.getByRole("listitem")).toHaveCount(12);
    expect(await diffLines()).toEqual(openedLines);
    expect(await diffLines()).not.toContain(edit);
    await expect.poll(() => treeRows(opened)).toEqual(listed);
  });

  await test.step("Refresh lists the new file and shows the edit, keeps focus, and announces it", async () => {
    const refresh = review.getByRole("button", { name: "Refresh" });
    await refresh.focus();
    await refresh.press("Enter");
    const refreshed = review.getByRole("list", { name: "8 changed files" });
    await expect
      .poll(() => treeRows(refreshed))
      .toEqual([
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
      refreshed.getByRole("button", { name: "Modified unstaged.txt" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(diff.getByText(edit, { exact: true })).toBeVisible();
    expect(await diffLines()).toEqual(
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
    await review.getByRole("button", { name: "Close", exact: true }).click();
    await expect(review).toHaveCount(0);
    await expect(action).toBeFocused();
    writeFileSync(path.join(workspace, "while-closed.txt"), "closed\n");
    await action.click();
    const reopened = review.getByRole("list", { name: "9 changed files" });
    await expect(
      reopened.getByRole("button", { name: "Added while-closed.txt" }),
    ).toBeVisible();
    // A fresh opening: nothing selected and no refresh announced.
    await expect(
      reopened.getByRole("button", { name: "Modified unstaged.txt" }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(reviewFeedback(review)).toHaveText("");
  });
});
