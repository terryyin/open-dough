// A worktree's current comparison stays readable while Refresh has a newer
// snapshot in flight. The settled snapshot keeps a still-listed file selected.
import { diffLines } from "../../dashboard/test-support/support/reviewPanes.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { holdNextReviewResponse } from "../../dashboard/test-support/support/holdReviewResponse.ts";
import { storyReviewEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
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
  let review = await openIntentReviewChanges(page, card);
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
  await review.files.expectOutsideRows(listed);
  const select = (name: string) => review.files.choose(name, "keyboard");
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
    await review.files.expectOutsideRows(listed);
    expect(await printedLines()).toEqual(openedLines);
  });

  await test.step("selecting another file and reopening the first shows the same diff", async () => {
    await select("Modified staged.txt");
    await review.diffs.expectShows("Modified staged.txt", "+more");
    await select(unstagedDiff);
    await expect(codeLines()).toHaveCount(12);
    expect(await printedLines()).toEqual(openedLines);
    expect(await printedLines()).not.toContain(edit);
    await review.files.expectOutsideRows(listed);
  });

  await test.step("Refresh lists the new file and shows the edit, keeps focus, and announces it", async () => {
    const held = await holdNextReviewResponse(
      page,
      dashboard.origin,
      storyReviewEndpoint,
    );
    try {
      await review.refresh("keyboard");
      await held.ready;
      await review.expectFeedback("The previous comparison stays visible.");
      await review.files.expectOutsideRows(listed);
      expect(await printedLines()).toEqual(openedLines);
    } finally {
      held.release();
      await held.delivery;
    }
    await review.files.expectOutsideRows([
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
    await review.expectFeedback(
      /^Review refreshed: 8 changed files against baseline [0-9a-f]{7}\.$/,
    );
    // The open file stays selected, its diff read from the new snapshot.
    await review.files.expectSelected(unstagedDiff);
    await review.diffs.expectLine(unstagedDiff, edit);
    expect(await printedLines()).toEqual(
      expect.arrayContaining(["-unstaged 5", edit]),
    );
    await review.expectRefreshFocused();
  });

  await test.step("an edit while in Development is included on entering Intent again", async () => {
    await parts(page).development.click();
    writeFileSync(path.join(workspace, "while-closed.txt"), "closed\n");
    review = await openIntentReviewChanges(page, card);
    await review.files.expectOutsideFiles(9, ["Added while-closed.txt"]);
    await review.expectNoText("Review refreshed:");
  });

  await test.step("Refresh drops the diff once the selected file is reverted", async () => {
    await select(unstagedDiff);
    await review.diffs.expectLine(unstagedDiff, edit);
    git(workspace, "checkout", merged, "--", "unstaged.txt");
    await review.refresh("keyboard");
    await review.files.expectOutsideCount(8);
    await review.files.expectNotShown(unstagedDiff);
    await review.diffs.expectAbsent();
  });
});
