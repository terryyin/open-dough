// Every retained run is a keyboard choice beside the live workspace.
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import { reviewChoices } from "../../dashboard/test-support/support/oneShotReviewChoices.ts";
import { openCapturedReview } from "../../dashboard/test-support/support/oneShotReview.ts";

test("keyboard choices show each retained captured or legacy run from their recorded landing comparisons", async ({
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
  expect(answer.kind).toBe("landed");
  expect(answer.runs?.map((run) => run.key)).toEqual([
    choices.second.key,
    choices.first.key,
    choices.legacy.key,
  ]);
  const { files, landedRun, diffs } = review;
  await review.landedRun.expectChosen(choices.second.key);
  for (const run of [choices.second, choices.first]) {
    await review.landedRun.choose(run.key, "keyboard");
    await review.landedRun.expectChosen(run.key);

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
  await review.landedRun.choose(choices.legacy.key, "keyboard");
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
  await review.returnToDevelopment();
});
