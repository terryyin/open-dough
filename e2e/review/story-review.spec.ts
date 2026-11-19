// Story A's worktree review names its branch and baseline, selects its first
// changed file and leaves Git state intact. Diffs number added and removed
// lines and use old paths for renames. Hiding files widens the diff.
// Only story files appear, grouped by kind and folder. Images have no text diff.
// Command+Shift+Escape returns focus to Review changes, then Tab moves on.
// Related checks: ./story-review-context-line.spec.ts, ./story-review-diff-context.spec.ts,
// and ../../dashboard/backend-tests/review/story-review-refusal.spec.ts.

import {
  codePane,
  diffHunk,
  diffLines,
  expectHunkLines,
  hunkLines,
  pageFits,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { expectFocusedAndIndicated } from "../../dashboard/test-support/accessibleReading.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { box } from "../../dashboard/test-support/pageLayout.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { shownLineNumbers } from "../../dashboard/test-support/support/reviewLineNumbers.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  branch,
  git,
  observed,
  storyWorktree,
  wideLine,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

test("a story's review names its worktree, branch, and baseline and lists only the story's changed files", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged, later } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);
  const fetchedTrunk = () => git(workspace, "rev-parse", "origin/main");
  expect(fetchedTrunk()).toBe(merged);

  const card = await openBacklog(page, origin);
  const action = reviewChanges(card);
  const review = await openReviewChanges(page, card);
  const { files, diffs } = review;
  // The panel names the story it reviews, beside the dashboard, and holds
  // the keyboard in its named content.
  await review.frame.expectHeading("Story A");
  await review.frame.expectIdentity(queuedIdentity);
  await review.status.expectKeyboardInBody();
  const list = "7 changed files";
  await files.expectRows(list, [
    "fresh",
    "  new.txt",
    "gone.txt",
    "image.png",
    "new.txt",
    "staged.txt",
    "story.txt",
    "unstaged.txt",
  ]);
  // Each file's control says its kind and full path in words; a folder's
  // disclosure is not pressable. The review opens on the first file in the
  // browser's order, inside the folder that comes first, its diff shown.
  await files.expectFileControls(list, [
    "Added fresh/new.txt",
    "Deleted gone.txt",
    "Modified image.png",
    "Renamed old.txt → new.txt",
    "Modified staged.txt",
    "Added story.txt",
    "Modified unstaged.txt",
  ]);
  await files.expectChosen(list, "Added fresh/new.txt");
  await expect(diffLines(diffs.toRead("Added fresh/new.txt"))).toHaveText([
    "+untracked",
  ]);
  // The context line reads every value in full, the read-only explanation
  // is the review's description, never a visible line.
  await review.context.expectWords(
    contextWords({
      branch,
      baseline: merged,
      workspace: "~/git/open-dough/.worktrees/story-a",
    }),
  );
  await review.frame.expectDescription(
    "Read-only: what this story's worktree would add to trunk, as it was when the review opened or was last refreshed.",
  );
  await review.frame.expectUnshown(/^Read-only/);
  for (const absent of ["other.txt", "other2.txt", "ignored.log"])
    await review.expectNoText(absent);
  // The review fetched trunk and left the worktree's index and files alone.
  expect(fetchedTrunk()).toBe(later);
  expect(observed(workspace)).toEqual(before);
  // Paths scroll within the review, never the page.
  expect(await pageFits(page)).toBe(true);

  // A file's diff: its hunks' lines, each marked +, -, or a space.
  const diffOf = (name: string) => diffs.toRead(name);
  const select = (name: string) => files.choose(list, name, "keyboard");

  await test.step("a modified file's diff marks its added and removed lines", async () => {
    await select("Modified unstaged.txt");
    await files.expectChosen(list, "Modified unstaged.txt");
    const diff = diffOf("Modified unstaged.txt");
    await expectHunkLines(diff, "@@ -3,10 +3,11 @@", [
      " unstaged 2",
      " unstaged 3",
      " unstaged 4",
      "-unstaged 5",
      "+unstaged five",
      " unstaged 6",
      " unstaged 7",
      " unstaged 8",
      " unstaged 9",
      " unstaged 10",
      " unstaged 11",
      `+${wideLine}`,
    ]);
    // The wide line scrolls within the diff, never the page.
    const code = codePane(diff);
    expect(
      await code.evaluate((region) => region.scrollWidth > region.clientWidth),
    ).toBe(true);
    expect(await pageFits(page)).toBe(true);
  });

  await test.step("hiding the file browser leaves the diff in place with more room", async () => {
    const diff = diffOf("Modified unstaged.txt");
    const narrow = (await diff.boundingBox())?.width ?? 0;
    // Hide files leads the toolbar, above the context line.
    const shownAt = await review.expectFilesToggleLeads("All changes");
    await review.expectFilesToggleNamed("Hide files");
    const { line } = await review.context.toMeasure();
    expect((await box(line)).y).toBeGreaterThan(shownAt.y);
    await review.hideFiles("keyboard");
    await review.expectFilesToggleFocused("Show files");
    // The toggle keeps its place while the sidebar is hidden.
    expect(await review.expectFilesToggleLeads("All changes")).toEqual(shownAt);
    await review.expectFilesShown(false);
    await expect(hunkLines(diff, "@@ -3,10 +3,11 @@")).toHaveCount(12);
    expect((await diff.boundingBox())?.width ?? 0).toBeGreaterThan(
      narrow + 200,
    );
    await review.showFiles("keyboard");
    await review.expectFilesToggleFocused("Hide files");
    expect(await review.expectFilesToggleLeads("All changes")).toEqual(shownAt);
    // The sidebar returns with the file that was being read still selected.
    await review.expectFilesShown(true);
    await files.expectChosen(list, "Modified unstaged.txt");
    await expect(hunkLines(diff, "@@ -3,10 +3,11 @@")).toHaveCount(12);
  });

  await test.step("the rename's diff is against its old path", async () => {
    await select("Renamed old.txt → new.txt");
    const diff = diffOf("Renamed old.txt → new.txt");
    await expectHunkLines(diff, "@@ -10,3 +10,4 @@", [
      " old 9",
      " old 10",
      " old 11",
      "+renamed",
    ]);
    // Each line's old and new numbers sit beside it, outside its text, and
    // assistive technology reads the code alone.
    const hunk = diffHunk(diff, "@@ -10,3 +10,4 @@");
    expect(await shownLineNumbers(diffLines(hunk))).toEqual([
      ["10", "10"],
      ["11", "11"],
      ["12", "12"],
      ["", "13"],
    ]);
    await expect(hunk).toMatchAriaSnapshot(
      "- listitem: old 9\n- listitem: old 10\n- listitem: old 11\n- listitem: +renamed",
    );
  });

  await test.step("the deleted file's lines are all removed", async () => {
    await select("Deleted gone.txt");
    const diff = diffOf("Deleted gone.txt");
    await expectHunkLines(diff, "@@ -1,3 +0,0 @@", [
      "-gone 0",
      "-gone 1",
      "-gone 2",
    ]);
  });

  await test.step("the changed image has no textual diff", async () => {
    await select("Modified image.png");
    const diff = diffOf("Modified image.png");
    await expect(diff).toContainText(
      "This file has no textual diff: Git reads it as binary.",
    );
    await expect(diff.getByRole("listitem")).toHaveCount(0);
  });
  expect(observed(workspace)).toEqual(before);

  // Closing the review returns the keyboard to Review changes, and the next
  // Tab reaches the next card's first Start.
  await page.keyboard.press("Meta+Shift+Escape");
  await review.frame.expectClosed();
  await expectFocusedAndIndicated(page, action);
  await page.keyboard.press("Tab");
  await expectFocusedAndIndicated(
    page,
    parts(page)
      .backlog.getByRole("article", { name: "Story B" })
      .getByRole("button", { name: "Start execution" }),
  );
});
