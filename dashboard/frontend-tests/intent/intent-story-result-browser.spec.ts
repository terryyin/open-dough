import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReviewResult } from "../../src/storyReviewResult.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const guide = "docs/guide.md";
const currentTest = "checks/current.spec.ts";
const capturedTest = "previous/old.spec.ts";
const capturedRevision = "e".repeat(40);
const run = makeMe.aReviewRun
  .keyed("captured")
  .comparing("d".repeat(40), capturedRevision)
  .please();
const captured = makeMe.aStoryReview.landed().onRun(run, [run]).please();

const listed = (path: string) => {
  const root = path.split("/")[0] ?? "";
  return makeMe.anIntentLocation
    .at(root)
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(path)
    .please();
};

test("switching comparisons changes the inventory, settings and file's exact revision while an earlier text read is held", async () => {
  const oldText = heldRead<StoryReviewResult>();
  await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.run === run.key
          ? captured
          : { ...publishedCompletion(), runs: [run] },
      ),
    storyResult: (query) => {
      const revision =
        query.reference === undefined ? doneCompletion : capturedRevision;
      const path = revision === doneCompletion ? currentTest : capturedTest;
      if (query.path !== undefined) {
        if (revision === doneCompletion) return oldText.ask();
        return Promise.resolve({
          kind: "text",
          revision,
          path: query.path,
          text: "captured guide",
        });
      }
      return Promise.resolve({
        kind: "inventory",
        revision,
        paths: [guide, path],
        locations: [listed(path)],
      });
    },
  });
  const story = intentStoryCompare();
  await story.expandFolderPath("checks");
  await expect.element(story.file(currentTest)).toBeVisible();
  await story.expandFolderPath("docs");
  await story.file(guide).click();
  await expect.poll(oldText.asked).toBe(true);
  await story.chooseLatestLanding();
  await story.expandFolderPath("previous");
  await expect.element(story.file(capturedTest)).toBeVisible();
  await expect.element(story.file(currentTest)).not.toBeInTheDocument();
  const reading = intentFileReading(guide);
  await reading.shows("captured guide");
  await reading.isAt(capturedRevision);

  oldText.resolve({
    kind: "text",
    path: guide,
    revision: doneCompletion,
    text: "late current guide",
  });
  await reading.shows("captured guide");
  await reading.isAt(capturedRevision);
});

test("a late inventory from the prior comparison cannot replace a captured run's tree", async () => {
  const oldInventory = heldRead<StoryReviewResult>();
  await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.run === run.key
          ? captured
          : { ...publishedCompletion(), runs: [run] },
      ),
    storyResult: (query) =>
      query.reference === undefined
        ? oldInventory.ask()
        : Promise.resolve({
            kind: "inventory",
            revision: capturedRevision,
            paths: [capturedTest],
            locations: [listed(capturedTest)],
          }),
  });
  const story = intentStoryCompare();
  await expect.poll(oldInventory.asked).toBe(true);
  await story.chooseLatestLanding();
  await story.expandFolderPath("previous");
  await expect.element(story.file(capturedTest)).toBeVisible();
  oldInventory.resolve({
    kind: "inventory",
    revision: doneCompletion,
    paths: [currentTest],
    locations: [listed(currentTest)],
  });
  await expect.element(story.file(currentTest)).not.toBeInTheDocument();
  await expect.element(story.file(capturedTest)).toBeVisible();
});

test("an inventory failure keeps the changed diff available while Retry restores unchanged paths", async () => {
  const changed = "dashboard/tests/folder/a.spec.ts";
  let attempts = 0;
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
    storyResult: (query) => {
      if (query.path !== undefined)
        return Promise.resolve({
          kind: "text",
          revision: doneCompletion,
          path: query.path,
          text: "same guide",
        });
      attempts += 1;
      return Promise.resolve(
        attempts === 1
          ? {
              kind: "unavailable",
              revision: doneCompletion,
              explanation: "The tree listing failed.",
            }
          : {
              kind: "inventory",
              revision: doneCompletion,
              paths: [guide, changed],
              locations: null,
            },
      );
    },
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding(changed, "changed despite failure")
          .please(),
      ),
  });
  const story = intentStoryCompare();
  const failure = story.sidebar
    .getByRole("alert")
    .filter({ hasText: "Repository inventory could not be read" });
  await expect
    .poll(() => failure.query()?.textContent)
    .toContain("The tree listing failed.");
  await story.file(`Added ${changed}`).click();
  await expect.poll(story.diffCode).toContain("changed despite failure");
  await failure.getByRole("button", { name: "Retry" }).click();
  await story.expandFolderPath("docs");
  await story.file(guide).click();
  await intentFileReading(guide).shows("same guide");
  await intentFileReading(guide).isAt(doneCompletion);
  expect(attempts).toBe(2);
});
