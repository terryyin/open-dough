// A Trunk Mode story's review shows the story's own changes
// (../../dashboard/test-support/support/storyReviewTrunkMode.ts): the commits its agent already
// published on trunk are taken out of the baseline, so All changes lists the
// published, unpublished and uncommitted changes together and leaves out
// every other commit on trunk, even one that changed another part of a file
// the story changed. The claim, another agent's commit, an earlier story the
// same agent closed, and a merge she authored stay trunk's. The context line
// names the trunk revision less the story's published commits. Commits stays
// the worktree's own. With nothing published since the claim the review is
// the one every worktree has: the merge-base as baseline.
// ./story-review-trunk-own-flagged.spec.ts covers a file trunk rewrote where
// the story changed it, and the context line's one published commit.

import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  commitUnpublished,
  openTaken,
  shownWorkspace,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import {
  branch,
  git,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

test.describe("published Trunk Mode attribution", () => {
  test.use({ originRepository: trunkModeStory({ published: 2 }) });

  test("all changes lists a Trunk Mode story's published changes beside its unpublished ones and leaves trunk's out", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    const trunk = origin.revision("s2");
    expect(git(workspace, "rev-parse", "HEAD")).toBe(trunk);
    keepLaunchRecord(dashboard, workspace);
    const card = await openTaken(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { snapshot, files, diffs } = review;

    await test.step("the published and uncommitted files are listed, and no other commit's", async () => {
      // Not `src/b.ts`, `prep.md`, `merged.md`, `old.md`, or the claim's files.
      expect(snapshot.files.map(({ path: file }) => file)).toEqual([
        "d.md",
        "notes.md",
        "src/a.ts",
      ]);
      expect(snapshot.published).toEqual({ trunk, commits: 2 });
      expect(snapshot.baseline).not.toBe(trunk);
      await files.expectOutsideRows(["src", "  a.ts", "d.md", "notes.md"]);
      // The file trunk also changed shows the story's line alone.
      await files.choose("Modified src/a.ts", "keyboard");
      await diffs.expectChangedLines("Modified src/a.ts", {
        removed: ["-a 0"],
        added: ["+a one"],
      });
    });

    await test.step("the context line names trunk less the story's published commits", async () => {
      const words = contextWords({
        branch,
        baseline: trunk,
        published: 2,
        workspace: shownWorkspace,
      });
      const { context } = review;
      await context.expectWords(words);
      await context.expectShortBaseline(trunk.slice(0, 7));
      await context.expectBaseline("origin/main less 2 story commits");
      await context.showInFull();
      await context.expectBaseline(
        `Baseline ${trunk} where ${branch} meets origin/main, less the story's 2 published commits`,
        { exact: true },
      );
      await context.expectWords(words);
      await context.showInFull(false);
    });

    await test.step("an unpublished commit is listed with the rest, and Commits stays the worktree's", async () => {
      commitUnpublished(workspace);
      const refreshed = await review.refreshAndAnswer();
      const later = refreshed.snapshot;
      expect(later.published).toEqual({ trunk, commits: 2 });
      expect(later.files.map(({ path: file }) => file)).toEqual([
        "d.md",
        "notes.md",
        "src/a.ts",
        "src/g.ts",
      ]);
      expect(later.commits.map(({ subject }) => subject)).toEqual(["u1"]);
      await refreshed.files.expectOutsideRows([
        "src",
        "  a.ts",
        "  g.ts",
        "d.md",
        "notes.md",
      ]);

      await refreshed.comparison.choose("Commits");
      const { commits } = refreshed;
      await commits.expectRowCount(2);
      await commits.expectRowText(0, /^Uncommitted changes$/);
      await commits.expectRowText(1, "u1");

      await refreshed.comparison.choose("All changes");
      await refreshed.comparison.includeUncommitted(false);
      await refreshed.files.expectOutsideRows([
        "src",
        "  a.ts",
        "  g.ts",
        "d.md",
      ]);
    });
  });
});

test.describe("nothing published since the claim", () => {
  test.use({
    originRepository: trunkModeStory({ published: 0, unpublished: true }),
  });

  test("a Trunk Mode story with nothing published since its claim is reviewed against the merge-base", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    const trunk = origin.revision("take Story A");
    keepLaunchRecord(dashboard, workspace);
    const card = await openTaken(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { snapshot } = review;

    expect(snapshot.published).toBeUndefined();
    expect(snapshot.baseline).toBe(trunk);
    expect(snapshot.baseline).toBe(
      git(workspace, "merge-base", "HEAD", "origin/main"),
    );
    expect(snapshot.files.map(({ path: file }) => file)).toEqual([
      "notes.md",
      "src/g.ts",
    ]);
    await review.context.expectWords(
      contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
    );
    await review.context.expectBaselineLacks("less");
  });
});
