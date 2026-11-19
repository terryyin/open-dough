// A Done story with two captured runs opens on the newer run's diff: the
// picker and run facts wait behind the eye; choosing the older run updates
// the details and the diff together, survives Refresh, and Escape returns
// focus to the eye.
import { test } from "../../test-support/support/frontendApp.ts";
import { doneCard } from "../../test-support/doneStoryReviewPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { openReviewChanges } from "../../test-support/reviewChangesPage.ts";

const ids = frontendReviewIds;
const older = {
  key: "capture-older-run",
  name: "first",
  launchedAt: "2026-01-01T10:00:00.000Z",
  base: ids.baseline,
  revision: ids.tree,
} as const;
const newer = {
  key: "capture-newer-run",
  name: "second",
  launchedAt: "2026-01-02T12:00:00.000Z",
  base: ids.head,
  revision: ids.commit,
} as const;

const runChoice = (run: typeof older | typeof newer) => ({
  key: run.key,
  workflow: "refinement" as const,
  launchedAt: run.launchedAt,
  remote: "origin",
  target: "refs/heads/main",
  comparison: { base: run.base, revision: run.revision },
});

const runs = [runChoice(newer), runChoice(older)];

const landedOf = (run: typeof older | typeof newer): StoryReview => ({
  kind: "landed",
  baseline: run.base,
  tree: run.revision,
  files: [
    {
      kind: "added",
      path: `${run.name}.txt`,
      lines: { added: 1, removed: 0 },
    },
  ],
  landing: landedReviewContextSchema.parse({
    ...makeMe.aLaunchLanding
      .comparing({ base: run.base, revision: run.revision })
      .please(),
    workflow: "refinement",
    launchedAt: run.launchedAt,
  }),
  runs,
  selectedRun: run.key,
});

test("a Done story opens on the newer of two captured runs and Escape from the picker returns to the eye", async ({
  page,
  frontendServices,
}) => {
  const answers = await installFrontendStoryReview(page, landedOf(newer));
  answers.answerRunSnapshot(older.key, landedOf(older));
  answers.answerFile(
    frontendFileDiff(`${newer.name}.txt`, [`+${newer.name}.txt`]),
    `${newer.name}.txt`,
  );
  answers.answerFile(
    frontendFileDiff(`${older.name}.txt`, [`+${older.name}.txt`]),
    `${older.name}.txt`,
  );
  await openFrontendBoardReview(page, frontendServices);
  const review = await openReviewChanges(page, doneCard(page, storyA.title));
  const { details, diffs } = review;

  // Compact opening: Landed runs, files toggle, newest file and first diff;
  // picker and run facts wait behind the eye.
  await review.expectComparisonNamed("Landed runs");
  await review.expectFilesToggleNamed("Hide files");
  await diffs.expectShows(`Added ${newer.name}.txt`, `+${newer.name}.txt`);
  await review.details.expectCollapsed();
  await details.expectNoCodeShown(newer.revision);

  await details.reveal();
  await review.landedRun.expectChosen(newer.key);
  await review.comparison.expectChosen("Landed runs");
  for (const run of [newer, older]) {
    await review.landedRun.choose(run.key);
    await review.landedRun.expectChosen(run.key);
    await review.expectComparisonNamed("Landed runs");
    await review.details.expectRevealed();
    await details.expectText("Refinement launched");
    await details.expectTime(run.launchedAt);
    await details.expectText("origin/main");
    await details.expectText(`From ${run.base} to ${run.revision}.`);
    await diffs.expectShows(`Added ${run.name}.txt`, `+${run.name}.txt`);
  }

  // The revealed state and the older run last across Refresh.
  await review.status.refreshAndRead();
  await review.details.expectRevealed();
  await review.landedRun.expectChosen(older.key);

  await details.escapeFromLandedRuns();
  await diffs.expectShows(`Added ${older.name}.txt`);
});
