// A Trunk Mode story with published commits
// (../../dashboard/test-support/support/storyReviewTrunkMode.ts) reviewed on a machine whose Git cannot
// restate trees (../../dashboard/test-support/support/storyReviewOlderGit.ts): the published commits
// stay in trunk, so All changes lists the unpublished and uncommitted changes
// against the merge-base as for any worktree, the context line reads as any
// baseline's, and the feedback says, for as long as the snapshot is shown,
// that the story's published commits could not be taken out.

import { expect } from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  openReviewChanges,
  type ReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { olderGit } from "../../dashboard/test-support/support/storyReviewOlderGit.ts";
import {
  openTaken,
  shownWorkspace,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import {
  branch,
  git,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

// Declared two published commits, unpublished `u1`, and untracked notes.
olderGit.use({
  originRepository: trunkModeStory({ published: 2, unpublished: true }),
});

const keptIn = (commits: string) =>
  `This machine's Git cannot take the story's ${commits} out of trunk, so All changes shows only what is not yet published.`;

// The context line names the baseline as any worktree's: the trunk revision
// where the branch meets trunk, with nothing said taken out.
async function expectPlainContextLine(review: ReviewChanges, trunk: string) {
  await review.context.expectWords(
    contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
  );
  await review.context.expectBaseline(
    new RegExp(`^Baseline ${trunk.slice(0, 7)}.* meets\\s+origin/main$`),
    { exact: true },
  );
}

olderGit(
  "a Git that cannot take a Trunk Mode story's published commits out of trunk lists what is not yet published and says why",
  async ({ page, dashboard, origin }) => {
    const { workspace } = storyWorktree(origin);
    const trunk = origin.revision("s2");
    keepLaunchRecord(dashboard, workspace);
    const review = await openReviewChanges(page, await openTaken(page, origin));
    const { snapshot } = review;

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
        await review.files.expectRows("2 changed files", [
          "src",
          "  g.ts",
          "notes.md",
        ]);
        expect(snapshot.commits.map(({ subject }) => subject)).toEqual(["u1"]);
      },
    );

    await olderGit.step("the feedback says why", async () => {
      await review.status.expectFeedback(keptIn("2 published commits"));
      await expectPlainContextLine(review, trunk);
    });

    await olderGit.step("Refresh keeps saying it", async () => {
      const refreshed = (await review.refreshAndAnswer()).snapshot;
      expect(refreshed.published?.kept).toBe("not-restated");
      await review.status.expectFeedback(
        `Review refreshed: 2 changed files against baseline ${trunk.slice(0, 7)}.${keptIn("2 published commits")}`,
      );
    });

    await olderGit.step(
      "with nothing unpublished left, the worktree matches trunk",
      async () => {
        git(workspace, "reset", "--quiet", "--hard", "origin/main");
        git(workspace, "clean", "--quiet", "-f");
        const none = (await review.refreshAndAnswer()).snapshot;
        expect(none.files).toEqual([]);
        await review.expectText(
          `No changes: the worktree matches baseline ${trunk.slice(0, 7)}.`,
        );
        await review.status.expectFeedback(
          new RegExp(
            keptIn("2 published commits").replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&",
            ),
          ),
        );
      },
    );
  },
);
