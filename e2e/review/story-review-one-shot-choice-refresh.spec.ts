// Retained integration: real stored records -> Refresh -> immutable diff display.
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import type { Page } from "@playwright/test";
import {
  test,
  storedReviewChoices,
  storedCapturedChoice,
} from "../../dashboard/test-support/support/storedReviewChoices.ts";
import { keptLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { reviewLaunch } from "../../dashboard/test-support/support/reviewRunRecords.ts";
import { openCapturedReview } from "../../dashboard/test-support/support/oneShotReview.ts";
import { recordOperation } from "../../dashboard/test-support/support/completionRecovery.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";

// Opens story A's review with the run `key` chosen under Landed runs.
async function chooseLandedRun(
  page: Page,
  origin: StartOrigin,
  key: string,
  name?: string,
) {
  const review = await openCapturedReview(page, origin);
  await review.comparison.choose("Landed runs");
  await review.landedRun.choose(key);
  if (name !== undefined) {
    await review.files.choose(`Added ${name}.txt`);
    await review.diffs.expectLines("added", [`+${name}.txt`]);
  }
  return review;
}

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
  const review = await chooseLandedRun(page, origin, first.key, "first");
  const third = await storedCapturedChoice(dashboard, origin, "third");
  await review.refresh();
  await review.expectRead();
  await review.landedRun.expectChosen(first.key);
  await review.landedRun.expectRunKeys([third.key, first.key, legacy.key]);
  await review.diffs.expectLines("added", ["+first.txt"]);
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
  await review.refresh();
  await review.expectRead();
  await review.landedRun.expectChosen(first.key);
  await review.diffs.expectLines("added", ["+first.txt"]);
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
  const review = await chooseLandedRun(page, origin, first.key, "first");
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
  await review.refresh();
  await review.expectRead();
  await review.landedRun.expectChosen(third.key);
  await review.landedRun.expectRunCount(3);
  await review.files.choose("Added third.txt");
  await review.diffs.expectLines("added", ["+third.txt"]);
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
  const review = await chooseLandedRun(page, origin, third.key, "third");
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    third.record.session,
    "2000-01-01T00:00:00.000Z",
  ]);
  await review.refresh();
  await review.expectRead();
  await review.landedRun.expectChosen(second.key);
  await review.landedRun.expectRunCount(2);
  await review.files.choose("Added second.txt");
  await review.diffs.expectLines("added", ["+second.txt"]);
  await recordOperation(dashboard, "deleteRecord", [
    "open-dough",
    second.record.session,
  ]);
  await review.refresh();
  await review.expectRead();
  await review.landedRun.expectChosen(legacy.key);
  await review.landedRun.expectRunCount(1);
  await review.expectText("no captured landing comparison");
  await review.files.expectNoBrowser();
  await review.diffs.expectAbsent();
});
