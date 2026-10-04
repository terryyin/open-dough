// A story's review from its card, of Story A's worktree and kept launch
// record (./support/storyReviewWorktree.ts). Review changes names the
// worktree, its branch, and the baseline, and lists the story's files with
// their kinds under their folders, without either trunk file or the ignored
// one; the worktree's own index and status stay as they were. Selecting a
// file shows its diff with added and removed lines marked in text, the
// rename against its old path, the deletion as all lines removed, and the
// image as having no textual diff; hiding the file browser leaves the diff
// in place with more room. The review shows in the page's side panel, and
// Command+Shift+Escape closes it, returning the keyboard to Review changes.
// Requests the launch boundary refuses: ./story-review-refusal.spec.ts.

import { expect, test } from "./support/preparationPage.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  branch,
  git,
  keepLaunchRecord,
  observed,
  storyWorktree,
  wideLine,
} from "./support/storyReviewWorktree.ts";

test("a story's review names its worktree, branch, and baseline and lists only the story's changed files", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged, later } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);
  const fetchedTrunk = () => git(workspace, "rev-parse", "origin/main");
  expect(fetchedTrunk()).toBe(merged);
  // The page itself never scrolls sideways.
  const pageFitsWidth = () =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );

  const card = await openBacklog(page, origin);
  const action = card.getByRole("button", { name: "Review changes" });
  await action.click();
  const review = page.getByRole("region", { name: "Review changes" });
  // The panel names the story it reviews, beside the dashboard, and holds
  // the keyboard in its named content.
  await expect(review.getByRole("heading", { level: 2 })).toHaveText("Story A");
  await expect(review).toContainText(`Review changes ${queuedIdentity}`);
  await expect(review.locator(".story-review-body")).toBeFocused();
  const files = review.getByRole("list", { name: "7 changed files" });
  await expect
    .poll(() => treeRows(files))
    .toEqual([
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
  const fileControls = files.getByRole("button");
  await expect(fileControls).toHaveCount(fileNames.length);
  for (const [index, name] of fileNames.entries()) {
    await expect(fileControls.nth(index)).toHaveAccessibleName(name);
  }
  const facts = review.getByRole("definition");
  await expect(facts).toHaveText([
    "~/git/open-dough/.worktrees/story-a",
    branch,
    `${merged}, where ${branch} meets origin/main`,
  ]);
  for (const absent of ["other.txt", "other2.txt", "ignored.log"])
    await expect(review).not.toContainText(absent);
  // The review fetched trunk and left the worktree's index and files alone.
  expect(fetchedTrunk()).toBe(later);
  expect(observed(workspace)).toEqual(before);
  // Paths scroll within the review, never the page.
  expect(await pageFitsWidth()).toBe(true);

  // A file's diff: its hunks' lines, each marked +, -, or a space.
  const diffOf = (name: string) => review.getByRole("region", { name });
  const linesOf = (diff: ReturnType<typeof diffOf>, hunk: string) =>
    diff.getByRole("list", { name: hunk }).getByRole("listitem");
  // Each line exactly, its leading marker and spacing included.
  const expectLines = async (
    diff: ReturnType<typeof diffOf>,
    hunk: string,
    expected: readonly string[],
  ) => {
    const shown = linesOf(diff, hunk);
    await expect(shown).toHaveCount(expected.length);
    expect(await shown.allTextContents()).toEqual(expected);
  };
  const select = (name: string) =>
    files.getByRole("button", { name }).press("Enter");

  await test.step("a modified file's diff marks its added and removed lines", async () => {
    await select("Modified unstaged.txt");
    await expect(
      files.getByRole("button", { name: "Modified unstaged.txt" }),
    ).toHaveAttribute("aria-pressed", "true");
    const diff = diffOf("Modified unstaged.txt");
    await expectLines(diff, "@@ -3,10 +3,11 @@", [
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
    const code = diff.locator(".story-review-code");
    expect(
      await code.evaluate((region) => region.scrollWidth > region.clientWidth),
    ).toBe(true);
    expect(await pageFitsWidth()).toBe(true);
  });

  await test.step("hiding the file browser leaves the diff in place with more room", async () => {
    const diff = diffOf("Modified unstaged.txt");
    const narrow = (await diff.boundingBox())?.width ?? 0;
    const hide = review.getByRole("button", { name: "Hide files" });
    await expect(hide).toHaveAttribute("aria-expanded", "true");
    await hide.press("Enter");
    const show = review.getByRole("button", { name: "Show files" });
    await expect(show).toBeFocused();
    await expect(show).toHaveAttribute("aria-expanded", "false");
    await expect(files).toBeHidden();
    await expect(linesOf(diff, "@@ -3,10 +3,11 @@")).toHaveCount(12);
    expect((await diff.boundingBox())?.width ?? 0).toBeGreaterThan(
      narrow + 200,
    );
    await show.press("Enter");
    await expect(
      review.getByRole("button", { name: "Hide files" }),
    ).toBeFocused();
    await expect(files).toBeVisible();
    await expect(linesOf(diff, "@@ -3,10 +3,11 @@")).toHaveCount(12);
  });

  await test.step("the rename's diff is against its old path", async () => {
    await select("Renamed old.txt → new.txt");
    const diff = diffOf("Renamed old.txt → new.txt");
    await expectLines(diff, "@@ -10,3 +10,4 @@", [
      " old 9",
      " old 10",
      " old 11",
      "+renamed",
    ]);
  });

  await test.step("the deleted file's lines are all removed", async () => {
    await select("Deleted gone.txt");
    const diff = diffOf("Deleted gone.txt");
    await expectLines(diff, "@@ -1,3 +0,0 @@", [
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

  await page.keyboard.press("Meta+Shift+Escape");
  await expect(review).toBeHidden();
  await expect(action).toBeFocused();
});
