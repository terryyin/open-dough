// Every retained run is a keyboard choice beside the live workspace.
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
  // Three real launches must settle in order before the browser opens review.
  test.setTimeout(60_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const choices = await reviewChoices(dashboard, origin, codexProtocol);
  const review = await openCapturedReview(page, origin);
  const { answer } = review;
  expect(answer.kind).toBe("snapshot");
  expect(answer.runs?.map((run) => run.key)).toEqual([
    choices.second.key,
    choices.first.key,
    choices.legacy.key,
  ]);
  const { files, landedRun, commits, diffs } = review;
  addLiveEdit(choices.workspace);
  await review.refresh();
  await review.expectRead();
  await review.expectFeedback(
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
    await files.expectOutsideFiles(1, [`Added ${run.name}.txt`]);
    await files.choose(`Added ${run.name}.txt`);
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
  await files.expectNoBrowser();
  await diffs.expectAbsent();
  expect(
    stored(dashboard.home).find(
      (record) => record.session.sessionId === choices.legacy.session.sessionId,
    )?.request.reporting,
  ).toBeUndefined();
  await review.comparison.choose("All changes", "keyboard");
  await review.landedRun.expectNoPicker();
  await files.expectOutsideFiles(2, ["Added live-edit.txt"]);
  await review.comparison.choose("Commits");
  await commits.expectRowCount(2);
  await commits.chooseAlone(1);
  await commits.expectChosen(1);
  await commits.expectChosen(0, false);
  await files.choose("Added live.txt");
  await diffs.expectLines("added", ["+live.txt"]);
  await review.comparison.choose("Landed runs");
  await review.landedRun.expectChosen(choices.second.key);
  await review.comparison.choose("Commits");
  await commits.expectChosen(1);
  await commits.expectChosen(0, false);
  await files.choose("Added live.txt");
  await diffs.expectLines("added", ["+live.txt"]);
  await review.returnToDevelopment();
});
