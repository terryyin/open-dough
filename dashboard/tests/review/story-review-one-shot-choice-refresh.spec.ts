// Retained integration: real stored records -> Refresh -> immutable diff display.
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { Locator, Page } from "@playwright/test";
import {
  test,
  expect,
  storedReviewChoices,
  storedCapturedChoice,
} from "../support/storedReviewChoices.ts";
import { keptLaunchRecords } from "../support/launchStore.ts";
import { reviewLaunch } from "../support/reviewRunRecords.ts";
import { refreshAndRead } from "../support/reviewRead.ts";
import { openCapturedReview } from "../support/oneShotReview.ts";
import { recordOperation } from "../support/completionRecovery.ts";
import type { StartOrigin } from "../support/startOrigin.ts";

// Opens story A's review with the run `key` chosen under Landed runs; its
// Refresh waits until the review has read it.
async function chooseLandedRun(
  page: Page,
  origin: StartOrigin,
  key: string,
  name?: string,
) {
  await openCapturedReview(page, origin);
  const review = page.getByRole("region", { name: "Story review" });
  await review.getByRole("radio", { name: "Landed runs" }).check();
  const select = review.getByRole("listbox", { name: "Landed run" });
  await select.selectOption(key);
  if (name !== undefined)
    await expect(added(review)).toHaveText([`+${name}.txt`]);
  const refresh = () => refreshAndRead(review);
  return { review, select, refresh };
}
const added = (review: Locator) => review.locator(".story-review-added");

function recoveredChoice(record: LaunchRecord) {
  const established = record.start ?? record.preparation;
  if (established === undefined) {
    throw new Error("No established review run");
  }
  const launch = reviewLaunch({
    sessionId: "review-first-recovered",
    workspace: established.workspace,
    launchedAt: record.launchedAt,
    ...(record.request.reporting === undefined
      ? {}
      : { reference: record.request.reporting.reference }),
  });
  return record.doneAt === undefined
    ? launch.please()
    : launch.markedDoneAt(record.doneAt).please();
}

test("Refresh preserves a selected run after a new capture and after its native session is replaced", async ({
  page,
  dashboard,
  origin,
}) => {
  const { first, legacy } = await storedReviewChoices(dashboard, origin, [
    "first",
  ]);
  const { review, select, refresh } = await chooseLandedRun(
    page,
    origin,
    first.key,
    "first",
  );
  const third = await storedCapturedChoice(dashboard, origin, "third");
  await refresh();
  await expect(select).toHaveValue(first.key);
  expect(
    await select
      .locator("option")
      .evaluateAll((options) =>
        options.map((option) => option.getAttribute("value")),
      ),
  ).toEqual([third.key, first.key, legacy.key]);
  await expect(added(review)).toHaveText(["+first.txt"]);
  const keptFirst = keptLaunchRecords(dashboard).find(
    (record): record is LaunchRecord =>
      "session" in record && record.request.reporting?.reference === first.key,
  );
  if (keptFirst === undefined) throw new Error("No retained captured run");
  await recordOperation(dashboard, "replaceKeptSession", [
    "open-dough",
    first.record.session,
    recoveredChoice(keptFirst),
  ]);
  await refresh();
  await expect(select).toHaveValue(first.key);
  await expect(added(review)).toHaveText(["+first.txt"]);
});

test("Refresh replaces a deleted choice whose native session was replaced with the newest captured run rather than an older one", async ({
  page,
  dashboard,
  origin,
}) => {
  const { first, third } = await storedReviewChoices(dashboard, origin, [
    "first",
    "second",
    "third",
  ]);
  const { review, select, refresh } = await chooseLandedRun(
    page,
    origin,
    first.key,
    "first",
  );
  const keptFirst = keptLaunchRecords(dashboard).find(
    (record): record is LaunchRecord =>
      "session" in record && record.request.reporting?.reference === first.key,
  );
  if (keptFirst === undefined) throw new Error("No retained captured run");
  const replacement = recoveredChoice(keptFirst);
  await recordOperation(dashboard, "replaceKeptSession", [
    "open-dough",
    first.record.session,
    replacement,
  ]);
  // The newest captured run replaces the deleted choice, not the older one.
  await recordOperation(dashboard, "deleteRecord", [
    "open-dough",
    replacement.session,
  ]);
  await refresh();
  await expect(select).toHaveValue(third.key);
  await expect(select.locator("option")).toHaveCount(3);
  await expect(added(review)).toHaveText(["+third.txt"]);
});

test("Refresh replaces an expired choice with the remaining captured run and falls back to the evidence gap when that run is deleted", async ({
  page,
  dashboard,
  origin,
}) => {
  // This is the retained choice the deletion journey reaches, with only its
  // remaining captures and legacy run; no earlier mutation is needed here.
  const { second, third, legacy } = await storedReviewChoices(
    dashboard,
    origin,
    ["second", "third"],
  );
  const { review, select, refresh } = await chooseLandedRun(
    page,
    origin,
    third.key,
    "third",
  );
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    third.record.session,
    "2000-01-01T00:00:00.000Z",
  ]);
  await refresh();
  await expect(select).toHaveValue(second.key);
  await expect(select.locator("option")).toHaveCount(2);
  await expect(added(review)).toHaveText(["+second.txt"]);
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
