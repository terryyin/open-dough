// A marked story that merged trunk since the review: its changes since the
// review leave out what came only from trunk. After the mark, trunk takes the
// story's landed slice and changes `README.md`, `src/a.ts`, and the same line
// of `src/c.ts` the story changed; the story merges trunk, settling
// `src/c.ts`, and changes `src/b.ts`. The review lists `src/b.ts` and
// `src/c.ts` only and says trunk was integrated since the mark; `src/c.ts`,
// which Git cannot separate from trunk's change, is flagged as including
// trunk's changes and diffed from the marked snapshot; had the story kept its
// marked `src/c.ts`, that file is flagged and diffed from the baseline, the
// story's version against trunk's; had it only merged trunk's `README.md`,
// nothing changed since the review beyond what trunk now holds. On a Git that
// cannot restate the mark --
// one before 2.45, refusing a tree given with `--merge-base` -- the review
// still opens on all changes, says why the earlier review cannot be compared,
// and Mark reviewed starts again from there; with an unchanged baseline
// nothing is restated.

import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/preparationPage.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import {
  expectSinceTheReview,
  keptStoryAMark,
  markReviewed,
  reopenReview,
} from "./support/storyReviewMark.ts";
import {
  integrateTrunk,
  markStoryReview,
  sixth,
} from "./support/storyReviewTrunk.ts";
import { writeAt } from "./support/storyReviewWorktree.ts";

test("after trunk was integrated, the changes since the review leave trunk's out and flag what cannot be separated", async ({
  page,
  dashboard,
  origin,
}) => {
  const { story, card, review, marked } = await markStoryReview(
    page,
    dashboard,
    origin,
  );

  integrateTrunk(origin, story, "c story and trunk");
  writeAt(story.workspace, "src/b.ts", sixth("b", "b five"));
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

  // (b) The inseparable file is flagged, and diffed and counted from the
  // marked snapshot.
  const flagged = "Modified src/c.ts, includes trunk's changes";
  await expect(
    files
      .getByRole("button", { name: flagged })
      .locator(".story-review-line-counts"),
  ).toHaveText("+1 −1", { useInnerText: true });
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

test("a conflicted file the story kept as marked is flagged and diffed from the baseline", async ({
  page,
  dashboard,
  origin,
}) => {
  const { story, card, review } = await markStoryReview(
    page,
    dashboard,
    origin,
  );

  integrateTrunk(origin, story, "c story");
  const since = await reopenReview(page, card);
  expect(
    since.since?.files.map(({ path: file, includesTrunkFrom }) => ({
      file,
      includesTrunkFrom,
    })),
  ).toEqual([{ file: "src/c.ts", includesTrunkFrom: since.baseline }]);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review).not.toContainText("Nothing changed since the review");
  const files = review.getByRole("list", { name: "1 changed file" });
  await expect
    .poll(() => treeRows(files))
    .toEqual(["src", "  c.ts includes trunk's changes"]);

  const flagged = "Modified src/c.ts, includes trunk's changes";
  await files.getByRole("button", { name: flagged }).press("Enter");
  const cDiff = review.getByRole("region", { name: flagged });
  await expect(cDiff.locator(".story-review-removed")).toHaveText(["-c trunk"]);
  await expect(cDiff.locator(".story-review-added")).toHaveText(["+c story"]);
});

test("after trunk was integrated with nothing else, nothing changed since the review beyond what trunk holds", async ({
  page,
  dashboard,
  origin,
}) => {
  const { story, card, review } = await markStoryReview(
    page,
    dashboard,
    origin,
  );

  integrateTrunk(origin, story);
  const since = await reopenReview(page, card);
  expect(since.since?.files).toEqual([]);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review.locator(".story-review-since")).toContainText(
    "Trunk was integrated since the mark",
  );
  // (d) No file, not even the landed slice.
  await expect(review).not.toContainText("landed.txt");
  await expect(review).toContainText(
    "Nothing changed since the review beyond what trunk now holds.",
  );
});

test("a marked story whose baseline is unchanged does not say trunk was integrated", async ({
  page,
  dashboard,
  origin,
}) => {
  const { story, card, review, marked } = await markStoryReview(
    page,
    dashboard,
    origin,
  );

  writeAt(story.workspace, "src/b.ts", sixth("b", "b five"));
  const since = await reopenReview(page, card);
  expect(since.since?.from).toBe(marked.tree);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expect(review).not.toContainText("Trunk was integrated");
  await expect
    .poll(() => treeRows(review.getByRole("list", { name: "1 changed file" })))
    .toEqual(["src", "  b.ts"]);
});

// The dashboard's Git as one before 2.45: `merge-tree` refuses the marked
// tree as not a commit; every other call reaches the real Git.
const olderGit = test.extend({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  pathPrefix: async ({}, use) => {
    const bin = mkdtempSync(path.join(tmpdir(), "dough-older-git-"));
    const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
    const wrapper = path.join(bin, "git");
    writeFileSync(
      wrapper,
      [
        "#!/bin/sh",
        'if [ "$1" = merge-tree ]; then',
        '  echo "fatal: $6 is not a commit" >&2',
        "  exit 128",
        "fi",
        `exec '${realGit}' "$@"`,
        "",
      ].join("\n"),
    );
    chmodSync(wrapper, 0o755);
    await use([bin]);
    rmSync(bin, { recursive: true, force: true });
  },
});

olderGit(
  "a Git that cannot restate the mark shows all changes, says why, and marking starts again",
  async ({ page, dashboard, origin }) => {
    const { story, card, review } = await markStoryReview(
      page,
      dashboard,
      origin,
    );

    // (a) All changes and Commits, why the earlier review cannot be compared.
    integrateTrunk(origin, story, "c story and trunk");
    writeAt(story.workspace, "src/b.ts", sixth("b", "b five"));
    const all = await reopenReview(page, card);
    expect(all.since).toBeUndefined();
    expect(all.markUncomparable).toBe("not-restated");
    expect(all.files.map(({ path: file }) => file)).toEqual([
      "src/b.ts",
      "src/c.ts",
    ]);
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "2 changed files" })),
      )
      .toEqual(["src", "  b.ts", "  c.ts"]);
    await expect(review).toContainText(
      "but this machine's Git cannot leave out trunk's changes integrated since, so the earlier review cannot be compared across them: all changes are shown.",
    );
    await expect(
      review.getByRole("radio", { name: "Commits", exact: true }),
    ).toBeVisible();
    await expect(
      review.getByRole("radio", { name: "Since the review" }),
    ).toHaveCount(0);
    await expect(review).not.toContainText("since the review");

    // (b) Marked again, the unchanged baseline needs no restating.
    await markReviewed(review);
    expect(keptStoryAMark(dashboard)?.tree).toBe(all.tree);
    writeAt(story.workspace, "src/b.ts", sixth("b", "b six"));
    const since = await reopenReview(page, card);
    expect(since.markUncomparable).toBeUndefined();
    expect(since.since?.from).toBe(all.tree);
    await expectSinceTheReview(review, keptStoryAMark(dashboard));
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "1 changed file" })),
      )
      .toEqual(["src", "  b.ts"]);
  },
);
