import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// Every retained run is a keyboard choice beside the live workspace.
import { changedFilesList } from "../../dashboard/test-support/support/reviewTreeRows.ts";
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
import { refreshAndRead } from "../../dashboard/test-support/support/reviewRead.ts";
import { openCapturedReview } from "../../dashboard/test-support/support/oneShotReview.ts";
import { chooseCommit } from "../../dashboard/test-support/support/storyReviewCommitChoice.ts";
import {
  reviewRegion,
  comparisonChoice,
  landedRunChoice,
} from "../../dashboard/test-support/support/reviewControls.ts";

test("keyboard choices show each retained captured or legacy run beside the live workspace comparison", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const choices = await reviewChoices(dashboard, origin, codexProtocol);
  const { card, review: answer } = await openCapturedReview(page, origin);
  expect(answer.kind).toBe("snapshot");
  expect(answer.runs?.map((run) => run.key)).toEqual([
    choices.second.key,
    choices.first.key,
    choices.legacy.key,
  ]);
  const review = reviewRegion(page);
  addLiveEdit(choices.workspace);
  await refreshAndRead(review);
  await expect(review).toContainText(
    "Review refreshed: 2 changed files against baseline",
  );
  await expect(
    comparisonChoice(review, "All changes", { exact: true }),
  ).toBeChecked();
  const radio = comparisonChoice(review, "Landed runs", { exact: true });
  await radio.focus();
  await page.keyboard.press("Space");
  const select = landedRunChoice(review);
  await expect(select).toHaveValue(choices.second.key);
  for (const [index, run] of [choices.second, choices.first].entries()) {
    await select.focus();
    await page.keyboard.press("Home");
    if (index > 0) await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(select).toHaveValue(run.key);
    await expect(review.getByRole("radio", { checked: true })).toHaveCount(1);
    await expect(
      changedFilesList(review, "1 changed file", { exact: true }).getByRole(
        "button",
        { name: `Added ${run.name}.txt`, exact: true },
      ),
    ).toBeVisible();
    await expect(review.locator(".story-review-added")).toHaveText([
      `+${run.name}.txt`,
    ]);
    await expect(review).toContainText(run.receipt.base);
    await expect(review).toContainText(run.receipt.revision);
    await expect(review).toContainText("Refinement launched");
    await expect(review.locator("time")).toHaveAttribute(
      "datetime",
      run.record.launchedAt,
    );
    await expect(review).toContainText("origin/main");
  }
  await select.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(select).toHaveValue(choices.legacy.key);
  await expect(review).toContainText("no captured landing comparison");
  await expect(review).toContainText(
    "cannot be reconstructed from today's trunk",
  );
  await expect(review.locator("time")).toHaveAttribute(
    "datetime",
    choices.legacy.launchedAt,
  );
  await expect(review.getByRole("list")).toHaveCount(0);
  expect(
    stored(dashboard.home).find(
      (record) => record.session.sessionId === choices.legacy.session.sessionId,
    )?.request.reporting,
  ).toBeUndefined();
  await comparisonChoice(review, "All changes", { exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(review.getByRole("listbox")).toHaveCount(0);
  await expect(
    changedFilesList(review, "2 changed files", { exact: true }).getByRole(
      "button",
      { name: "Added live-edit.txt", exact: true },
    ),
  ).toBeVisible();
  await comparisonChoice(review, "Commits", { exact: true }).check();
  const commits = review.getByRole("list", {
    name: "Story commits",
    exact: true,
  });
  const rows = commits.getByRole("button");
  await expect(rows).toHaveCount(2);
  await chooseCommit(review, rows.nth(1));
  await chooseCommit(review, rows.nth(1));
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  await expect(review.locator(".story-review-added")).toHaveText(["+live.txt"]);
  await radio.check();
  await expect(select).toHaveValue(choices.second.key);
  await comparisonChoice(review, "Commits", { exact: true }).check();
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  await expect(review.locator(".story-review-added")).toHaveText(["+live.txt"]);
  await closeSidePanel(review);
  await expect(reviewChanges(card)).toBeFocused();
});
