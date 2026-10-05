// A story review's file browser shows how many lines each file's diff adds
// and removes, of Story A's worktree (./support/storyReviewWorktree.ts) with
// the merged trunk file's mode changed alone. Each counted file's row shows
// its counts beside its name, and its control, still named by its kind and
// path, is described by them in words. A file with no textual diff, the
// image or the mode-only change, shows none, and a collapsed folder still
// tells how many changed files it holds.

import type { Locator } from "@playwright/test";
import { expect, test } from "./support/preparationPage.ts";
import { treeFolder } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  changeModeOnly,
  storyWorktree,
} from "./support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";

// A file row's counts, read as shown with innerText.
const countsOf = (control: Locator) =>
  control.locator(".story-review-line-counts");

test("each file's row shows the lines its diff adds and removes, in words to assistive technology", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  changeModeOnly(workspace);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  const files = review.getByRole("list", { name: "8 changed files" });
  const file = (name: string) =>
    files.getByRole("button", { name, exact: true });

  for (const [name, shown, words] of [
    ["Modified unstaged.txt", "+2 −1", "2 lines added, 1 line removed"],
    ["Deleted gone.txt", "+0 −3", "0 lines added, 3 lines removed"],
    ["Renamed old.txt → new.txt", "+1 −0", "1 line added, 0 lines removed"],
    ["Added fresh/new.txt", "+1 −0", "1 line added, 0 lines removed"],
  ] as const) {
    await expect(countsOf(file(name))).toHaveText(shown, {
      useInnerText: true,
    });
    await expect(countsOf(file(name))).toBeVisible();
    await expect(file(name)).toHaveAccessibleDescription(words);
  }
  // Neither the image nor the mode-only change has lines to count.
  for (const name of ["Modified image.png", "Modified other.txt"]) {
    await expect(file(name)).toBeVisible();
    await expect(countsOf(file(name))).toHaveCount(0);
    await expect(file(name)).not.toHaveAccessibleDescription(/line/);
  }

  // A collapsed folder still tells its changed files, not their lines.
  await treeFolder(review, "fresh").press("Enter");
  await expect(treeFolder(review, "fresh 1 changed file")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
