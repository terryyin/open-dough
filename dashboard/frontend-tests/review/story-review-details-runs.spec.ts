import { storyA } from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
// A Done story with two captured runs opens on the newer run's diff: the
// older run updates the details and diff together and survives Refresh.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { openFrontendDoneStoryReview } from "../../test-support/support/frontendStoryReviewOpen.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import {
  intentDiffReading,
  intentFile,
  storySummary,
} from "../../test-support/support/intentStoryPage.ts";
import { ReviewLandedRun } from "../../test-support/reviewChangesLandedRun.ts";
import {
  comparisonChoice,
  reviewRefresh,
} from "../../test-support/support/reviewControls.ts";

const oid = (digit: string) => digit.repeat(40);
const older = {
  name: "first",
  run: makeMe.aReviewRun
    .keyed("capture-older-run")
    .launchedAt("2026-01-01T10:00:00.000Z")
    .comparing(oid("1"), oid("2"))
    .please(),
};
const newer = {
  name: "second",
  run: makeMe.aReviewRun
    .keyed("capture-newer-run")
    .launchedAt("2026-01-02T12:00:00.000Z")
    .comparing(oid("3"), oid("4"))
    .please(),
};
const runs = [newer.run, older.run];
const landedOn = ({ name, run }: typeof older) =>
  makeMe.aStoryReview.landed().adding(`${name}.txt`).onRun(run, runs).please();

test("a Done card opens on the latest captured run, keeping an older choice across Refresh", async ({
  page,
  frontendServices,
}) => {
  const { review: intent } = await openFrontendDoneStoryReview(
    page,
    frontendServices,
    landedOn(newer),
    (answers) => {
      answers.answerHistoricalSnapshot(storyA.identity, landedOn(newer));
      answers.answerRunSnapshot(older.run.key, landedOn(older));
      for (const { name } of [older, newer])
        answers.answerFile(
          frontendFileDiff(`${name}.txt`, [`+${name}.txt`]),
          `${name}.txt`,
        );
    },
  );
  const summary = storySummary(intent);
  const picker = new ReviewLandedRun(summary, async () => {});
  await picker.expectChosen(newer.run.key);
  await picker.expectRunKeys(runs.map((run) => run.key));
  await expect(comparisonChoice(summary, "Landed runs")).toBeChecked();
  for (const { name, run } of [newer, older]) {
    await picker.choose(run.key);
    await picker.expectChosen(run.key);
    await picker.expectLaunchedAt(run.launchedAt);
    const { base, revision } = run.comparison ?? {};
    await picker.expectShown(
      "Refinement launched",
      "origin/main",
      `From ${base} to ${revision}.`,
    );
    await intentFile(intent, `Added ${name}.txt`).click();
    await expect(intentDiffReading(intent).code).toContainText(`+${name}.txt`);
  }
  await reviewRefresh(summary).click();
  await expect(summary.getByRole("status")).toContainText("Review refreshed");
  await picker.expectChosen(older.run.key);
  await expect(intentDiffReading(intent).code).toContainText("+first.txt");
});
