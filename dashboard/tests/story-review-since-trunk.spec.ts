// A marked story that merged trunk since the review: its changes since the
// review leave out what came only from trunk. After the mark, trunk takes the
// story's landed slice and changes `README.md`, `src/a.ts`, and the same line
// of `src/c.ts` the story changed; the story merges trunk, settling
// `src/c.ts`, and changes `src/b.ts`. The review lists `src/b.ts` and
// `src/c.ts` only and says trunk was integrated since the mark; `src/c.ts`,
// which Git cannot separate from trunk's change, is flagged as including
// trunk's changes and diffed from the marked snapshot.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/preparationPage.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import {
  expectSinceTheReview,
  keptStoryAMark,
  markReviewed,
  openReview,
  reopenReview,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import {
  addStoryWorktree,
  commitAll,
  git,
  keepLaunchRecord,
  lines,
} from "./support/storyReviewWorktree.ts";

// A file's lines, by its word, with its sixth line as given.
const sixth = (word: string, line = `${word} 5`) =>
  lines(word).replace(`${word} 5\n`, `${line}\n`);

const write = (root: string, file: string, text: string) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
};

// Story A's worktree as it is marked: off trunk's `README.md` and
// `src/{a,b,c}.ts`, a committed slice adding `landed.txt`, then its change to
// `src/c.ts`'s sixth line.
function markedWorktree(origin: StartOrigin) {
  const project = origin.project;
  write(project, "README.md", sixth("readme"));
  for (const word of ["a", "b", "c"])
    write(project, `src/${word}.ts`, sixth(word));
  commitAll(project, "trunk files");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = addStoryWorktree(project);
  write(workspace, "landed.txt", "landed slice\n");
  commitAll(workspace, "landed slice");
  const landed = git(workspace, "rev-parse", "HEAD");
  write(workspace, "src/c.ts", sixth("c", "c story"));
  commitAll(workspace, "story changes c");
  return { workspace, landed };
}

// After the mark: trunk takes the landed slice and changes `README.md`,
// `src/a.ts`, and `src/c.ts`'s sixth line; the story merges trunk, settling
// `src/c.ts` with both changes, then changes `src/b.ts`.
function integrateTrunk(
  origin: StartOrigin,
  { workspace, landed }: { workspace: string; landed: string },
) {
  const project = origin.project;
  git(project, "merge", "--quiet", "--ff-only", landed);
  write(project, "README.md", sixth("readme", "readme trunk"));
  write(project, "src/a.ts", sixth("a", "a trunk"));
  write(project, "src/c.ts", sixth("c", "c trunk"));
  commitAll(project, "trunk changes");
  git(project, "push", "--quiet", "origin", "main");

  git(workspace, "fetch", "--quiet", "origin", "main");
  try {
    git(workspace, "merge", "--quiet", "--no-edit", "origin/main");
  } catch {
    // `src/c.ts` conflicts; the story settles it with both changes.
  }
  write(workspace, "src/c.ts", sixth("c", "c story and trunk"));
  commitAll(workspace, "merge trunk");
  write(workspace, "src/b.ts", sixth("b", "b five"));
}

test("after trunk was integrated, the changes since the review leave trunk's out and flag what cannot be separated", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = markedWorktree(origin);
  await keepLaunchRecord(dashboard, story.workspace);
  const card = await openBacklog(page, origin);
  const marked = await openReview(page, card);
  const review = reviewRegion(page);
  await expect(
    review.getByRole("list", { name: "2 changed files" }),
  ).toBeVisible();
  await markReviewed(review);

  integrateTrunk(origin, story);
  const since = await reopenReview(page, card);
  expect(since.baseline).not.toBe(marked.baseline);
  expect(since.since?.from).not.toBe(marked.tree);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review.locator(".story-review-since")).toContainText(
    "Trunk was integrated since the mark",
  );

  // (a, d) Only the story's files: not trunk's, nor the landed slice.
  const files = review.getByRole("list", { name: "2 changed files" });
  await expect
    .poll(() => treeRows(files))
    .toEqual(["src", "  b.ts", "  c.ts includes trunk's changes"]);
  expect(
    since.since?.files.map(({ path: file, includesTrunkFrom }) => ({
      file,
      includesTrunkFrom,
    })),
  ).toEqual([
    { file: "src/b.ts", includesTrunkFrom: undefined },
    { file: "src/c.ts", includesTrunkFrom: marked.tree },
  ]);

  // (b) The inseparable file is flagged and diffed from the marked snapshot.
  const flagged = "Modified src/c.ts, includes trunk's changes";
  await files.getByRole("button", { name: flagged }).press("Enter");
  const cDiff = review.getByRole("region", { name: flagged });
  await expect(cDiff.locator(".story-review-removed")).toHaveText(["-c story"]);
  await expect(cDiff.locator(".story-review-added")).toHaveText([
    "+c story and trunk",
  ]);

  // (c) The separated file's diff holds only the story's edit.
  await files.getByRole("button", { name: "Modified src/b.ts" }).press("Enter");
  const bDiff = review.getByRole("region", { name: "Modified src/b.ts" });
  await expect(bDiff.locator(".story-review-removed")).toHaveText(["-b 5"]);
  await expect(bDiff.locator(".story-review-added")).toHaveText(["+b five"]);
});

test("a marked story whose baseline is unchanged does not say trunk was integrated", async ({
  page,
  dashboard,
  origin,
}) => {
  const story = markedWorktree(origin);
  await keepLaunchRecord(dashboard, story.workspace);
  const card = await openBacklog(page, origin);
  const marked = await openReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);

  write(story.workspace, "src/b.ts", sixth("b", "b five"));
  const since = await reopenReview(page, card);
  expect(since.since?.from).toBe(marked.tree);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review).not.toContainText("Trunk was integrated");
  await expect
    .poll(() => treeRows(review.getByRole("list", { name: "1 changed file" })))
    .toEqual(["src", "  b.ts"]);
});
