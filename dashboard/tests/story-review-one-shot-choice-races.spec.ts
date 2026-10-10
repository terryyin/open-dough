// Older actual review/file responses cannot answer a later retained choice.
import { test, expect } from "./support/codexStart.ts";
import { reviewChoices } from "./support/oneShotReviewChoices.ts";
import { openCapturedReview } from "./support/oneShotReview.ts";
import { holdNextReviewResponse } from "./support/holdReviewResponse.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../src/storyReview.ts";

test("delayed run and file responses leave the later run selected through narrow layout and panel controls", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(90_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const { first, second } = await reviewChoices(
    dashboard,
    origin,
    codexProtocol,
  );
  const { card } = await openCapturedReview(page, origin);
  const review = page.getByRole("region", { name: "Review changes" });
  const radio = review.getByRole("radio", { name: "Landed runs" });
  const select = review.getByRole("listbox", { name: "Landed run" });
  const heldRun = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewEndpoint,
  );
  try {
    await radio.check();
    expect(await (await heldRun.ready).json()).toMatchObject({
      selectedRun: second.key,
      tree: second.receipt.revision,
    });
    await select.selectOption(first.key);
    await expect(review.locator(".story-review-added")).toHaveText([
      "+first.txt",
    ]);
    heldRun.release();
    await heldRun.delivery;
    await expect(select).toHaveValue(first.key);
    await expect(review.locator(".story-review-added")).toHaveText([
      "+first.txt",
    ]);
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
    await select.selectOption(second.key);
    expect(await (await heldFile.ready).json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+second.txt"),
    });
    await select.selectOption(first.key);
    await expect(review.locator(".story-review-added")).toHaveText([
      "+first.txt",
    ]);
    heldFile.release();
    await heldFile.delivery;
    await expect(select).toHaveValue(first.key);
    await expect(review.locator(".story-review-added")).toHaveText([
      "+first.txt",
    ]);
  } finally {
    heldFile.release();
    await heldFile.delivery;
  }
  const edge = review.getByRole("separator", { name: "Resize panel" });
  await expect(edge).toBeVisible();
  const width = Number(await edge.getAttribute("aria-valuenow"));
  await edge.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(edge).toHaveAttribute("aria-valuenow", String(width + 32));
  await expect(select).toHaveValue(first.key);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+first.txt",
  ]);
  await page.setViewportSize({ width: 420, height: 900 });
  await expect(select).toHaveValue(first.key);
  const files = review.getByRole("list", {
    name: "1 changed file",
    exact: true,
  });
  await review.getByRole("button", { name: "Hide files" }).click();
  await expect(files).toBeHidden();
  await review.getByRole("button", { name: "Show files" }).click();
  await expect(files).toBeVisible();
  const browser = await review.locator(".story-review-files").boundingBox();
  const diff = await review.locator(".story-review-diff").boundingBox();
  expect(browser).not.toBeNull();
  expect(diff).not.toBeNull();
  expect(diff?.y).toBeGreaterThan((browser?.y ?? 0) + (browser?.height ?? 0));
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(420);
  await review.getByRole("button", { name: "Maximize", exact: true }).click();
  await expect(select).toHaveValue(first.key);
  await review.getByRole("button", { name: "Restore", exact: true }).click();
  await expect(review.locator(".story-review-added")).toHaveText([
    "+first.txt",
  ]);
  await review.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toBeFocused();
});
