// A story's review folders collapse and expand by pointer and keyboard, of
// Story A's worktree changing nested files (../../dashboard/test-support/support/storyReviewWorktree.ts):
// collapsed, a folder hides its rows and tells how many changed files it
// holds, while the heading's total and the selected file's diff stay. Refresh
// keeps folders collapsed; reopening Intent keeps its own reading place.

import { diffHeading } from "../../dashboard/test-support/support/reviewPanes.ts";

import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { nestedTreeRows } from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  nestedRepository,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepPublishedStoryReview } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

test.use({ originRepository: nestedRepository });

test("a story's review folders collapse and expand", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepPublishedStoryReview(dashboard, origin, workspace);
  const card = await openBacklog(page, origin);
  const review = await openIntentReviewChanges(page, card);
  const { files, diffs } = review;
  await files.showOnlyChanged();
  await files.expectChangedFileCount(6);

  await test.step("a collapsed folder hides its rows and tells its count, and expanding restores them as they were", async () => {
    // A nested folder collapsed first stays collapsed inside its parent.
    // A collapsed folder is named by its name and count.
    await files.folder("server").click();
    await expect(files.folder("server")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await files.folder("dashboard").click();
    await expect(files.folder("dashboard")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await files.expectTreeRows([
      "dashboard 3 files",
      "docs",
      "  adrs",
      "    drafts",
      "      0009-tree.md",
      "new",
      "  a.ts",
      "README.md",
    ]);
    // The row shows the number; the words after it are read aloud only.
    const count = files
      .folderName("dashboard 3 files")
      .locator(".story-review-folder-count");
    await expect(count).toHaveText("3 files");
    await expect(count.locator(".visually-hidden")).toHaveText(" files");
    await expect(files.row("Added dashboard/src/a.tsx")).toBeHidden();
    await files.expectChangedFileCount(6);
    await expect(files.tree).toHaveAccessibleName("Repository files");

    await files.folder("dashboard").press("Enter");
    await expect(files.folder("dashboard")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await files.expectTreeRows([
      "dashboard",
      "  server 1 file",
      "  src",
      "    a.tsx",
      "    b.ts",
      "docs",
      "  adrs",
      "    drafts",
      "      0009-tree.md",
      "new",
      "  a.ts",
      "README.md",
    ]);
    await files.folder("server").press("Enter");
    await expect(files.folder("server")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await files.expectTreeRows(nestedTreeRows);
  });

  await test.step("collapsing the folder holding the selected file keeps its diff", async () => {
    await files.row("Modified dashboard/src/b.ts").click();
    const diff = diffs.toRead("Modified dashboard/src/b.ts");
    await expect(diff.getByText("+more", { exact: true })).toBeVisible();
    await files.folder("src").click();
    await expect(files.folder("src")).toHaveAttribute("aria-expanded", "false");
    await expect(files.row("Modified dashboard/src/b.ts")).toBeHidden();
    await expect(diffHeading(diff, { level: 3 })).toHaveText(
      "Modified dashboard/src/b.ts",
    );
    await expect(diff.getByText("+more", { exact: true })).toBeVisible();
    await files.folder("src").click();
    await expect(files.row("Modified dashboard/src/b.ts")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  await test.step("Refresh keeps the collapsed folder in the published pair", async () => {
    await files.folder("server").click();
    await review.refresh();
    await review.expectFeedback(/^Review refreshed:/);
    await files.expectTreeRows([
      "dashboard",
      "  server 1 file",
      "  src",
      "    a.tsx",
      "    b.ts",
      "docs",
      "  adrs",
      "    drafts",
      "      0009-tree.md",
      "new",
      "  a.ts",
      "README.md",
    ]);
    await expect(files.folder("server")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  await test.step("returning to Intent restores the kept expansion and diff", async () => {
    await review.returnToDevelopment();
    const reopened = await openIntentReviewChanges(page, card);
    await expect(reopened.files.folder("server")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await reopened.files.expectSelected("Modified dashboard/src/b.ts");
    await reopened.diffs.expectShows("Modified dashboard/src/b.ts", "+more");
  });
});
