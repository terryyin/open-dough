import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PageReads } from "../../src/pageReads.tsx";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import type { StoryReviewResult } from "../../src/storyReviewResult.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import { locationHeader } from "./intent-scope-tree-page.ts";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const guide = "guide.txt";
const changed = "product/changed.txt";
const publishedTest = "checks/current.spec.ts";
const capturedTest = "previous/old.spec.ts";
const capturedRevision = "e".repeat(40);
const run = makeMe.aReviewRun
  .keyed("captured")
  .comparing("d".repeat(40), capturedRevision)
  .please();
const publishedCompletion = () =>
  makeMe.aStoryReview.published(doneCompletion).adding(changed).please();

function inventory(revision: string, root: string, file: string) {
  return {
    kind: "inventory",
    revision,
    paths: [guide, file],
    locations: [
      makeMe.anIntentLocation
        .at(root)
        .ofKind("typescript", ["**/*.spec.ts"])
        .selecting(file)
        .please(),
    ],
  } satisfies StoryReviewResult;
}

const publishedInventory = inventory(doneCompletion, "checks", publishedTest);
const capturedInventory = inventory(capturedRevision, "previous", capturedTest);
const guideText = (revision: string, text: string): StoryReviewResult => ({
  kind: "text",
  revision,
  path: guide,
  text,
});

type HeldReply = (signal: AbortSignal) => Promise<StoryReviewResult>;
type Reply = StoryReviewResult | HeldReply;
type Result = {
  readonly inventory: Reply;
  readonly files?: Readonly<Record<string, Reply>>;
};

function resultReads(...answers: [string, Result][]): PageReads["storyResult"] {
  const results = new Map(answers);
  return async ({ completion, reference, path }, signal) => {
    const result = results.get(reference ?? completion ?? "");
    const reply =
      path === undefined ? result?.inventory : result?.files?.[path];
    if (reply === undefined)
      throw new Error(
        `Unexpected result read for ${reference ?? completion}: ${path ?? "inventory"}`,
      );
    return typeof reply === "function" ? reply(signal) : reply;
  };
}

function heldResult() {
  const held = heldRead<StoryReviewResult>();
  let request: AbortSignal | undefined;
  return {
    read: (signal: AbortSignal) => {
      request = signal;
      return held.ask();
    },
    async release(answer: StoryReviewResult) {
      expect(request?.aborted).toBe(true);
      held.resolve(answer);
      await held.ask();
    },
    requested: held.asked,
  };
}

async function openResults(
  published: Result,
  captured: Result,
  landing: StoryReview = makeMe.aStoryReview.landed().onRun(run).please(),
) {
  if (landing.kind !== "landed") throw new Error("Expected a captured landing");
  const completion = { ...publishedCompletion(), runs: [run] };
  await openDoneStoryComparison({
    ci: { readComparison: unanswered },
    review: ({ run: selected }) =>
      Promise.resolve(selected === run.key ? landing : completion),
    storyResult: resultReads(
      [doneCompletion, published],
      [landing.landing.reference, captured],
    ),
  });
  return intentStoryCompare();
}

test("switching comparisons changes the inventory, settings and file's exact revision while an earlier text read is held", async () => {
  const oldText = heldResult();
  const story = await openResults(
    { inventory: publishedInventory, files: { [guide]: oldText.read } },
    {
      inventory: capturedInventory,
      files: { [guide]: guideText(capturedRevision, "captured guide") },
    },
  );

  await activateComparisonControl(story.changesOnly);
  await activateComparisonControl(story.folderToggle("checks", false));
  await expect
    .element(story.file(publishedTest), { interval: 5 })
    .toBeVisible();
  expect(locationHeader("checks")).toHaveAttribute(
    "data-intent-folder-cue",
    "root",
  );
  await activateComparisonControl(story.file(guide));
  await comparisonRead(oldText.requested).toBe(true);

  await story.chooseRun(run.key);
  await activateComparisonControl(story.folderToggle("previous", false));
  await expect.element(story.file(capturedTest), { interval: 5 }).toBeVisible();
  expect(locationHeader("previous")).toHaveAttribute(
    "data-intent-folder-cue",
    "root",
  );
  expect(story.folder("checks").query()).toBeNull();
  const reading = intentFileReading(guide);
  await comparisonRead(story.readingText).toContain("captured guide");
  await reading.isAt(capturedRevision);

  await oldText.release(guideText(doneCompletion, "late current guide"));
  await reading.shows("captured guide");
  await reading.isAt(capturedRevision);
});

test("a late inventory from the prior comparison cannot replace a captured run's tree", async () => {
  const oldInventory = heldResult();
  const story = await openResults(
    { inventory: oldInventory.read },
    { inventory: capturedInventory },
  );
  await activateComparisonControl(story.changesOnly);
  await comparisonRead(oldInventory.requested).toBe(true);

  await story.chooseRun(run.key);
  await activateComparisonControl(story.folderToggle("previous", false));
  await expect.element(story.file(capturedTest), { interval: 5 }).toBeVisible();
  await oldInventory.release(publishedInventory);
  expect(story.folder("checks").query()).toBeNull();
  await expect.element(story.file(capturedTest)).toBeVisible();
});

test("an inventory failure keeps the changed diff available while Retry restores unchanged paths", async () => {
  const readInventory = vi
    .fn<HeldReply>()
    .mockResolvedValueOnce({
      kind: "unavailable",
      revision: doneCompletion,
      explanation: "The tree listing failed.",
    })
    .mockResolvedValue({
      kind: "inventory",
      revision: doneCompletion,
      paths: [guide, changed],
      locations: null,
    });
  await openDoneStoryComparison({
    ci: { readComparison: unanswered },
    review: () => Promise.resolve(publishedCompletion()),
    storyResult: resultReads([
      doneCompletion,
      {
        inventory: readInventory,
        files: { [guide]: guideText(doneCompletion, "same guide") },
      },
    ]),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding(changed, "changed despite failure")
          .please(),
      ),
  });
  const story = intentStoryCompare();
  await activateComparisonControl(story.changesOnly);
  const failure = story.sidebar.getByRole("alert").filter({
    hasText: "Repository inventory could not be read",
  });
  await comparisonRead(() => failure.query()?.textContent).toContain(
    "The tree listing failed.",
  );
  await activateComparisonControl(story.file(`Added ${changed}`));
  await comparisonRead(story.diffCode).toContain("changed despite failure");

  await activateComparisonControl(
    failure.getByRole("button", { name: "Retry" }),
  );
  await activateComparisonControl(story.file(guide));
  const reading = intentFileReading(guide);
  await comparisonRead(story.readingText).toContain("same guide");
  await reading.isAt(doneCompletion);
  expect(readInventory).toHaveBeenCalledTimes(2);
});

test("with Changes only on, choosing a landed run lists that run's changed paths and keeps Changes only", async () => {
  const story = await openResults(
    { inventory: publishedInventory },
    { inventory: capturedInventory },
    makeMe.aStoryReview.landed().onRun(run).modifying(capturedTest).please(),
  );
  await expect
    .element(story.file(`Added ${changed}`), { interval: 5 })
    .toBeVisible();
  await expect.element(story.changesOnly).toBeChecked();

  await story.chooseRun(run.key);
  await expect
    .element(story.file(`Modified ${capturedTest}`), { interval: 5 })
    .toBeVisible();
  await expect.element(story.changesOnly).toBeChecked();
  expect(story.file(`Added ${changed}`).query()).toBeNull();
  expect(story.file(guide).query()).toBeNull();
});
