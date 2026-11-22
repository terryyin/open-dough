// A Done story with two captured runs opens on the newer run's diff: the
// picker and run facts wait behind the eye; choosing the older run updates
// the details and the diff together, survives Refresh, and Escape returns
// focus to the eye.
import { test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  doneStory,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

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

// Answers the newer run unless the read names the older one.
const capturedRuns = reviewSourceAnswering({
  review: (query) =>
    Promise.resolve(landedOn(query.run === older.run.key ? older : newer)),
  fileDiff: (query) => {
    const { name } = query.path === `${older.name}.txt` ? older : newer;
    return Promise.resolve(
      makeMe.aReviewedFileDiff.adding(`${name}.txt`, `${name}.txt`).please(),
    );
  },
});

test("a Done story opens on the newer of two captured runs and Escape from the picker returns to the eye", async () => {
  const review = await mountReviewChanges(capturedRuns, doneStory, {
    completed: true,
  });

  // Compact opening: Landed runs, files toggle, newest file and first diff;
  // picker and run facts wait behind the eye.
  await review.expectComparisonNamed("Landed runs");
  await review.expectFilesToggleNamed("Hide files");
  await review.expectDiffShows(`Added ${newer.name}.txt`, `+${newer.name}.txt`);
  await review.expectDetailsCollapsed();
  await review.expectNoCodeShown(oid("4"));

  await review.revealDetails();
  await review.expectLandedRunChosen(newer.run.key);
  await review.expectComparisonChosen("Landed runs");
  for (const { name, run } of [newer, older]) {
    await review.chooseLandedRun(run.key);
    await review.expectLandedRunChosen(run.key);
    await review.expectComparisonNamed("Landed runs");
    await review.expectDetailsRevealed();
    await review.expectDetailsSay("Refinement launched");
    await review.expectDetailsTime(run.launchedAt);
    await review.expectDetailsSay("origin/main");
    const { base, revision } = run.comparison ?? {};
    await review.expectDetailsSay(`From ${base} to ${revision}.`);
    await review.expectDiffShows(`Added ${name}.txt`, `+${name}.txt`);
  }

  // The revealed state and the older run last across Refresh.
  await review.refresh();
  await review.expectFeedbackSays("Review refreshed");
  await review.expectDetailsRevealed();
  await review.expectLandedRunChosen(older.run.key);

  await review.escapeFromLandedRuns();
  await review.expectDiffShows(`Added ${older.name}.txt`, `+${older.name}.txt`);
});
