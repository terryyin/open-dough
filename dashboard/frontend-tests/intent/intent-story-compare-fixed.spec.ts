import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import {
  firstCompletion,
  locationsOf,
  openDoneReading,
  selectSecondStoryInSidebar,
  storyB,
} from "./intent-done-reading-fixture.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
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
const trunkStory = { identity: "SEED-12#trunk", title: "Trunk Mode story" };
const run = makeMe.aReviewRun
  .keyed("captured-landing")
  .launchedAt("2026-11-01T01:00:00Z")
  .comparing(oid("1"), oid("2"))
  .please();

const widenedCompletion = (revision: string) =>
  makeMe.aStoryReview
    .published(revision)
    .adding(branchPath)
    .please({
      from: widenedFrom,
      changes: makeMe.aStoryReview.adding(branchPath).adding(incomingPath),
    });

test("Intent widens a branch at its own pair, preserves whole-story evidence, and opens fixed comparisons at their own pairs", async () => {
  const published = widenedCompletion(doneCompletion);
  if (published.kind !== "published") throw new Error("No branch comparison");
  const captured = makeMe.aStoryReview
    .landed()
    .adding(capturePath)
    .onRun(run)
    .please();
  const trunk = makeMe.aStoryReview
    .published(trunkCompletion)
    .adding(trunkPath)
    .please();
  if (trunk.kind !== "published") throw new Error("No trunk comparison");
  const builds = makeMe.aComparedStory
    .inSummaryScope()
    .withLanded({
      revision: measuredLanded,
      selection: "later",
      laterWithoutResult: 1,
    })
    .please();
  const trunkBuilds = makeMe.aComparedStory
    .ofAnotherStory()
    .withAnswer({
      identity: trunkStory.identity,
      mode: "trunk",
      completion: trunkCompletion,
      branch: {
        kind: "not-applicable",
        explanation: "Trunk Mode has no Branch build.",
      },
    })
    .withLanded({ revision: trunkCompletion })
    .please();
  const mounted = await openDoneStoryComparison({
    otherDone: trunkStory,
    ci: {
      readComparison: (...[, identity]) =>
        Promise.resolve(
          identity === trunkStory.identity ? trunkBuilds.answer : builds.answer,
        ),
    },
    review: ({ identity, run: selectedRun }) =>
      Promise.resolve(
        identity === trunkStory.identity
          ? trunk
          : selectedRun === run.key
            ? captured
            : { ...published, runs: [run] },
      ),
    fileDiff: ({ path, baseline, tree }) => {
      if (path === undefined) throw new Error("A file diff needs a path");
      return Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding(path, `${baseline} to ${tree}`)
          .please(),
      );
    },
  });
  const { selectDoneStory, proofReads, outsideCalls } = mounted;
  const story = intentStoryCompare();

  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).toContain(measuredLanded.slice(0, 7));
  expect(story.noteIn("CI comparison")).toBeNull();

  await story.chooseTab("Changes");
  await expect.element(story.includeMerged).not.toBeChecked();
  await expect
    .poll(story.revisions)
    .toContain(`Baseline ${published.baseline}.`);
  await story.includeMerged.click();
  await expect.poll(story.revisions).toContain(`Baseline ${widenedFrom}.`);
  expect(story.revisions()).toContain(`Completion ${doneCompletion}.`);
  await story.outsideFile(`Added ${incomingPath}`).click();
  await expect
    .poll(story.diffCode)
    .toContain(`${widenedFrom} to ${published.tree}`);

  await story.chooseProof();
  await expect.poll(() => story.proofLabels(doneIdentity)).not.toEqual([]);
  await expect
    .poll(() => story.noteBuild("Proof"))
    .toBe(measuredLanded.slice(0, 7));
  await story.chooseTab("CI comparison");
  await expect
    .poll(() => story.noteBuild("CI comparison"))
    .toBe(measuredLanded.slice(0, 7));
  expect(story.landedEndpoint()).toContain(measuredLanded.slice(0, 7));
  await story.chooseTab("Intent coverage");
  await expect
    .poll(() => story.noteBuild("Intent coverage"))
    .toBe(measuredLanded.slice(0, 7));
  expect(
    proofReads.some(({ subject }) => subject.revision === measuredLanded),
  ).toBe(true);

  await story.chooseTab("Changes");
  await story.choose("Landed runs");
  await expect
    .poll(story.revisions)
    .toContain(`From ${oid("1")} to ${oid("2")}.`);
  await expect.element(story.includeMerged).not.toBeInTheDocument();
  await expect
    .element(story.outsideFile(`Added ${incomingPath}`))
    .not.toBeInTheDocument();
  await story.outsideFile(`Added ${capturePath}`).click();
  await story.choosePurpose();
  await expect.poll(story.diffCode).toContain(`${oid("1")} to ${oid("2")}`);

  await mounted.selectStory(trunkStory.identity, trunkStory.title);
  await story.chooseTab("Changes");
  await expect
    .poll(story.revisions)
    .toContain(`Completion ${trunkCompletion}.`);
  await expect.element(story.includeMerged).not.toBeInTheDocument();
  await expect
    .element(story.outsideFile(`Added ${capturePath}`))
    .not.toBeInTheDocument();
  await story.outsideFile(`Added ${trunkPath}`).click();
  await story.choosePurpose();
  await expect
    .poll(story.diffCode)
    .toContain(`${trunk.baseline} to ${trunk.tree}`);

  await selectDoneStory();
  await story.chooseTab("Changes");
  await expect.element(story.includeMerged).not.toBeChecked();
  await expect
    .poll(story.revisions)
    .toContain(`Baseline ${published.baseline}.`);
  await expect.element(story.outsideFile(`Added ${branchPath}`)).toBeVisible();
  await expect
    .element(story.outsideFile(`Added ${incomingPath}`))
    .not.toBeInTheDocument();
  expect(outsideCalls()).toEqual([]);
});

test("a late branch comparison cannot replace another story's explanation or files", async () => {
  const held = heldRead<StoryReview>();
  let holdBranchRead = false;
  let branchSignal: AbortSignal | undefined;
  const gap = "Published branch history no longer contains this story's start.";
  await openDoneReading({
    withSecondStory: true,
    review: ({ identity }, signal) => {
      if (identity === storyB.identity)
        return Promise.resolve(makeMe.aStoryReview.unavailable(gap).please());
      if (!holdBranchRead)
        return Promise.resolve(widenedCompletion(firstCompletion));
      branchSignal = signal;
      return held.ask();
    },
    readLocations: () => Promise.resolve(locationsOf("dashboard/tests")),
    readFile: () => Promise.resolve(""),
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await story.includeMerged.click();
  await expect
    .element(story.outsideFile(`Added ${incomingPath}`))
    .toBeVisible();
  holdBranchRead = true;
  await story.refresh();
  await expect.poll(held.asked).toBe(true);

  await selectSecondStoryInSidebar();
  await story.chooseTab("Changes");
  await expect.poll(story.headerText).toContain(gap);
  await expect.element(story.includeMerged).not.toBeInTheDocument();
  expect(branchSignal?.aborted).toBe(true);

  const latePath = "dashboard/src/late.ts";
  held.resolve(
    makeMe.aStoryReview.published(firstCompletion).adding(latePath).please(),
  );
  await held.ask();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(story.headerText()).toContain(gap);
  await expect
    .element(story.outsideFile(`Added ${latePath}`))
    .not.toBeInTheDocument();
  await expect
    .element(story.outsideFile(`Added ${incomingPath}`))
    .not.toBeInTheDocument();
});
