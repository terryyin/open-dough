// Review changes opens on the diff: the comparison choices, the context of
// the comparison shown and the uncommitted check wait behind the toolbar's
// eye, while reading progress, problems and Commits' own work stay in view.
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
import { reviewChanges } from "../../tests/storyCardControls.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import {
  openFrontendBoardReview,
  storyA,
  storyB,
} from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import { doneCard } from "../../tests/recentlyDoneReviewState.ts";
import { openFrontendStoryReviewAsOpened } from "../../tests/support/frontendStoryReviewOpen.ts";
import {
  contextLine,
  fileBrowser,
  reviewFeedback,
} from "../../tests/support/reviewContextLine.ts";
import {
  comparisonChoice,
  expectShown,
  expectToggleLeadsToolbar,
  filesToggle,
  reviewRefresh,
  reviewRegion,
  toolbarComparison,
  uncommittedCheck,
} from "../../tests/support/reviewControls.ts";
import {
  escapeDetailsFrom,
  expectDetailsCollapsed,
  expectDetailsRevealed,
  expectEyeBesideComparison,
  hideDetails,
  revealDetails,
} from "../../tests/support/reviewDetails.ts";
import {
  codePane,
  scrollPane,
  scrollTopOf,
} from "../../tests/support/reviewPanes.ts";
import { refreshAndRead } from "../../tests/support/reviewRead.ts";
import {
  changedFilesList,
  expectFileSelected,
  fileDiff,
  fileRow,
} from "../../tests/support/reviewTreeRows.ts";

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

test("reading progress and a problem explain themselves with the details collapsed", async ({
  page,
  frontendServices,
}) => {
  const { review, answers } = await openWorkspaceReview(page, frontendServices);
  await expectDetailsCollapsed(review);
  const held = answers.holdNextSnapshot();
  try {
    await reviewRefresh(review, { exact: true }).click();
    await held.received;
    await expect(reviewFeedback(review)).toContainText(
      "Refreshing the review…",
    );
    await expectDetailsCollapsed(review);
  } finally {
    held.release();
  }
  await expect(reviewFeedback(review)).toContainText("Review refreshed");
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    (route) => route.fulfill({ status: 500, body: "unreadable" }),
  );
  await reviewRefresh(review, { exact: true }).click();
  await expect(reviewFeedback(review)).toContainText(
    "The review could not be read:",
  );
  await expectDetailsCollapsed(review);
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
