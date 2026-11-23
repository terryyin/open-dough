// The workspace comparison in Intent reads Git without changing the index
// or working files. Its file diffs keep type, paths, and line numbers.
import {
  codePane,
  diffHunk,
  diffLines,
  expectHunkLines,
  pageFits,
} from "../../dashboard/test-support/support/reviewPanes.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
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
  const review = await openIntentReviewChanges(page, card);
  const { files, diffs } = review;
  await review.expectStory("Story A");
  await review.expectText(queuedIdentity);
  await files.expectOutsideRows([
    "fresh",
    "  new.txt",
    "gone.txt",
    "image.png",
    "new.txt",
    "staged.txt",
    "story.txt",
    "unstaged.txt",
  ]);
  await files.expectOutsideFiles(7, [
    "Added fresh/new.txt",
    "Deleted gone.txt",
    "Modified image.png",
    "Renamed old.txt → new.txt",
    "Modified staged.txt",
    "Added story.txt",
    "Modified unstaged.txt",
  ]);
  await files.choose("Added fresh/new.txt", "keyboard");
  await files.expectSelected("Added fresh/new.txt");
  await expect(diffLines(diffs.toRead("Added fresh/new.txt"))).toHaveText([
    "+untracked",
  ]);
  await review.context.expectWords(
    contextWords({
      branch,
      baseline: merged,
      workspace: "~/git/open-dough/.worktrees/story-a",
    }),
  );
  await files.expectOutsideLacks("other.txt", "other2.txt", "ignored.log");
  // The review fetched trunk and left the worktree's index and files alone.
  expect(fetchedTrunk()).toBe(later);
  expect(observed(workspace)).toEqual(before);
  // Paths scroll within the review, never the page.
  expect(await pageFits(page)).toBe(true);

  // A file's diff: its hunks' lines, each marked +, -, or a space.
  const diffOf = (name: string) => diffs.toRead(name);
  const select = (name: string) => files.choose(name, "keyboard");

  await test.step("a modified file's diff marks its added and removed lines", async () => {
    await select("Modified unstaged.txt");
    await files.expectSelected("Modified unstaged.txt");
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
    await review.hideFiles("keyboard");
    await review.expectFilesHidden();
    await diffs.expectLine("Modified unstaged.txt", "+unstaged five");
    expect((await diff.boundingBox())?.width ?? 0).toBeGreaterThan(narrow);
    await review.setFilesShown(true, "keyboard");
    await files.expectSelected("Modified unstaged.txt");
    await diffs.expectLine("Modified unstaged.txt", "+unstaged five");
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
});
