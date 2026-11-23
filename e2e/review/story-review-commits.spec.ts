// A snapshot's own first-parent commits, and one commit's comparison in the
// same file browser and diff as All changes. Trunk merges remain selectable.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  openIntentReviewChanges,
  openReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  git,
  observed,
  storyFromBase,
  storyWorktree,
  unchangedRepository,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  storyARepository,
  storyAWithNewestRepository,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";

test.use({ originRepository: unchangedRepository });

// A new plain head after Story A's merge gives the default one plain
// commit's changes beside the declared uncommitted state.
test.describe("from Story A's declared history with a newest plain edit", () => {
  test.use({
    originRepository: storyAWithNewestRepository({
      name: "newest story edit",
      files: { "story.txt": "story\nnewest story\n" },
    }),
  });

  test("Commits lists the first-parent line below Uncommitted changes and shows a chosen commit's trees", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const before = observed(workspace);
    const card = await openBacklog(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { snapshot } = review;
    const expected = git(
      workspace,
      "log",
      "--first-parent",
      "--format=%H",
      `${snapshot.baseline}..HEAD`,
    ).split("\n");
    expect(snapshot.commits.map(({ revision }) => revision)).toEqual(expected);
    expect(snapshot.commits.map(({ subject }) => subject)).toEqual([
      "newest story edit",
      "merge trunk",
      "delete a file and redraw the image",
      "story file",
      "rename with a small edit",
    ]);
    await review.comparison.choose("Commits");
    const { commits, files, diffs } = review;
    await commits.expectRowCount(6);
    for (const [at, commit] of snapshot.commits.entries()) {
      await commits.expectRowText(
        at + 1,
        `${commit.shortRevision} ${commit.subject}`,
      );
      await commits.expectCommittedAt(at + 1, commit.committedAt);
    }
    await commits.expectRowText(2, "Integrated trunk");
    await commits.expectEnabled(2);
    await commits.expectRowText(0, /^Uncommitted changes$/);
    await commits.expectChosen(0);
    await commits.chooseAlone(1);
    await commits.expectRange(
      "Changes in 1 commit",
      `From ${snapshot.commits[0]?.shortRevision} newest story edit to ${snapshot.commits[0]?.shortRevision} newest story edit.`,
    );
    await files.expectOutsideFiles(1, ["Modified story.txt"]);
    await files.choose("Modified story.txt");
    await diffs.expectText("newest story");
    await diffs.expectText("untracked", false);
    // Extend to the older commit, then activate again to start its own range.
    await commits.chooseAlone("last");
    await commits.expectChosen("last");
    await files.expectOutsideFiles(1, ["Renamed old.txt → new.txt"]);
    await files.choose("Renamed old.txt → new.txt");
    await diffs.expectText("renamed");
    await diffs.expectText("newest story", false);
    await review.comparison.expectChosen("Commits");
    await review.hideFiles();
    await review.expectFilesHidden();
    await diffs.expectShown();
    expect(observed(workspace)).toEqual(before);
  });
});

test.describe("from Story A's declared history", () => {
  test.use({ originRepository: storyARepository });

  test("a clean merge selected alone changed nothing by itself", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    await review.comparison.choose("Commits");
    const { commits, files } = review;
    await commits.chooseAlone(1);
    await commits.expectChosen(1);
    await commits.expectEnabled(0);
    await review.expectText("The chosen commits changed nothing.");
    await files.expectNone();
    await review.expectNoFilesToggle();
    await commits.chooseAlone(3);
    await files.expectListed("1 changed file", ["Added story.txt"]);
  });
});

test("no commits and no uncommitted changes offers no Commits", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const review = await openIntentReviewChanges(page, card);
  expect(review.snapshot.commits).toEqual([]);
  await review.files.expectNone();
  await review.comparison.expectOffered("Commits", false);
});

test.describe("with one empty story commit", () => {
  test.use({
    originRepository: storyFromBase()
      .withUnpublishedRevision("empty story commit")
      .please(),
  });
  test("an empty plain commit names its range and lists no files", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    await review.comparison.choose("Commits");
    await review.expectRead();
    await review.commits.expectRange("Changes in 1 commit");
    await review.expectText("The chosen commits changed nothing.");
    await review.files.expectNone();
    await review.expectNoFilesToggle();
  });
});
