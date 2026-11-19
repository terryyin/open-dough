// Every retained run is a keyboard choice beside the live workspace.
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  reviewChoices,
  addLiveEdit,
} from "../../dashboard/test-support/support/oneShotReviewChoices.ts";
import { openCapturedReview } from "../../dashboard/test-support/support/oneShotReview.ts";

test("keyboard choices show each retained captured or legacy run beside the live workspace comparison", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const choices = await reviewChoices(dashboard, origin, codexProtocol);
  const { card, review } = await openCapturedReview(page, origin);
  const { answer } = review;
  expect(answer?.kind).toBe("snapshot");
  expect(answer?.runs?.map((run) => run.key)).toEqual([
    choices.second.key,
    choices.first.key,
    choices.legacy.key,
  ]);
  const { files, landedRun, commits, diffs } = review;
  addLiveEdit(choices.workspace);
  await review.status.refreshAndRead();
  await review.status.expectFeedbackSays(
    "Review refreshed: 2 changed files against baseline",
  );
  await review.comparison.expectChosen("All changes");
  await review.comparison.choose("Landed runs", "keyboard");
  await review.landedRun.expectChosen(choices.second.key);
  for (const [index, run] of [choices.second, choices.first].entries()) {
    await review.landedRun.press(
      "Home",
      ...(index > 0 ? ["ArrowDown"] : []),
      "Enter",
    );
    await review.landedRun.expectChosen(run.key);
    await review.comparison.expectChosen("Landed runs");
    await files.expectListed("1 changed file", [`Added ${run.name}.txt`]);
    await diffs.expectLines("added", [`+${run.name}.txt`]);
    await landedRun.expectShown(
      run.receipt.base,
      run.receipt.revision,
      "Refinement launched",
      "origin/main",
    );
    await landedRun.expectLaunchedAt(run.record.launchedAt);
  }
  await review.landedRun.press("End", "Enter");
  await review.landedRun.expectChosen(choices.legacy.key);
  await review.expectText("no captured landing comparison");
  await review.expectText("cannot be reconstructed from today's trunk");
  await landedRun.expectLaunchedAt(choices.legacy.launchedAt);
  await files.expectNoLists();
  expect(
    stored(dashboard.home).find(
      (record) => record.session.sessionId === choices.legacy.session.sessionId,
    )?.request.reporting,
  ).toBeUndefined();
  await review.comparison.choose("All changes", "keyboard");
  await review.landedRun.expectNoPicker();
  await files.expectListed("2 changed files", ["Added live-edit.txt"]);
  await review.comparison.choose("Commits");
  await commits.expectRowCount(2);
  await commits.chooseAlone(1);
  await commits.expectChosen(1);
  await commits.expectChosen(0, false);
  await diffs.expectLines("added", ["+live.txt"]);
  await review.comparison.choose("Landed runs");
  await review.landedRun.expectChosen(choices.second.key);
  await review.comparison.choose("Commits");
  await commits.expectChosen(1);
  await commits.expectChosen(0, false);
  await diffs.expectLines("added", ["+live.txt"]);
  await review.close();
  await expect(reviewChanges(card)).toBeFocused();
});
