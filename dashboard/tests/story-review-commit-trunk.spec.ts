// Ranges and individual merges leave trunk out and expose conflict resolutions.
import { expect, test } from "./support/preparationPage.ts";
import { chooseCommit } from "./support/storyReviewCommitChoice.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import { openReview, reviewRegion } from "./support/storyReviewMark.ts";
import { integrateTrunk, markedWorktree } from "./support/storyReviewTrunk.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { commitAll, writeAt } from "./support/storyReviewWorktree.ts";
import { sixth } from "./support/storyReviewTrunk.ts";

for (const conflicted of [false, true]) {
  test(`a range across ${conflicted ? "conflicted" : "clean"} trunk integration leaves trunk out, and the merge alone shows its own resolution`, async ({
    page,
    dashboard,
    origin,
  }) => {
    const story = markedWorktree(origin);
    integrateTrunk(origin, story, conflicted ? "c story and trunk" : undefined);
    await keepLaunchRecord(dashboard, story.workspace);
    const snapshot = await openReview(page, await openBacklog(page, origin));
    const review = reviewRegion(page);
    expect(snapshot.mark).toBeUndefined();
    await review.getByRole("radio", { name: "Commits", exact: true }).check();
    const rows = review
      .getByRole("list", { name: "Story commits", exact: true })
      .getByRole("button");
    await expect(rows).toHaveCount(2);
    await expect(review.locator(".story-review-since")).toContainText(
      "Trunk was integrated within the range",
    );
    if (conflicted) {
      const mergeFiles = review.getByRole("list", {
        name: "1 changed file",
        exact: true,
      });
      await expect
        .poll(() => treeRows(mergeFiles))
        .toEqual(["src", "  c.ts includes trunk's changes"]);
      const flagged = "Modified src/c.ts, includes trunk's changes";
      await mergeFiles.getByRole("button", { name: flagged }).click();
      await expect(review.locator(".story-review-removed")).toHaveText([
        "-c story",
      ]);
      await expect(review.locator(".story-review-added")).toHaveText([
        "+c story and trunk",
      ]);
      await expect(mergeFiles.locator(".story-review-line-counts")).toHaveText(
        "+1 −1",
        { useInnerText: true },
      );
    } else {
      await expect(review).toContainText("The chosen commits changed nothing.");
      await expect(
        review.getByRole("list", { name: /changed file/ }),
      ).toHaveCount(0);
    }

    await chooseCommit(review, rows.last());
    await expect(
      review.getByRole("heading", { name: "Changes in 2 commits" }),
    ).toBeVisible();
    const files = review.getByRole("list", {
      name: "1 changed file",
      exact: true,
    });
    await expect
      .poll(() => treeRows(files))
      .toEqual([
        "src",
        conflicted ? "  c.ts includes trunk's changes" : "  c.ts",
      ]);
    const name = `Modified src/c.ts${conflicted ? ", includes trunk's changes" : ""}`;
    await files.getByRole("button", { name, exact: true }).click();
    await expect(review.locator(".story-review-removed")).toHaveText(["-c 5"]);
    await expect(review.locator(".story-review-added")).toHaveText([
      conflicted ? "+c story and trunk" : "+c story",
    ]);
    await expect(files.locator(".story-review-line-counts")).toHaveText(
      "+1 −1",
      { useInnerText: true },
    );
    await expect(review).not.toContainText("landed.txt");
    await expect(files).not.toContainText("README.md");
    await expect(files).not.toContainText("a.ts");
  });
}

test("an integration resolved back to the oldest parent stays flagged and is diffed from the destination baseline", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = markedWorktree(origin);
  integrateTrunk(origin, story, "c 5");
  await keepLaunchRecord(dashboard, story.workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", { name: "Changes in 2 commits" }),
  ).toBeVisible();
  const files = review.getByRole("list", {
    name: "1 changed file",
    exact: true,
  });
  await expect
    .poll(() => treeRows(files))
    .toEqual(["src", "  c.ts includes trunk's changes"]);
  await files
    .getByRole("button", {
      name: "Modified src/c.ts, includes trunk's changes",
    })
    .click();
  await expect(review.locator(".story-review-removed")).toHaveText([
    "-c trunk",
  ]);
  await expect(review.locator(".story-review-added")).toHaveText(["+c 5"]);
  await expect(files.locator(".story-review-line-counts")).toHaveText("+1 −1", {
    useInnerText: true,
  });
});

test("a clean integration of disjoint changes in one file shows only the story edit without a flag", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = markedWorktree(origin);
  // Restore c.ts and edit a.ts far from the sixth line trunk will edit.
  // All selected commits therefore leave only this story edit in the range.
  writeAt(story.workspace, "src/c.ts", sixth("c"));
  writeAt(
    story.workspace,
    "src/a.ts",
    sixth("a").replace("a 0\n", "a story\n"),
  );
  commitAll(story.workspace, "story changes a on a separate line");
  integrateTrunk(origin, story, "c trunk");
  await keepLaunchRecord(dashboard, story.workspace);
  await openReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", { name: "Changes in 3 commits" }),
  ).toBeVisible();
  const files = review.getByRole("list", {
    name: "1 changed file",
    exact: true,
  });
  await expect.poll(() => treeRows(files)).toEqual(["src", "  a.ts"]);
  await files
    .getByRole("button", { name: "Modified src/a.ts", exact: true })
    .click();
  await expect(review.locator(".story-review-removed")).toHaveText(["-a 0"]);
  await expect(review.locator(".story-review-added")).toHaveText(["+a story"]);
  await expect(review).not.toContainText("includes trunk's changes");
});
