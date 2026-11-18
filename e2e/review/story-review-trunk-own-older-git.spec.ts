// A Trunk Mode story with published commits
// (../../dashboard/test-support/support/storyReviewTrunkMode.ts) reviewed on a machine whose Git cannot
// restate trees (../../dashboard/test-support/support/storyReviewOlderGit.ts): the published commits
// stay in trunk, so All changes lists the unpublished and uncommitted changes
// against the merge-base as for any worktree, the context line reads as any
// baseline's, and the feedback says, for as long as the snapshot is shown,
// that the story's published commits could not be taken out.

import type { Locator } from "@playwright/test";
import { expect } from "../../dashboard/test-support/support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  reviewFeedback,
} from "../../dashboard/test-support/support/reviewContextLine.ts";
import {
  expectTreeRows,
  changedFilesList,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { reviewRegion } from "../../dashboard/test-support/support/reviewControls.ts";
import {
  openStoryReview,
  refreshReview,
} from "../../dashboard/test-support/support/reviewRead.ts";
import { olderGit } from "../../dashboard/test-support/support/storyReviewOlderGit.ts";
import {
  commitUnpublished,
  openTaken,
  shownWorkspace,
  trunkModeRepository,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import {
  branch,
  git,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

// Trunk up to Yui-chan's claim of Story A in Trunk Mode.
olderGit.use({ originRepository: trunkModeRepository });

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
    keepLaunchRecord(dashboard, workspace);
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
        expect(snapshot.files.map(({ path }) => path)).toEqual([
          "notes.md",
          "src/g.ts",
        ]);
        await expectTreeRows(changedFilesList(review, "2 changed files"), [
          "src",
          "  g.ts",
          "notes.md",
        ]);
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
