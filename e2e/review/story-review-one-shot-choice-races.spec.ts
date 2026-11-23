// Older actual review/file responses cannot answer a later retained choice.
import {
  test as base,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import { reviewChoices } from "../../dashboard/test-support/support/oneShotReviewChoices.ts";
import { openCapturedReview } from "../../dashboard/test-support/support/oneShotReview.ts";
import { holdNextReviewResponse } from "../../dashboard/test-support/support/holdReviewResponse.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../dashboard/src/storyReviewContract.ts";
// Prepare immutable installed Codex and preview inputs before the case's
// private origin and its real native launches begin.
const test = base.extend({
  originRepository: async (
    { queuedCodexPreviewReady, originRepository },
    use,
  ) => {
    await Promise.resolve(queuedCodexPreviewReady);
    await use(originRepository);
  },
});

test("delayed run and file responses leave the later run selected through narrow layout and the file toggle", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const { first, second } = await reviewChoices(
    dashboard,
    origin,
    codexProtocol,
  );
  const review = await openCapturedReview(page, origin);
  const { files, diffs } = review;
  const heldRun = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewEndpoint,
  );
  try {
    await review.comparison.choose("Landed runs");
    expect(await (await heldRun.ready).json()).toMatchObject({
      selectedRun: second.key,
      tree: second.receipt.revision,
    });
    await review.landedRun.choose(first.key);
    await files.choose("Added first.txt");
    await diffs.expectLines("added", ["+first.txt"]);
    heldRun.release();
    await heldRun.delivery;
    await review.landedRun.expectChosen(first.key);
    await diffs.expectLines("added", ["+first.txt"]);
  } finally {
    heldRun.release();
    await heldRun.delivery;
  }
  const heldFile = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewFileEndpoint,
  );
  try {
    await review.landedRun.choose(second.key);
    await files.choose("Added second.txt");
    expect(await (await heldFile.ready).json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+second.txt"),
    });
    await review.landedRun.choose(first.key);
    await files.choose("Added first.txt");
    await diffs.expectLines("added", ["+first.txt"]);
    heldFile.release();
    await heldFile.delivery;
    await review.landedRun.expectChosen(first.key);
    await diffs.expectLines("added", ["+first.txt"]);
  } finally {
    heldFile.release();
    await heldFile.delivery;
  }
  await page.setViewportSize({ width: 420, height: 900 });
  await review.landedRun.expectChosen(first.key);
  await review.hideFiles();
  await review.setFilesShown(true);
  await files.expectOutsideFiles(1, ["Added first.txt"]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(420);
  await review.landedRun.expectChosen(first.key);
  await diffs.expectLines("added", ["+first.txt"]);
});
