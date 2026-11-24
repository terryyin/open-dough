import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import { expectReviewed } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import { storyHeaderReading } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { renameSync } from "node:fs";
import path from "node:path";
import {
  advanceCompletedTrunk,
  keepUnusableCompletedCapture,
} from "../../dashboard/test-support/support/completedStoryVisibleActions.ts";
import { ordinaryJourneyCompletedHistory } from "../../dashboard/test-support/support/completedFollowUpHistory.ts";
import { renameExecutionCheckout } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";

test.use({ originRepository: ordinaryJourneyCompletedHistory() });

test("a CLI-completed story without a local launch opens fixed published changes and file diffs after trunk advances, its checkout moves and origin becomes unreachable", async ({
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
  await expectReviewed(card, false);
  const review = await openIntentReviewChanges(page, card);
  const first = review.answer;
  expect(first.kind).toBe("published");
  if (first.kind !== "published") throw new Error("No published review");
  expect(first.completion).toBe(completion);
  expect(first.files.map((file) => file.path)).toContain("[literal]*.txt");
  expect(first.files.map((file) => file.path)).not.toContain("other-story.txt");
  const { files, diffs } = review;
  await review.expectText("Published completion");
  await expect(
    storyHeaderReading(parts(page).intent).revisions.locator("time"),
  ).toHaveAttribute("datetime", first.completedAt);
  await review.expectText(first.target);
  await files.choose("Modified shared.txt");
  await diffs.expectChangedLines("Modified shared.txt", {
    removed: ["-line 0"],
    added: ["+story first"],
  });
  await review.comparison.expectNoSwitch();
  await review.hideFiles();
  await review.setFilesShown(true);
  advanceCompletedTrunk(origin);
  const moved = renameExecutionCheckout(origin);
  expect((await review.refreshAndAnswer()).answer).toEqual(first);
  await review.returnToDevelopment();
  await expectReviewed(card, false);
  const reopened = await openIntentReviewChanges(page, card);
  expect(reopened.answer).toEqual(first);
  await reopened.expectText("Published completion");
  await reopened.files.choose("Added [literal]*.txt");
  await reopened.diffs.expectShows(
    "Added [literal]*.txt",
    "+delivered on another machine",
  );
  await reopened.expectNoText("later.txt");
  moved.restore();
  // A receipt with a missing capture repository still opens its fixed landing.
  // The single chooser keeps the published completion reachable beside it.
  keepUnusableCompletedCapture(dashboard, origin, {
    workspace: path.join(origin.project, ".worktrees", "missing-completed"),
    completion,
    baseline: origin.revision("interleaving"),
  });
  const withRun = (await reopened.refreshAndAnswer()).answer;
  expect(withRun).toMatchObject({
    kind: "published",
    completion,
    files: first.files,
  });
  await reopened.comparison.expectChosen("Published completion");
  await reopened.landedRun.chooseLatest();
  await reopened.landedRun.expectShown(completion);
  await reopened.comparison.choose("Published completion");
  await reopened.comparison.expectChosen("Published completion");
  await reopened.files.choose("Added [literal]*.txt");
  await reopened.diffs.expectShows(
    "Added [literal]*.txt",
    "+delivered on another machine",
  );
  // Origin becomes unreachable: a reopen reads the last sync with its notice.
  renameSync(origin.origin, `${origin.origin}-away`);
  await reopened.returnToDevelopment();
  const offline = await openIntentReviewChanges(page, card);
  await offline.expectFeedback(
    /Review not refreshed: origin could not be synced \(.+\)\. What is shown was last synced at \S.*\./,
  );
  await offline.files.choose("Modified shared.txt");
  await offline.diffs.expectChangedLines("Modified shared.txt", {
    removed: ["-line 0"],
    added: ["+story first"],
  });
});
