// A Done story with two captured runs opens on the newer run's diff: the
// picker and run facts wait behind the eye; choosing the older run updates
// the details and the diff together, survives Refresh, and Escape returns
// focus to the eye.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { reviewChanges } from "../../tests/storyCardControls.ts";
import { doneCard } from "../../tests/doneStoryReviewPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { landedReviewContextSchema } from "../../src/storyReviewLandedRun.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  installFrontendStoryReview,
} from "../../tests/support/frontendStoryReview.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import {
  expectShown,
  filesToggle,
  landedRunChoice,
  reviewRegion,
  toolbarComparison,
} from "../../tests/support/reviewControls.ts";
import {
  escapeDetailsFrom,
  expectDetailsCollapsed,
  expectDetailsRevealed,
  revealDetails,
} from "../../tests/support/reviewDetails.ts";
import { refreshAndRead } from "../../tests/support/reviewRead.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";

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
  await reviewChanges(doneCard(page, storyA.title)).click();
  const review = reviewRegion(page);

  // Compact opening: Landed runs, files toggle, newest file and first diff;
  // picker and run facts wait behind the eye.
  await expect(toolbarComparison(review)).toHaveText("Landed runs");
  await expect(filesToggle(review)).toBeVisible();
  await expect(fileDiff(review, `Added ${newer.name}.txt`)).toContainText(
    `+${newer.name}.txt`,
  );
  await expectDetailsCollapsed(review);
  await expect(landedRunChoice(review)).toHaveCount(0);
  await expect(
    review.locator("code", { hasText: newer.revision }),
  ).toBeHidden();

  const details = await revealDetails(review);
  const picker = landedRunChoice(review);
  await expect(picker).toHaveValue(newer.key);
  await expectShown(review, "Landed runs");
  for (const run of [newer, older]) {
    await picker.selectOption(run.key);
    await expect(picker).toHaveValue(run.key);
    await expect(toolbarComparison(review)).toHaveText("Landed runs");
    await expectDetailsRevealed(review);
    await expect(details).toContainText("Refinement launched");
    await expect(details.locator("time")).toHaveAttribute(
      "datetime",
      run.launchedAt,
    );
    await expect(details).toContainText("origin/main");
    await expect(details).toContainText(`From ${run.base} to ${run.revision}.`);
    await expect(fileDiff(review, `Added ${run.name}.txt`)).toContainText(
      `+${run.name}.txt`,
    );
  }

  // The revealed state and the older run last across Refresh.
  await refreshAndRead(review);
  await expectDetailsRevealed(review);
  await expect(picker).toHaveValue(older.key);

  await escapeDetailsFrom(review, picker);
  await expect(fileDiff(review, `Added ${older.name}.txt`)).toBeVisible();
});
