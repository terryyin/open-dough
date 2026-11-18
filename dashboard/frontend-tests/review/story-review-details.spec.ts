// Review changes opens on the diff: the comparison choices, the context of
// the comparison shown and the uncommitted check wait behind the toolbar's
// eye, while reading progress, problems and Commits' own work stay in view.
import { closeSidePanel } from "../../test-support/sidePanelFrame.ts";
import { reviewChanges } from "../../test-support/storyCardControls.ts";
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
import {
  contextLine,
  fileBrowser,
} from "../../test-support/support/reviewContextLine.ts";
import {
  comparisonChoice,
  expectShown,
  expectToggleLeadsToolbar,
  filesToggle,
  reviewRegion,
  toolbarComparison,
  uncommittedCheck,
} from "../../test-support/support/reviewControls.ts";
import {
  escapeDetailsFrom,
  expectDetailsCollapsed,
  expectDetailsRevealed,
  expectEyeBesideComparison,
  hideDetails,
  revealDetails,
} from "../../test-support/support/reviewDetails.ts";
import {
  codePane,
  scrollPane,
  scrollTopOf,
} from "../../test-support/support/reviewPanes.ts";
import { refreshAndRead } from "../../test-support/support/reviewRead.ts";
import {
  changedFilesList,
  expectFileSelected,
  fileDiff,
  fileRow,
} from "../../test-support/support/reviewTreeRows.ts";

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
  const { review } = await openWorkspaceReview(page, frontendServices);
  // Compact opening: toggle, name, eye; files and the first diff readable.
  await expect(changedFilesList(review, "3 changed files")).toBeVisible();
  await expect(fileDiff(review, "Added first.txt")).toContainText("+alpha");
  await expectDetailsCollapsed(review);
  await expectToggleLeadsToolbar(review, "All changes");
  await expectEyeBesideComparison(review, "Show review details");

  // The second file, its diff scrolled.
  await fileRow(review, "Added second.txt").click();
  const code = codePane(fileDiff(review, "Added second.txt"));
  await expect(code).toContainText("+second 0");
  const readingAt = await scrollPane(code, 120);
  expect(readingAt).toBeGreaterThan(0);

  const details = await revealDetails(review);
  await expectEyeBesideComparison(review, "Hide review details");
  await expectShown(review, "All changes");
  await expect(details.getByRole("radiogroup")).toBeVisible();
  await expect(contextLine(review)).toBeVisible();
  await expect(details).toContainText("claude/taken");
  await expect(uncommittedCheck(review)).toBeChecked();
  await expectFileSelected(review, "Added second.txt");
  expect(await scrollTopOf(code)).toBe(readingAt);

  await hideDetails(review);
  await expect(toolbarComparison(review)).toHaveText("All changes");
  await expectFileSelected(review, "Added second.txt");
  expect(await scrollTopOf(code)).toBe(readingAt);

  // The sidebar toggle works with the details revealed too.
  await revealDetails(review);
  await filesToggle(review).click();
  await expect(fileBrowser(review)).toBeHidden();
  await expectDetailsRevealed(review);
  await filesToggle(review, "Show files").click();
  await expectFileSelected(review, "Added second.txt");

  // Leaving uncommitted changes out keeps the details revealed.
  await uncommittedCheck(review).uncheck();
  await expect(uncommittedCheck(review)).not.toBeChecked();
  await expectDetailsRevealed(review);
});

test("choosing Commits in the details renames the toolbar, and the range and commit list stay when the details hide", async ({
  page,
  frontendServices,
}) => {
  const { review } = await openWorkspaceReview(page, frontendServices);
  await revealDetails(review);
  await comparisonChoice(review, "Commits", { exact: true }).check();
  await expect(toolbarComparison(review)).toHaveText("Commits");
  await expectShown(review, "Commits");
  await expectDetailsRevealed(review);
  const commits = review.getByRole("list", {
    name: "Story commits",
    exact: true,
  });
  const range = review.locator(".story-review-range-heading");
  await expect(commits).toBeVisible();
  await expect(range).toBeVisible();

  // The revealed state lasts across Refresh.
  await refreshAndRead(review);
  await expectDetailsRevealed(review);
  await expect(toolbarComparison(review)).toHaveText("Commits");

  await escapeDetailsFrom(
    review,
    comparisonChoice(review, "Commits", { exact: true }),
  );
  await expect(commits).toBeVisible();
  await expect(range).toBeVisible();
  await expect(toolbarComparison(review)).toHaveText("Commits");
});

test("another story's review opens collapsed with the files shown, whatever the last one left", async ({
  page,
  frontendServices,
}) => {
  const answers = await installFrontendStoryReview(page, workspaceSnapshot());
  answers.answerFile(frontendFileDiff("first.txt", ["+alpha"]));
  await openFrontendBoardReview(page, frontendServices);
  await reviewChanges(doneCard(page, storyA.title)).click();
  const review = reviewRegion(page);
  await expect(review).toContainText(storyA.title);
  // Details collapsed, third file selected: the sidebar toggle works.
  await fileRow(review, "Added third.txt").click();
  await expectFileSelected(review, "Added third.txt");
  await expectDetailsCollapsed(review);
  await filesToggle(review).click();
  await expect(fileBrowser(review)).toBeHidden();
  await expect(fileDiff(review, "Added third.txt")).toBeVisible();
  await filesToggle(review, "Show files").click();
  await expectFileSelected(review, "Added third.txt");

  // Left with the details revealed and the files hidden.
  await revealDetails(review);
  await filesToggle(review).click();
  await expect(fileBrowser(review)).toBeHidden();
  await closeSidePanel(review);
  await expect(reviewRegion(page)).toHaveCount(0);

  await reviewChanges(doneCard(page, storyB.title)).click();
  const next = reviewRegion(page);
  await expect(next).toContainText(storyB.title);
  await expect(changedFilesList(next, "3 changed files")).toBeVisible();
  await expectDetailsCollapsed(next);
  await expect(fileBrowser(next)).toBeVisible();
  await expect(filesToggle(next, "Hide files")).toBeVisible();
  await expect(fileDiff(next, "Added first.txt")).toBeVisible();
});
