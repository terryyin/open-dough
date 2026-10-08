// Integration conflicts follow the same file through renames on both sides
// of that integration, preserving the selected range's original old path.
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import { markedWorktree, sixth } from "./support/storyReviewTrunk.ts";
import { commitAll, git, writeAt } from "./support/storyReviewWorktree.ts";
import { treeRows } from "./support/reviewTreeRows.ts";

test("a file renamed before and after conflicted integration stays flagged with its original old path and diff", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = markedWorktree(origin);
  git(story.workspace, "mv", "src/c.ts", "src/d.ts");
  commitAll(story.workspace, "rename c to d");
  git(origin.project, "merge", "--quiet", "--ff-only", story.landed);
  writeAt(origin.project, "README.md", sixth("readme", "readme trunk"));
  writeAt(origin.project, "src/c.ts", sixth("c", "c trunk"));
  commitAll(origin.project, "trunk changes c");
  git(origin.project, "push", "--quiet", "origin", "main");
  git(story.workspace, "fetch", "--quiet", "origin", "main");
  expect(() =>
    git(story.workspace, "merge", "--quiet", "--no-edit", "origin/main"),
  ).toThrow();
  writeAt(story.workspace, "src/d.ts", sixth("c", "c story and trunk"));
  commitAll(story.workspace, "merge trunk with renamed conflict");
  git(story.workspace, "mv", "src/d.ts", "src/e.ts");
  commitAll(story.workspace, "rename d to e");

  await keepLaunchRecord(dashboard, story.workspace);
  const snapshot = await openReview(page, await openBacklog(page, origin));
  expect(snapshot.commits.map(({ subject }) => subject)).toEqual([
    "rename d to e",
    "merge trunk with renamed conflict",
    "rename c to d",
    "story changes c",
  ]);
  const review = reviewRegion(page);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await rows.last().click();
  await expect(
    review.getByRole("heading", { name: "Changes in 4 commits" }),
  ).toBeVisible();
  const files = review.getByRole("list", {
    name: "1 changed file",
    exact: true,
  });
  await expect
    .poll(() => treeRows(files))
    .toEqual(["src", "  e.ts includes trunk's changes"]);
  const name = "Renamed src/c.ts → src/e.ts, includes trunk's changes";
  await files.getByRole("button", { name, exact: true }).click();
  await expect(files.locator(".story-review-line-counts")).toHaveText("+1 −1", {
    useInnerText: true,
  });
  await expect(review.getByRole("region", { name, exact: true })).toBeVisible();
  await expect(review.locator(".story-review-removed")).toHaveText(["-c 5"]);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+c story and trunk",
  ]);
  await expect(files).not.toContainText("d.ts");
  await expect(files).not.toContainText("README.md");
});
