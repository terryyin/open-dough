import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const oid = (digit: string) => digit.repeat(40);
const branchPath = "dashboard/src/branch.ts";
const incomingPath = "dashboard/src/incoming.ts";
const capturePath = "dashboard/src/captured.ts";
const trunkPath = "dashboard/src/trunk.ts";
const widenedFrom = oid("8");
const measuredLanded = oid("9");
const trunkCompletion = oid("7");
const captureFrom = oid("1");
const captureTree = oid("2");
const trunkStory = { identity: "SEED-12#trunk", title: "Trunk Mode story" };
const run = makeMe.aReviewRun
  .keyed("captured-landing")
  .launchedAt("2026-11-01T01:00:00Z")
  .comparing(captureFrom, captureTree)
  .please();

const widenedCompletion = (revision: string) =>
  makeMe.aStoryReview
    .published(revision)
    .adding(branchPath)
    .please({
      from: widenedFrom,
      changes: makeMe.aStoryReview.adding(branchPath).adding(incomingPath),
    });

function recordDiffRead() {
  let query: Parameters<ReviewSource["fileDiff"]>[0] | undefined;
  const fileDiff: ReviewSource["fileDiff"] = (requested) => {
    query = requested;
    return unanswered();
  };
  return { fileDiff, requestedDiff: () => query };
}

test("including merged changes leaves CI comparison and file Proof at the measured landed build", async () => {
  const builds = makeMe.aComparedStory
    .inSummaryScope()
    .withLanded({
      revision: measuredLanded,
      selection: "later",
      laterWithoutResult: 1,
    })
    .please();
  const { proofReads, outsideCalls } = await openDoneStoryComparison({
    ci: { readComparison: () => Promise.resolve(builds.answer) },
    review: () => Promise.resolve(widenedCompletion(doneCompletion)),
  });
  const story = intentStoryCompare();
  const measured = measuredLanded.slice(0, 7);

  await story.chooseTab("Changes");
  await activateComparisonControl(story.includeMerged);
  await activateComparisonControl(story.file(`Added ${incomingPath}`));
  await story.chooseProof();

  await comparisonRead(() => story.proofLabels(doneIdentity)).not.toEqual([]);
  await comparisonRead(() => story.noteBuild("Proof")).toBe(measured);
  expect(story.noteBuild("CI comparison")).toBe(measured);
  expect(story.noteBuild("Intent coverage")).toBe(measured);
  expect(story.landedEndpoint()).toContain(measured);
  expect(
    proofReads.some(({ subject }) => subject.revision === measuredLanded),
  ).toBe(true);
  expect(outsideCalls()).toEqual([]);
});

test("a captured landed run reads its own diff pair after a branch comparison includes merged changes", async () => {
  const published = { ...widenedCompletion(doneCompletion), runs: [run] };
  const captured = makeMe.aStoryReview
    .landed()
    .adding(capturePath)
    .onRun(run)
    .please();
  const { fileDiff, requestedDiff } = recordDiffRead();
  await openDoneStoryComparison({
    ci: { readComparison: unanswered },
    review: ({ run: selectedRun }) =>
      Promise.resolve(selectedRun === run.key ? captured : published),
    fileDiff,
  });
  const story = intentStoryCompare();

  await story.chooseTab("Changes");
  await activateComparisonControl(story.includeMerged);
  await comparisonRead(story.revisions).toContain(`Baseline ${widenedFrom}.`);
  await story.chooseLatestLanding();
  await activateComparisonControl(story.file(`Added ${capturePath}`));

  await comparisonRead(requestedDiff).toMatchObject({
    path: capturePath,
    baseline: captureFrom,
    tree: captureTree,
  });
  expect(story.revisions()).toContain(`From ${captureFrom} to ${captureTree}.`);
  expect(story.includeMerged.query()).toBeNull();
  expect(story.file(`Added ${incomingPath}`).query()).toBeNull();
});

test("changing stories clears the widened choice and gives Trunk Mode its own fixed diff pair", async () => {
  const trunk = makeMe.aStoryReview
    .published(trunkCompletion)
    .adding(trunkPath)
    .please();
  if (trunk.kind !== "published") throw new Error("No trunk comparison");
  const { fileDiff, requestedDiff } = recordDiffRead();
  const mounted = await openDoneStoryComparison({
    ci: { readComparison: unanswered },
    otherDone: trunkStory,
    review: ({ identity }) =>
      Promise.resolve(
        identity === trunkStory.identity
          ? trunk
          : widenedCompletion(doneCompletion),
      ),
    fileDiff,
  });
  const story = intentStoryCompare();

  await story.chooseTab("Changes");
  await activateComparisonControl(story.includeMerged);
  await comparisonRead(story.revisions).toContain(`Baseline ${widenedFrom}.`);
  await mounted.selectStory(trunkStory.identity);
  await story.chooseTab("Changes");
  await activateComparisonControl(story.file(`Added ${trunkPath}`));

  await comparisonRead(requestedDiff).toMatchObject({
    path: trunkPath,
    baseline: trunk.baseline,
    tree: trunk.tree,
  });
  expect(story.includeMerged.query()).toBeNull();
  expect(story.revisions()).toContain(`Completion ${trunkCompletion}.`);
  expect(story.file(`Added ${incomingPath}`).query()).toBeNull();

  await mounted.selectDoneStory();
  await story.chooseTab("Changes");
  await expect.element(story.file(`Added ${branchPath}`)).toBeVisible();
  expect(story.file(`Added ${incomingPath}`).query()).toBeNull();
  expect((story.includeMerged.element() as HTMLInputElement).checked).toBe(
    false,
  );
});

test("a late branch comparison cannot replace another story's explanation or files", async () => {
  const held = heldRead<StoryReview>();
  let holdBranchRead = false;
  let branchSignal: AbortSignal | undefined;
  const gap = "Published branch history no longer contains this story's start.";
  const mounted = await openDoneStoryComparison({
    ci: { readComparison: unanswered },
    otherDone: trunkStory,
    review: ({ identity }, signal) => {
      if (identity === trunkStory.identity)
        return Promise.resolve(makeMe.aStoryReview.unavailable(gap).please());
      if (!holdBranchRead)
        return Promise.resolve(widenedCompletion(doneCompletion));
      branchSignal = signal;
      return held.ask();
    },
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await activateComparisonControl(story.includeMerged);
  await expect.element(story.file(`Added ${incomingPath}`)).toBeVisible();
  holdBranchRead = true;
  await activateComparisonControl(story.refreshButton);
  await comparisonRead(held.asked).toBe(true);

  await mounted.selectStory(trunkStory.identity);
  await story.chooseTab("Changes");
  await comparisonRead(story.headerText).toContain(gap);
  await expect.element(story.includeMerged).not.toBeInTheDocument();
  expect(branchSignal?.aborted).toBe(true);

  const latePath = "dashboard/src/late.ts";
  held.resolve(
    makeMe.aStoryReview.published(doneCompletion).adding(latePath).please(),
  );
  await held.ask();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(story.headerText()).toContain(gap);
  await expect.element(story.file(`Added ${latePath}`)).not.toBeInTheDocument();
  await expect
    .element(story.file(`Added ${incomingPath}`))
    .not.toBeInTheDocument();
});
