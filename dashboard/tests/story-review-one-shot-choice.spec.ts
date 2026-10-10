// Every retained run is a keyboard choice beside the marked live workspace.
import { test, expect, stored } from "./support/codexStart.ts";
import { reviewChoices, addLiveEdit } from "./support/oneShotReviewChoices.ts";
import { openCapturedReview } from "./support/oneShotReview.ts";
import {
  markReviewed,
  keptStoryAMark,
  reviewedRefs,
} from "./support/storyReviewMark.ts";

test("keyboard choices show each retained captured or legacy run beside the live marked comparison without changing its mark", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(90_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const choices = await reviewChoices(dashboard, origin, codexProtocol);
  const { card, review: answer } = await openCapturedReview(page, origin);
  expect(answer.kind).toBe("snapshot");
  expect(answer.runs?.map((run) => run.key)).toEqual([
    choices.second.key,
    choices.first.key,
    choices.legacy.key,
  ]);
  const review = page.getByRole("region", { name: "Review changes" });
  await markReviewed(review);
  const mark = keptStoryAMark(dashboard);
  const refs = reviewedRefs(origin.project);
  addLiveEdit(choices.workspace);
  await review.getByRole("button", { name: "Refresh" }).click();
  await expect(review).toContainText(
    "Review refreshed: 1 changed file since the review",
  );
  await expect(
    review.getByRole("radio", { name: "Since the review", exact: true }),
  ).toBeChecked();
  const radio = review.getByRole("radio", {
    name: "Landed one-shot runs",
    exact: true,
  });
  await radio.focus();
  await page.keyboard.press("Space");
  const select = review.getByRole("listbox", { name: "One-shot run" });
  await expect(select).toHaveValue(choices.second.key);
  for (const [index, run] of [choices.second, choices.first].entries()) {
    await select.focus();
    await page.keyboard.press("Home");
    if (index > 0) await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(select).toHaveValue(run.key);
    await expect(review.getByRole("radio", { checked: true })).toHaveCount(1);
    await expect(
      review
        .getByRole("list", { name: "1 changed file", exact: true })
        .getByRole("button", { name: `Added ${run.name}.txt`, exact: true }),
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
    await expect(
      review.getByRole("button", { name: "Mark reviewed" }),
    ).toHaveCount(0);
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
  expect(keptStoryAMark(dashboard)).toEqual(mark);
  expect(reviewedRefs(origin.project)).toBe(refs);
  await review
    .getByRole("radio", { name: "Since the review", exact: true })
    .focus();
  await page.keyboard.press("Space");
  await expect(review.getByRole("listbox")).toHaveCount(0);
  await expect(
    review
      .getByRole("list", { name: "1 changed file", exact: true })
      .getByRole("button", { name: "Added after-mark.txt", exact: true }),
  ).toBeVisible();
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toBeVisible();
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  const commits = review.getByRole("list", {
    name: "Story commits",
    exact: true,
  });
  const rows = commits.getByRole("button");
  await expect(rows).toHaveCount(2);
  await rows.nth(1).click();
  await rows.nth(1).click();
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  await expect(review.locator(".story-review-added")).toHaveText(["+live.txt"]);
  await radio.check();
  await expect(select).toHaveValue(choices.second.key);
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
  await review.getByRole("radio", { name: "Commits", exact: true }).check();
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  await expect(review.locator(".story-review-added")).toHaveText(["+live.txt"]);
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toBeVisible();
  expect(keptStoryAMark(dashboard)).toEqual(mark);
  expect(reviewedRefs(origin.project)).toBe(refs);
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
});
