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
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
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
  const review = await openIntentReviewChanges(page, card);
  const first = review.answer;
  expect(first.kind).toBe("published");
  if (first.kind !== "published") throw new Error("No published review");
  expect(first.completion).toBe(completion);
  expect(first.files.map((file) => file.path)).toContain("[literal]*.txt");
  expect(first.files.map((file) => file.path)).not.toContain("other-story.txt");
  const { files, diffs } = review;
  await review.expectText("Published completion");
  await files.choose("Modified shared.txt");
  await diffs.expectChangedLines("Modified shared.txt", {
    removed: ["-line 0"],
    added: ["+story first"],
  });
  await review.comparison.expectChosen("Published completion");
  await review.hideFiles();
  await review.setFilesShown(true);
  advanceCompletedTrunk(origin);
  expect((await review.refreshAndAnswer()).answer).toEqual(first);
  await review.returnToDevelopment();
  const reopened = await openIntentReviewChanges(page, card);
  expect(reopened.answer).toEqual(first);
  await reopened.files.choose("Added [literal]*.txt");
  await reopened.diffs.expectShows(
    "Added [literal]*.txt",
    "+delivered on another machine",
  );
  await reopened.expectNoText("later.txt");
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
  const withRun = (await reopened.refreshAndAnswer()).answer;
  expect(withRun).toMatchObject({
    kind: "published",
    completion,
    files: first.files,
  });
  await reopened.comparison.expectChosen("Published completion");
  await reopened.comparison.choose("Landed runs");
  await reopened.expectText(
    "captured landing repository is missing or unreadable",
  );
  await reopened.comparison.choose("Published completion");
  await reopened.comparison.expectChosen("Published completion");
  await reopened.files.choose("Added [literal]*.txt");
  await reopened.diffs.expectShows(
    "Added [literal]*.txt",
    "+delivered on another machine",
  );
});
