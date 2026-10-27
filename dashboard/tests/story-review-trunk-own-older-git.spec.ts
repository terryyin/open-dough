// A Trunk Mode story with published commits
// (./support/storyReviewTrunkMode.ts) reviewed on a machine whose Git cannot
// restate trees (./support/storyReviewOlderGit.ts): the published commits
// stay in trunk, so All changes lists the unpublished and uncommitted changes
// against the merge-base as for any worktree, the context line reads as any
// baseline's, and the feedback says, for as long as the snapshot is shown,
// that the story's published commits could not be taken out. A mark taken
// against trunk less those commits, by a Git that could take them out, is
// then explained as one this Git cannot compare, and the review still lists
// all changes.

import type { Locator } from "@playwright/test";
import { expect } from "./support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  reviewFeedback,
} from "./support/reviewContextLine.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  changedPaths,
  keptStoryAMark,
  markReviewed,
  openStoryReview,
  refreshReview,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import { gitRestates, olderGit } from "./support/storyReviewOlderGit.ts";
import {
  commitUnpublished,
  openTaken,
  shownWorkspace,
  trunkModeStory,
} from "./support/storyReviewTrunkMode.ts";
import { branch, git, writeAt } from "./support/storyReviewWorktree.ts";

const keptIn = (commits: string) =>
  `This machine's Git cannot take the story's ${commits} out of trunk, so All changes shows only what is not yet published.`;

// The context line names the baseline as any worktree's: the trunk revision
// where the branch meets trunk, with nothing said taken out.
async function expectPlainContextLine(review: Locator, trunk: string) {
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
  );
  await expect(
    contextLine(review).locator(".story-review-context-baseline"),
  ).toHaveText(
    new RegExp(`^Baseline ${trunk.slice(0, 7)}.* meets\\s+origin/main$`),
  );
}

olderGit(
  "a Git that cannot take a Trunk Mode story's published commits out of trunk lists what is not yet published and says why",
  async ({ page, dashboard, origin }) => {
    const { workspace, trunk } = trunkModeStory(origin, { published: 2 });
    commitUnpublished(workspace);
    await keepLaunchRecord(dashboard, workspace);
    const snapshot = await openStoryReview(page, await openTaken(page, origin));
    const review = reviewRegion(page);

    await olderGit.step(
      "all changes lists the unpublished and uncommitted files against the merge-base",
      async () => {
        expect(snapshot.published).toEqual({
          trunk,
          commits: 2,
          kept: "not-restated",
        });
        expect(snapshot.baseline).toBe(trunk);
        // Not `src/a.ts` or `d.md`, which the story published.
        expect(changedPaths(snapshot.files)).toEqual(["notes.md", "src/g.ts"]);
        await expect
          .poll(() =>
            treeRows(review.getByRole("list", { name: "2 changed files" })),
          )
          .toEqual(["src", "  g.ts", "notes.md"]);
        expect(snapshot.commits.map(({ subject }) => subject)).toEqual(["u1"]);
      },
    );

    await olderGit.step("the feedback says why", async () => {
      await expect(reviewFeedback(review)).toHaveText(
        keptIn("2 published commits"),
      );
      await expectPlainContextLine(review, trunk);
    });

    await olderGit.step("Refresh keeps saying it", async () => {
      const refreshed = await refreshReview(review);
      expect(refreshed.published?.kept).toBe("not-restated");
      await expect(reviewFeedback(review)).toHaveText(
        `Review refreshed: 2 changed files against baseline ${trunk.slice(0, 7)}.${keptIn("2 published commits")}`,
      );
    });

    await olderGit.step(
      "with nothing unpublished left, the worktree matches trunk",
      async () => {
        git(workspace, "reset", "--quiet", "--hard", "origin/main");
        git(workspace, "clean", "--quiet", "-f");
        const none = await refreshReview(review);
        expect(none.files).toEqual([]);
        await expect(review).toContainText(
          `No changes: the worktree matches baseline ${trunk.slice(0, 7)}.`,
        );
        await expect(reviewFeedback(review)).toContainText(
          keptIn("2 published commits"),
        );
      },
    );
  },
);

olderGit(
  "a mark taken against trunk less the story's commits is explained by a Git that cannot take them out, beside all changes",
  async ({ page, dashboard, origin, pathPrefix }) => {
    gitRestates(pathPrefix ?? [], true);
    const { workspace, trunk } = trunkModeStory(origin, { published: 1 });
    commitUnpublished(workspace);
    await keepLaunchRecord(dashboard, workspace);
    const marked = await openStoryReview(page, await openTaken(page, origin));
    const review = reviewRegion(page);
    expect(marked.published).toEqual({ trunk, commits: 1 });
    expect(git(workspace, "cat-file", "-t", marked.baseline)).toBe("tree");
    await markReviewed(review);
    expect(keptStoryAMark(dashboard)?.baseline).toBe(marked.baseline);

    gitRestates(pathPrefix ?? [], false);
    writeAt(workspace, "notes.md", "more notes\n");
    const kept = await refreshReview(review);

    expect(kept.published).toEqual({ trunk, commits: 1, kept: "not-restated" });
    expect(kept.baseline).toBe(trunk);
    expect(kept.since).toBeUndefined();
    expect(kept.markUncomparable).toBe("not-restated");
    expect(changedPaths(kept.files)).toEqual(["notes.md", "src/g.ts"]);
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "2 changed files" })),
      )
      .toEqual(["src", "  g.ts", "notes.md"]);
    await expect(review).toContainText(
      "but this machine's Git cannot leave out trunk's changes integrated since, so the earlier review cannot be compared across them: all changes are shown.",
    );
    await expect(
      review.getByRole("radio", { name: "Since the review" }),
    ).toHaveCount(0);
    await expect(reviewFeedback(review)).toContainText(
      keptIn("1 published commit"),
    );
    await expectPlainContextLine(review, trunk);
  },
);
