// Refresh keeps a retained choice and permanently replaces deleted/expired runs.
import { test, expect, stored } from "./support/codexStart.ts";
import {
  reviewChoices,
  capturedChoice,
} from "./support/oneShotReviewChoices.ts";
import { openCapturedReview } from "./support/oneShotReview.ts";
import { recordOperation } from "./support/completionRecovery.ts";

test("Refresh preserves a selected run after a new capture and reconciles deletion, retention expiry, and the remaining evidence gap", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  test.setTimeout(90_000);
  if (codexProtocol === undefined) throw new Error("No native fixture");
  const { first, second, legacy, live } = await reviewChoices(
    dashboard,
    origin,
    codexProtocol,
  );
  await openCapturedReview(page, origin);
  const review = page.getByRole("region", { name: "Review changes" });
  await review.getByRole("radio", { name: "Landed runs" }).check();
  const select = review.getByRole("listbox", { name: "Landed run" });
  await select.selectOption(first.key);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+first.txt",
  ]);
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    live.session,
    new Date().toISOString(),
  ]);
  const third = await capturedChoice(dashboard, origin, codexProtocol, "third");
  const refresh = async () => {
    await review.getByRole("button", { name: "Refresh" }).click();
    await expect(
      review.getByRole("button", { name: "Refresh" }),
    ).toHaveAttribute("aria-disabled", "false");
  };
  await refresh();
  await expect(select).toHaveValue(first.key);
  expect(
    await select
      .locator("option")
      .evaluateAll((options) =>
        options.map((option) => option.getAttribute("value")),
      ),
  ).toEqual([third.key, second.key, first.key, legacy.key]);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+first.txt",
  ]);
  const keptFirst = stored(dashboard.home).find(
    (record) => record.request.reporting?.reference === first.key,
  );
  if (keptFirst === undefined) throw new Error("No retained captured run");
  const replacement = {
    ...keptFirst,
    session: { ...keptFirst.session, sessionId: "review-first-recovered" },
  };
  await recordOperation(dashboard, "replaceKeptSession", [
    "open-dough",
    first.record.session,
    replacement,
  ]);
  await refresh();
  await expect(select).toHaveValue(first.key);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+first.txt",
  ]);
  await recordOperation(dashboard, "deleteRecord", [
    "open-dough",
    replacement.session,
  ]);
  await refresh();
  await expect(select).toHaveValue(third.key);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+third.txt",
  ]);
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    third.record.session,
    "2000-01-01T00:00:00.000Z",
  ]);
  await refresh();
  await expect(select).toHaveValue(second.key);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+second.txt",
  ]);
  await recordOperation(dashboard, "deleteRecord", [
    "open-dough",
    second.record.session,
  ]);
  await refresh();
  await expect(select).toHaveValue(legacy.key);
  await expect(select.locator("option")).toHaveCount(1);
  await expect(review).toContainText("no captured landing comparison");
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
});
