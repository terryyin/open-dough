// Older actual review/file responses cannot answer a later retained choice.
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
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
import {
  expectCovering,
  focusDivider,
  panelDivider,
  pressDividerKey,
  resizeUntilArranged,
} from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { sidePanelContents } from "../../dashboard/test-support/support/sidePanelContents.ts";

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

test("delayed run and file responses leave the later run selected through narrow layout and panel controls", async ({
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
  const { card, review } = await openCapturedReview(page, origin);
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
    expect(await (await heldFile.ready).json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+second.txt"),
    });
    await review.landedRun.choose(first.key);
    await diffs.expectLines("added", ["+first.txt"]);
    heldFile.release();
    await heldFile.delivery;
    await review.landedRun.expectChosen(first.key);
    await diffs.expectLines("added", ["+first.txt"]);
  } finally {
    heldFile.release();
    await heldFile.delivery;
  }
  const panel = sidePanelContents(page);
  const divider = panelDivider(panel, { exact: false });
  await expect(divider).toBeVisible();
  const width = Number(await divider.getAttribute("aria-valuenow"));
  await focusDivider(panel, { exact: false });
  await pressDividerKey(page, "ArrowLeft");
  await expect(divider).toHaveAttribute("aria-valuenow", String(width + 32));
  await review.landedRun.expectChosen(first.key);
  await diffs.expectLines("added", ["+first.txt"]);
  await resizeUntilArranged(panel, { width: 420, height: 900 });
  await review.landedRun.expectChosen(first.key);
  await expectCovering(panel);
  await review.hideFiles();
  await review.expectFilesShown(false);
  await review.showFiles();
  await files.expectListed("1 changed file");
  await files.expectBrowserAboveDiff();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(420);
  await review.landedRun.expectChosen(first.key);
  await diffs.expectLines("added", ["+first.txt"]);
  await review.close();
  await expect(reviewChanges(card)).toBeFocused();
});
