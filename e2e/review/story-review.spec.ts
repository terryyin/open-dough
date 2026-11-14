// Story A's card opens its worktree review (../../dashboard/tests/support/storyReviewWorktree.ts).
// Context names branch/baseline/worktree (../../dashboard/tests/review/story-review-context-line.spec.ts).
// Only story files appear, grouped by kind/folder, first file selected; trunk
// and ignored files are absent, and the worktree index/status stay unchanged.
// Diffs mark added/removed lines beside old/new numbers, renames against old
// paths, deletions as removed lines, and images as having no textual diff.
// Hiding files widens the unchanged diff. Command+Shift+Escape closes the Side
// panel, returning to Review changes; Tab moves on. Refused requests are in
// ../../dashboard/backend-tests/review/story-review-refusal.spec.ts. Directional omitted-context expansion is in
// ../../dashboard/tests/review/story-review-diff-context.spec.ts.

import {
  codePane,
  diffHunk,
  diffLines,
  expectHunkLines,
  hunkLines,
  pageFits,
} from "../../dashboard/tests/support/reviewPanes.ts";
import { reviewRegion } from "../../dashboard/tests/support/storyReviewMark.ts";
import { reviewChanges } from "../../dashboard/tests/storyCardControls.ts";
import { expectFocusedAndIndicated } from "../../dashboard/tests/accessibleReading.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  reviewBody,
} from "../../dashboard/tests/support/reviewContextLine.ts";
import { shownLineNumbers } from "../../dashboard/tests/support/reviewLineNumbers.ts";
import {
  expectTreeRows,
  changedFilesList,
  fileDiff,
  listedFile,
} from "../../dashboard/tests/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/tests/support/sessionDialog.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import {
  branch,
  git,
  observed,
  storyWorktree,
  wideLine,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../dashboard/tests/support/storyLaunchRecord.ts";

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
  await action.click();
  const review = reviewRegion(page);
  // The panel names the story it reviews, beside the dashboard, and holds
  // the keyboard in its named content.
  await expect(review.getByRole("heading", { level: 2 })).toHaveText("Story A");
  await expect(review).toContainText(`Story review ${queuedIdentity}`);
  await expect(reviewBody(review)).toBeFocused();
  const files = changedFilesList(review, "7 changed files");
  await expectTreeRows(files, [
    "fresh",
    "  new.txt",
    "gone.txt",
    "image.png",
    "new.txt",
    "staged.txt",
    "story.txt",
    "unstaged.txt",
  ]);
  // Each file's control says its kind and full path in words.
  const fileNames = [
    "Added fresh/new.txt",
    "Deleted gone.txt",
    "Modified image.png",
    "Renamed old.txt → new.txt",
    "Modified staged.txt",
    "Added story.txt",
    "Modified unstaged.txt",
  ];
  // A file's control is pressable; a folder's disclosure is not.
  const fileControls = files.locator("button[aria-pressed]");
  await expect(fileControls).toHaveCount(fileNames.length);
  for (const [index, name] of fileNames.entries()) {
    await expect(fileControls.nth(index)).toHaveAccessibleName(name);
  }
  // The review opens on the first file in the browser's order, inside the
  // folder that comes first, its diff shown.
  await expect(fileControls.first()).toHaveAttribute("aria-pressed", "true");
  await expect(files.locator('button[aria-pressed="true"]')).toHaveCount(1);
  await expect(diffLines(fileDiff(review, "Added fresh/new.txt"))).toHaveText([
    "+untracked",
  ]);
  // The context line reads every value in full, the read-only explanation
  // is the review's description, never a visible line.
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({
      branch,
      baseline: merged,
      workspace: "~/git/open-dough/.worktrees/story-a",
    }),
  );
  await expect(review).toHaveAccessibleDescription(
    "Read-only: what this story's worktree would add to trunk, as it was when the review opened or was last refreshed.",
  );
  await expect(review.getByText(/^Read-only/)).toBeHidden();
  for (const absent of ["other.txt", "other2.txt", "ignored.log"])
    await expect(review).not.toContainText(absent);
  // The review fetched trunk and left the worktree's index and files alone.
  expect(fetchedTrunk()).toBe(later);
  expect(observed(workspace)).toEqual(before);
  // Paths scroll within the review, never the page.
  expect(await pageFits(page)).toBe(true);

  // A file's diff: its hunks' lines, each marked +, -, or a space.
  const diffOf = (name: string) => fileDiff(review, name);
  const select = (name: string) => listedFile(files, name).press("Enter");

  await test.step("a modified file's diff marks its added and removed lines", async () => {
    await select("Modified unstaged.txt");
    await expect(listedFile(files, "Modified unstaged.txt")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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
    // Hide files is the context line's own control.
    const hide = contextLine(review).getByRole("button", {
      name: "Hide files",
    });
    await expect(hide).toHaveAttribute("aria-expanded", "true");
    await hide.press("Enter");
    const show = review.getByRole("button", { name: "Show files" });
    await expect(show).toBeFocused();
    await expect(show).toHaveAttribute("aria-expanded", "false");
    await expect(files).toBeHidden();
    await expect(hunkLines(diff, "@@ -3,10 +3,11 @@")).toHaveCount(12);
    expect((await diff.boundingBox())?.width ?? 0).toBeGreaterThan(
      narrow + 200,
    );
    await show.press("Enter");
    await expect(
      review.getByRole("button", { name: "Hide files" }),
    ).toBeFocused();
    await expect(files).toBeVisible();
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
  await expect(review).toBeHidden();
  await expectFocusedAndIndicated(page, action);
  await page.keyboard.press("Tab");
  await expectFocusedAndIndicated(
    page,
    parts(page)
      .backlog.getByRole("article", { name: "Story B" })
      .getByRole("button", { name: "Start execution" }),
  );
});
