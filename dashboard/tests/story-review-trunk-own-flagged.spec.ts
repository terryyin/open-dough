// A Trunk Mode story's file that trunk rewrote where the story changed it
// (./support/storyReviewTrunkMode.ts), which Git cannot separate, is listed
// in All changes flagged as including trunk's changes, counted and diffed
// from trunk as it was before the story's first change to that file; the
// committed work alone lists it the same way. When an older published story
// commit also changed the file, it is flagged from that commit's parent, so
// the older story change shows in its diff beside the line both changed.
// Before trunk rewrites the line, the context line counts the story's one
// published commit. ./story-review-trunk-own-changes.spec.ts covers the
// files Git separates.

import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
} from "./support/reviewContextLine.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  nextSnapshot,
  openStoryReview,
  reviewRegion,
  uncommittedCheck,
} from "./support/storyReviewMark.ts";
import {
  openTaken,
  publishRewrittenLine,
  shownWorkspace,
  trunkModeStory,
} from "./support/storyReviewTrunkMode.ts";
import { branch, git } from "./support/storyReviewWorktree.ts";

const flagged = "Modified src/c.ts, includes trunk's changes";

// Each listed file with the tree it is flagged from.
const flags = (
  files:
    | readonly {
        readonly path: string;
        readonly includesTrunkFrom?: string | undefined;
      }[]
    | undefined,
) =>
  files?.map(({ path: file, includesTrunkFrom }) => ({
    file,
    includesTrunkFrom,
  }));

// All changes with the flagged file, from trunk before the story changed it.
const allFlaggedFrom = (beforeStory: string) => [
  { file: "d.md", includesTrunkFrom: undefined },
  { file: "notes.md", includesTrunkFrom: undefined },
  { file: "src/a.ts", includesTrunkFrom: undefined },
  { file: "src/c.ts", includesTrunkFrom: beforeStory },
];
const allRows = [
  "src",
  "  a.ts",
  "  c.ts includes trunk's changes",
  "d.md",
  "notes.md",
];

test("a file trunk rewrote where the story changed it is flagged as including trunk's changes", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, trunk: first } = trunkModeStory(origin, { published: 1 });
  await keepLaunchRecord(dashboard, workspace);
  const card = await openTaken(page, origin);
  const snapshot = await openStoryReview(page, card);
  const review = reviewRegion(page);
  const values = contextValues(review);
  const baseline = contextLine(review).locator(
    ".story-review-context-baseline",
  );

  await test.step("the context line counts one published commit", async () => {
    expect(snapshot.published).toEqual({ trunk: first, commits: 1 });
    expect(snapshot.files.map(({ path: file }) => file)).toEqual([
      "notes.md",
      "src/a.ts",
    ]);
    const words = contextWords({
      branch,
      baseline: first,
      published: 1,
      workspace: shownWorkspace,
    });
    await expect(values).toHaveAccessibleName(words);
    await expect(baseline).toContainText("origin/main less 1 story commit");
    await expect(baseline).not.toContainText("commits");
    await values.press("Enter");
    await expect(baseline).toHaveText(
      `Baseline ${first} where ${branch} meets origin/main, less the story's 1 published commit`,
    );
    await expect(values).toHaveAccessibleName(words);
    await values.press("Enter");
  });

  const { trunk, beforeStory } = publishRewrittenLine(origin, workspace);
  const refreshed = nextSnapshot(page);
  await review.getByRole("button", { name: "Refresh" }).click();
  const later = await refreshed;
  const expectFlaggedDiff = async () => {
    const diff = review.getByRole("region", { name: flagged });
    await expect(diff.locator(".story-review-removed")).toHaveText(["-c 3"]);
    await expect(diff.locator(".story-review-added")).toHaveText(["+c trunk"]);
    // Neither the story's own line nor Git's conflict markers.
    await expect(diff).not.toContainText("c story");
    await expect(diff).not.toContainText("<<<<<<<");
  };

  await test.step("the file is flagged, counted and diffed from trunk before the story changed it", async () => {
    expect(later.published).toEqual({ trunk, commits: 2 });
    expect(flags(later.files)).toEqual(allFlaggedFrom(beforeStory));
    const files = review.getByRole("list", { name: "4 changed files" });
    await expect.poll(() => treeRows(files)).toEqual(allRows);
    await expect(
      files
        .getByRole("button", { name: flagged })
        .locator(".story-review-line-counts"),
    ).toHaveText("+1 −1", { useInnerText: true });
    await files.getByRole("button", { name: flagged }).press("Enter");
    await expectFlaggedDiff();
  });

  await test.step("the other files stay as before", async () => {
    const files = review.getByRole("list", { name: "4 changed files" });
    await files
      .getByRole("button", { name: "Modified src/a.ts" })
      .press("Enter");
    const diff = review.getByRole("region", { name: "Modified src/a.ts" });
    await expect(diff.locator(".story-review-removed")).toHaveText(["-a 0"]);
    await expect(diff.locator(".story-review-added")).toHaveText(["+a one"]);
  });

  await test.step("the committed work alone keeps the file flagged from the same tree", async () => {
    expect(flags(later.committed?.files)).toEqual([
      { file: "d.md", includesTrunkFrom: undefined },
      { file: "src/a.ts", includesTrunkFrom: undefined },
      { file: "src/c.ts", includesTrunkFrom: beforeStory },
    ]);
    await uncommittedCheck(review).uncheck();
    const files = review.getByRole("list", { name: "3 changed files" });
    await expect
      .poll(() => treeRows(files))
      .toEqual(["src", "  a.ts", "  c.ts includes trunk's changes", "d.md"]);
    await files.getByRole("button", { name: flagged }).press("Enter");
    await expectFlaggedDiff();
  });
});

test("a flagged file two story commits changed is diffed from trunk before the older one", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = trunkModeStory(origin, { published: 1 });
  const { trunk, beforeStory } = publishRewrittenLine(origin, workspace, {
    earlier: true,
  });
  // Not the parent of `s2`, the commit whose line trunk rewrote.
  expect(git(workspace, "log", "-1", "--format=%s", "HEAD~1")).toBe("s2");
  expect(beforeStory).not.toBe(git(workspace, "rev-parse", "HEAD~2^{tree}"));
  await keepLaunchRecord(dashboard, workspace);
  const card = await openTaken(page, origin);
  const snapshot = await openStoryReview(page, card);
  const review = reviewRegion(page);

  expect(snapshot.published).toEqual({ trunk, commits: 3 });
  expect(flags(snapshot.files)).toEqual(allFlaggedFrom(beforeStory));
  const files = review.getByRole("list", { name: "4 changed files" });
  await expect.poll(() => treeRows(files)).toEqual(allRows);
  await expect(
    files
      .getByRole("button", { name: flagged })
      .locator(".story-review-line-counts"),
  ).toHaveText("+2 −2", { useInnerText: true });
  await files.getByRole("button", { name: flagged }).press("Enter");
  const diff = review.getByRole("region", { name: flagged });
  // The older story change beside the line trunk rewrote.
  await expect(diff.locator(".story-review-removed")).toHaveText([
    "-c 3",
    "-c 9",
  ]);
  await expect(diff.locator(".story-review-added")).toHaveText([
    "+c trunk",
    "+c nine",
  ]);
  await expect(diff).not.toContainText("c story");
  await expect(diff).not.toContainText("<<<<<<<");
});
