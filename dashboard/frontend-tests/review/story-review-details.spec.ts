// Review changes opens on the diff: the comparison choices, the context of
// the comparison shown and the uncommitted check wait behind the toolbar's
// eye, while reading progress, problems and Commits' own work stay in view.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import {
  openFrontendBoardReview,
  storyA,
  storyB,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { doneCard } from "../../test-support/doneStoryReviewPage.ts";
import { openFrontendStoryReviewAsOpened } from "../../test-support/support/frontendStoryReviewOpen.ts";
import { openReviewChanges } from "../../test-support/reviewChangesPage.ts";

const added = (path: string) => ({
  kind: "added" as const,
  path,
  lines: { added: 1, removed: 0 },
});
const threeFiles = [
  added("first.txt"),
  added("second.txt"),
  added("third.txt"),
];
const longSecond = frontendFileDiff(
  "second.txt",
  Array.from({ length: 300 }, (...[, line]) => `+second ${String(line)}`),
);

// A workspace snapshot of three files whose committed part can be told from
// its uncommitted changes, so the uncommitted check is offered.
const workspaceSnapshot = () =>
  frontendReviewSnapshot({
    files: threeFiles,
    uncommitted: {
      kind: "uncommitted",
      tree: frontendReviewIds.tree,
      baseline: frontendReviewIds.baseline,
      fromTree: frontendReviewIds.baseline,
      fromBaseline: frontendReviewIds.baseline,
    },
    committed: {
      from: frontendReviewIds.baseline,
      tree: frontendReviewIds.head,
      files: threeFiles,
    },
  });

const openWorkspaceReview = (
  page: Parameters<typeof openFrontendStoryReviewAsOpened>[0],
  frontendServices: Parameters<typeof openFrontendStoryReviewAsOpened>[1],
) =>
  openFrontendStoryReviewAsOpened(
    page,
    frontendServices,
    workspaceSnapshot(),
    (initial) => {
      initial.answerFile(frontendFileDiff("first.txt", ["+alpha"]));
      initial.answerFile(longSecond, "second.txt");
    },
  );

test("a workspace review opens on the diff and keeps its place while the eye reveals and hides its details", async ({
  page,
  frontendServices,
}) => {
  const { reviewChanges: review } = await openWorkspaceReview(
    page,
    frontendServices,
  );
  const { files, details, code, diffs } = review;
  // Compact opening: toggle, name, eye; files and the first diff readable.
  await files.expectListed("3 changed files");
  await diffs.expectShows("Added first.txt", "+alpha");
  await review.details.expectCollapsed();
  await review.expectFilesToggleLeads("All changes");
  await details.expectEyeBesideComparison("Show review details");

  // The second file, its diff scrolled.
  await files.chooseShown("Added second.txt");
  await code.expectShows("Added second.txt", "+second 0");
  const readingAt = await code.scrollTo("Added second.txt", 120);
  expect(readingAt).toBeGreaterThan(0);

  await details.reveal();
  await details.expectEyeBesideComparison("Hide review details");
  await review.comparison.expectChosen("All changes");
  await review.context.expectSays("claude/taken");
  await details.expectText("claude/taken");
  await review.comparison.expectUncommittedIncluded(true);
  await files.expectSelected("Added second.txt");
  expect(await code.scrollTop("Added second.txt")).toBe(readingAt);

  await review.details.hide();
  await review.expectComparisonNamed("All changes");
  await files.expectSelected("Added second.txt");
  expect(await code.scrollTop("Added second.txt")).toBe(readingAt);

  // The sidebar toggle works with the details revealed too.
  await details.reveal();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.details.expectRevealed();
  await review.showFiles();
  await files.expectSelected("Added second.txt");

  // Leaving uncommitted changes out keeps the details revealed.
  await review.comparison.includeUncommitted(false);
  await review.comparison.expectUncommittedIncluded(false);
  await review.details.expectRevealed();
});

test("choosing Commits in the details renames the toolbar, and the range and commit list stay when the details hide", async ({
  page,
  frontendServices,
}) => {
  const { reviewChanges: review } = await openWorkspaceReview(
    page,
    frontendServices,
  );
  const { commits, details } = review;
  await details.reveal();
  await review.comparison.choose("Commits");
  await review.expectComparisonNamed("Commits");
  await review.comparison.expectChosen("Commits");
  await review.details.expectRevealed();
  await commits.expectListAndRangeShown();

  // The revealed state lasts across Refresh.
  await review.status.refreshAndRead();
  await review.details.expectRevealed();
  await review.expectComparisonNamed("Commits");

  await details.escapeFromComparison("Commits");
  await commits.expectListAndRangeShown();
  await review.expectComparisonNamed("Commits");
});

test("another story's review opens collapsed with the files shown, whatever the last one left", async ({
  page,
  frontendServices,
}) => {
  const answers = await installFrontendStoryReview(page, workspaceSnapshot());
  answers.answerFile(frontendFileDiff("first.txt", ["+alpha"]));
  await openFrontendBoardReview(page, frontendServices);
  const review = await openReviewChanges(page, doneCard(page, storyA.title));
  const { files, diffs } = review;
  await review.expectText(storyA.title);
  // Details collapsed, third file selected: the sidebar toggle works.
  await files.chooseShown("Added third.txt");
  await files.expectSelected("Added third.txt");
  await review.details.expectCollapsed();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await diffs.expectShows("Added third.txt");
  await review.showFiles();
  await files.expectSelected("Added third.txt");

  // Left with the details revealed and the files hidden.
  await review.details.reveal();
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.close();

  const next = await openReviewChanges(page, doneCard(page, storyB.title));
  await next.expectText(storyB.title);
  await next.files.expectListed("3 changed files");
  await next.details.expectCollapsed();
  await next.expectFilesShown(true);
  await next.expectFilesToggleNamed("Hide files");
  await next.diffs.expectShows("Added first.txt");
});
