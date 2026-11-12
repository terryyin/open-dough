import { reviewRefresh } from "../support/reviewControls.ts";
// A story's review folders collapse and expand by pointer and keyboard, of
// Story A's worktree changing nested files (../support/storyReviewWorktree.ts):
// collapsed, a folder hides its rows and tells how many changed files it
// holds, while the heading's total and the selected file's diff stay. Refresh
// keeps folders collapsed and shows new ones expanded; reopening the review
// shows every folder expanded.

import { diffHeading } from "../support/reviewPanes.ts";
import { reviewRegion } from "../support/storyReviewMark.ts";
import { reviewChanges } from "../storyCardControls.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { storyReviewWaitMs } from "../../src/storyReviewContract.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expectTreeRows,
  nestedTreeRows,
  treeFolder,
  changedFilesList,
  listedFile,
  fileDiff,
} from "../support/reviewTreeRows.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import { nestedWorktree } from "../support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";

test("a story's review folders collapse and expand", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = nestedWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await reviewChanges(card).click();
  const review = reviewRegion(page);
  const files = changedFilesList(review, "6 changed files");
  await expect(files).toBeVisible({ timeout: storyReviewWaitMs });

  await test.step("a collapsed folder hides its rows and tells its count, and expanding restores them as they were", async () => {
    // A nested folder collapsed first stays collapsed inside its parent.
    // A collapsed folder is named by its name and count.
    await treeFolder(review, "server").click();
    await expect(treeFolder(review, "server 1 changed file")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await treeFolder(review, "dashboard").click();
    await expect(
      treeFolder(review, "dashboard 3 changed files"),
    ).toHaveAttribute("aria-expanded", "false");
    await expectTreeRows(files, [
      "dashboard 3 changed files",
      "docs/adrs/drafts",
      "  0009-tree.md",
      "new",
      "  a.ts",
      "README.md",
    ]);
    // The row shows the number; the words after it are read aloud only.
    const count = treeFolder(review, "dashboard 3 changed files").locator(
      ".story-review-folder-count",
    );
    await expect(count).toHaveText("3 changed files");
    await expect(count.locator(".visually-hidden")).toHaveText(
      " changed files",
    );
    await expect(listedFile(files, "Added dashboard/src/a.tsx")).toBeHidden();
    await expect(review.getByRole("heading", { level: 3 }).first()).toHaveText(
      "6 changed files",
    );
    await expect(files).toHaveAccessibleName("6 changed files");

    await treeFolder(review, "dashboard 3 changed files").press("Enter");
    await expect(treeFolder(review, "dashboard")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expectTreeRows(files, [
      "dashboard",
      "  server 1 changed file",
      "  src",
      "    a.tsx",
      "    b.ts",
      "docs/adrs/drafts",
      "  0009-tree.md",
      "new",
      "  a.ts",
      "README.md",
    ]);
    await treeFolder(review, "server 1 changed file").press("Enter");
    await expect(treeFolder(review, "server")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expectTreeRows(files, nestedTreeRows);
  });

  await test.step("collapsing the folder holding the selected file keeps its diff", async () => {
    await listedFile(files, "Modified dashboard/src/b.ts").click();
    const diff = fileDiff(review, "Modified dashboard/src/b.ts");
    await expect(diff.getByText("+more", { exact: true })).toBeVisible();
    await treeFolder(review, "src").click();
    await expect(treeFolder(review, "src 2 changed files")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(listedFile(files, "Modified dashboard/src/b.ts")).toBeHidden();
    await expect(diffHeading(diff, { level: 3 })).toHaveText(
      "Modified dashboard/src/b.ts",
    );
    await expect(diff.getByText("+more", { exact: true })).toBeVisible();
    await treeFolder(review, "src 2 changed files").click();
    await expect(
      listedFile(files, "Modified dashboard/src/b.ts"),
    ).toHaveAttribute("aria-pressed", "true");
  });

  await test.step("Refresh keeps a collapsed folder collapsed and shows a new folder expanded", async () => {
    await treeFolder(review, "server").click();
    mkdirSync(path.join(workspace, "scripts"));
    writeFileSync(path.join(workspace, "scripts", "x.mjs"), "x\n");
    await reviewRefresh(review).click();
    const refreshed = changedFilesList(review, "7 changed files");
    await expectTreeRows(refreshed, [
      "dashboard",
      "  server 1 changed file",
      "  src",
      "    a.tsx",
      "    b.ts",
      "docs/adrs/drafts",
      "  0009-tree.md",
      "new",
      "  a.ts",
      "scripts",
      "  x.mjs",
      "README.md",
    ]);
    await expect(treeFolder(review, "server 1 changed file")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(treeFolder(review, "scripts")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  await test.step("a reopened review shows every folder expanded", async () => {
    await review.getByRole("button", { name: "Close", exact: true }).click();
    await expect(review).toHaveCount(0);
    await reviewChanges(card).click();
    const reopened = changedFilesList(review, "7 changed files");
    await expectTreeRows(reopened, [
      ...nestedTreeRows.slice(0, -1),
      "scripts",
      "  x.mjs",
      "README.md",
    ]);
    for (const name of [
      "dashboard",
      "server",
      "src",
      "docs/adrs/drafts",
      "new",
      "scripts",
    ]) {
      await expect(treeFolder(review, name)).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    }
  });
});
