// Honest empty and unavailable captured comparisons never substitute current trunk.
import {
  test,
  expect,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  commit,
  git,
} from "../../dashboard/test-support/support/launchLanding.ts";
import {
  startReviewRun,
  captureReviewRun,
  retireReviewRun,
  openCapturedReview,
} from "../../dashboard/test-support/support/oneShotReview.ts";

for (const captured of [true, false]) {
  test(
    captured
      ? "a valid empty captured comparison says the delivered run changed nothing"
      : "a retired legacy one-shot without capture exposes its evidence gap",
    async ({ page, dashboard, origin }) => {
      const run = await startReviewRun(dashboard);
      const receipt = captured ? captureReviewRun(run, origin) : undefined;
      const base = run.established.startingRevision ?? "";
      retireReviewRun(run, origin, receipt?.revision ?? base);
      const review = await openCapturedReview(page, origin);
      const { answer } = review;
      if (captured) {
        expect(answer).toMatchObject({
          kind: "landed",
          baseline: base,
          tree: base,
          files: [],
        });
      } else {
        expect(answer).toMatchObject({ kind: "landing-unavailable" });
        await review.expectText("cannot be reconstructed from today's trunk");
      }
      await review.expectText(
        captured
          ? /empty delivered comparison/
          : /no captured landing comparison/,
      );
      await review.comparison.expectNoSwitch();
      await review.files.expectNone();
      if (!captured) await review.files.expectNoBrowser();
      await review.diffs.expectAbsent();
    },
  );
}

test("a locally kept receipt cannot replace a landing missing from published origin", async ({
  page,
  dashboard,
  origin,
}) => {
  const run = await startReviewRun(dashboard);
  commit(run.established.workspace, "delivered.txt");
  const receipt = captureReviewRun(run, origin);
  retireReviewRun(run, origin, receipt.revision);
  const review = await openCapturedReview(page, origin);
  await review.files.expectChangedFileCount(1);

  git(origin.origin, "update-ref", "refs/heads/main", receipt.base);
  const refreshed = await review.refreshAndAnswer();
  const explanation =
    "The configured origin target does not contain this accepted landing.";
  expect(refreshed.answer).toMatchObject({
    kind: "landing-unavailable",
    explanation,
  });
  await review.expectText(explanation);
  await review.comparison.expectNoSwitch();
  await review.files.expectNoBrowser();
  await review.diffs.expectAbsent();
});
