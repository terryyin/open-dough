import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
import { fileBrowser } from "../../dashboard/test-support/support/reviewContextLine.ts";
import {
  fileDiff,
  listedFile,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import {
  reviewRegion,
  comparisonChoice,
  filesToggle,
  toolbarComparison,
} from "../../dashboard/test-support/support/reviewControls.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  readReview,
  refreshReview,
} from "../../dashboard/test-support/support/launchLandingReview.ts";
import path from "node:path";
import {
  advanceCompletedTrunk,
  keepUnusableCompletedCapture,
} from "../../dashboard/test-support/support/completedStoryVisibleActions.ts";
import { ordinaryJourneyCompletedHistory } from "../../dashboard/test-support/support/completedFollowUpHistory.ts";

test.use({ originRepository: ordinaryJourneyCompletedHistory() });

test("a CLI-completed story without a local launch opens fixed published changes and file diffs after trunk advances", async ({
  page,
  dashboard,
  origin,
}) => {
  const completion = origin.revision("completion");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(sessionEntriesIn(card)).toHaveCount(0);
  await expect(reviewChanges(card)).toBeVisible();
  const first = await readReview(page, card);
  expect(first.kind).toBe("published");
  if (first.kind !== "published") throw new Error("No published review");
  expect(first.completion).toBe(completion);
  expect(first.files.map((file) => file.path)).toContain("[literal]*.txt");
  expect(first.files.map((file) => file.path)).not.toContain("other-story.txt");
  const review = reviewRegion(page);
  await expect(review).toContainText("Published completion");
  await listedFile(review, "Modified shared.txt", { exact: true }).click();
  const diff = fileDiff(review, "Modified shared.txt");
  await expect(diff.locator(".story-review-added")).toHaveText([
    "+story first",
  ]);
  await expect(diff.locator(".story-review-removed")).toHaveText(["-line 0"]);
  await expect(toolbarComparison(review)).toHaveText("Published completion");
  await filesToggle(review).click();
  await expect(fileBrowser(review)).toBeHidden();
  await filesToggle(review, "Show files").click();
  await expect(fileBrowser(review)).toBeVisible();
  advanceCompletedTrunk(origin);
  expect(await refreshReview(page, review)).toEqual(first);
  await closeSidePanel(review);
  expect(await readReview(page, card)).toEqual(first);
  await listedFile(review, "Added [literal]*.txt", { exact: true }).click();
  await expect(
    fileDiff(review, "Added [literal]*.txt", { exact: true }),
  ).toContainText("+delivered on another machine");
  await expect(review).not.toContainText("later.txt");
  // A later retained capture cannot replace the published comparison when
  // its repository is gone. Both choices remain navigable without a launch
  // being invented for the published completion.
  // Accepted cost: this tail's refresh and radio round trip, the only proof
  // of switching to Landed runs and back with the published files restored.
  // The server fallback proof
  // (../../dashboard/backend-tests/review/story-review-completed-gaps.spec.ts) cannot
  // show that, and ending the journey before the tail saved no time.
  keepUnusableCompletedCapture(dashboard, origin, {
    workspace: path.join(origin.project, ".worktrees", "missing-completed"),
    completion,
    baseline: origin.revision("interleaving"),
  });
  const withRun = await refreshReview(page, review);
  expect(withRun).toMatchObject({
    kind: "published",
    completion,
    files: first.files,
  });
  await expect(
    comparisonChoice(review, "Published completion", { exact: true }),
  ).toBeChecked();
  await comparisonChoice(review, "Landed runs", { exact: true }).check();
  await expect(review).toContainText(
    "captured landing repository is missing or unreadable",
  );
  await comparisonChoice(review, "Published completion", {
    exact: true,
  }).check();
  await expect(
    comparisonChoice(review, "Published completion", { exact: true }),
  ).toBeChecked();
  await expect(
    listedFile(review, "Added [literal]*.txt", { exact: true }),
  ).toBeVisible();
});
