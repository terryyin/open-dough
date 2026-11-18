// The Landed run picker and the selected run's facts wait in the review
// details: choosing a run there updates the toolbar, the details and the
// diff together and leaves the details revealed.
import { test, expect } from "../../dashboard/tests/support/codexStart.ts";
import { reviewChoices } from "../../dashboard/tests/support/oneShotReviewChoices.ts";
import { openCapturedReview } from "../../dashboard/tests/support/oneShotReview.ts";
import {
  comparisonChoice,
  expectShown,
  landedRunChoice,
  reviewRegion,
  toolbarComparison,
} from "../../dashboard/tests/support/reviewControls.ts";
import {
  escapeDetailsFrom,
  expectDetailsRevealed,
  hideDetails,
  revealDetails,
} from "../../dashboard/tests/support/reviewDetails.ts";
import {
  expectReviewRead,
  refreshAndRead,
} from "../../dashboard/tests/support/reviewRead.ts";
import { fileDiff } from "../../dashboard/tests/support/reviewTreeRows.ts";

test("choosing the older landed run in the revealed details shows that run and Escape from the picker returns to the eye", async ({
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
  await openCapturedReview(page, origin);
  const review = reviewRegion(page);
  await comparisonChoice(review, "Landed runs", { exact: true }).check();
  await expectReviewRead(review);
  await expect(toolbarComparison(review)).toHaveText("Landed runs");

  // Compact: the newest run's diff reads without picker or run facts.
  await hideDetails(review);
  await expect(fileDiff(review, `Added ${second.name}.txt`)).toContainText(
    `+${second.name}.txt`,
  );
  await expect(
    review.locator("code", { hasText: second.receipt.revision }),
  ).toBeHidden();

  const details = await revealDetails(review);
  const picker = landedRunChoice(review);
  await expect(picker).toHaveValue(second.key);
  await expectShown(review, "Landed runs");
  for (const run of [second, first]) {
    await picker.selectOption(run.key);
    await expectReviewRead(review);
    await expect(picker).toHaveValue(run.key);
    await expect(toolbarComparison(review)).toHaveText("Landed runs");
    await expectDetailsRevealed(review);
    await expect(details).toContainText("Refinement launched");
    await expect(details.locator("time")).toHaveAttribute(
      "datetime",
      run.record.launchedAt,
    );
    await expect(details).toContainText("origin/main");
    await expect(details).toContainText(
      `From ${run.receipt.base} to ${run.receipt.revision}.`,
    );
    await expect(fileDiff(review, `Added ${run.name}.txt`)).toContainText(
      `+${run.name}.txt`,
    );
  }

  // The revealed state and the older run last across Refresh.
  await refreshAndRead(review);
  await expectDetailsRevealed(review);
  await expect(picker).toHaveValue(first.key);

  await escapeDetailsFrom(review, picker);
  await expect(fileDiff(review, `Added ${first.name}.txt`)).toBeVisible();
});
