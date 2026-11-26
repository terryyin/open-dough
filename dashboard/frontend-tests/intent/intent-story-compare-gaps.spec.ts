// A comparison chosen in Intent's Compare that cannot be read is explained
// where the header explains the story's comparison, never as a story without
// changes, while the other choices stay offered; a failed read offers Retry,
// which reads it again. The case's review answers own the Git judgment.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";

const unreadable = "The chosen changes could not be read.";

const run = makeMe.aReviewRun
  .keyed("capture-chosen-run")
  .launchedAt("2026-01-02T12:00:00.000Z")
  .comparing("3".repeat(40), "4".repeat(40))
  .please();
// The Done story's default: its published completion, offering one run.
const offeringRun = () => ({ ...publishedCompletion(), runs: [run] });

test("a Done story's landed run whose objects are missing is explained, and Published completion stays offered", async () => {
  const runGap: StoryReview = makeMe.aStoryReview
    .unavailable("The landed run's objects are missing from this machine.")
    .please();
  const { outsideCalls } = await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(query.run === run.key ? runGap : offeringRun()),
  });
  const story = intentStoryCompare();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  await expect.element(story.filesToggle).toBeVisible();

  // Landed runs is explained, not as a story without changes.
  await story.chooseLatestLanding();
  await expect.poll(story.alertText).toBe(unreadable);
  await expect
    .poll(story.headerText)
    .toContain("The landed run's objects are missing from this machine.");
  expect(story.headerText()).not.toContain("No comparison is available");
  await expect.element(story.filesToggle).not.toBeInTheDocument();
  await expect.element(story.runChoice(run.key)).toBeChecked();

  // CI comparison and Intent coverage say they describe the whole story at
  // the measured build.
  for (const name of ["CI comparison", "Intent coverage"] as const) {
    await story.chooseTab(name);
    await expect
      .poll(() => story.noteIn(name))
      .toContain("Describes the whole story");
    await expect
      .poll(() => story.noteBuild(name))
      .toBe(doneCompletion.slice(0, 7));
  }

  // Published completion again names the completion.
  await story.choose("Published completion");
  await expect.element(story.alert).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  await expect.element(story.filesToggle).toBeVisible();
  expect(outsideCalls()).toEqual([]);
});

test("a failed read of a chosen landed run offers Retry, which reads that run again", async () => {
  let runAsks = 0;
  const { outsideCalls } = await openDoneStoryComparison({
    review: (query) => {
      if (query.run !== run.key) return Promise.resolve(offeringRun());
      runAsks += 1;
      return runAsks === 1
        ? Promise.reject(new Error("The run read was refused."))
        : Promise.resolve(
            makeMe.aStoryReview
              .landed()
              .adding("chosen.txt")
              .onRun(run, [run])
              .please(),
          );
    },
  });
  const story = intentStoryCompare();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));

  // Landed runs whose read fails explains the failure.
  await story.chooseLatestLanding();
  await expect.poll(story.alertText).toContain(unreadable);
  await expect
    .poll(story.headerText)
    .toContain("The review could not be read:");

  // Retry reads that run again and lists its changes.
  const asked = runAsks;
  await story.retry();
  await expect.poll(story.treeText).toContain("chosen.txt");
  await expect.element(story.alert).not.toBeInTheDocument();
  expect(runAsks).toBeGreaterThan(asked);
  expect(outsideCalls()).toEqual([]);
});

test("a captured run with no end build keeps the measured baseline and can check again in place", async () => {
  const { baseline } = makeMe.aComparedStory.please().answer;
  if (baseline.kind !== "build")
    throw new Error("Arrange a measured baseline.");
  const gap = "No completed CI build includes the selected changes.";
  const selection = makeMe.aStoryCiComparisonSlot
    .with({ kind: "none", explanation: gap })
    .please();
  let asks = 0;
  await openDoneStoryComparison({
    ci: {
      readSelectedComparison: (source, identity, range) => {
        asks += 1;
        return Promise.resolve(
          makeMe.aSelectedCiComparison
            .with({
              source: source.id,
              identity,
              range,
              baseline,
              selection,
            })
            .please(),
        );
      },
    },
    review: (query) =>
      Promise.resolve(
        query.run === run.key
          ? makeMe.aStoryReview
              .landed()
              .adding("chosen.txt")
              .onRun(run)
              .please()
          : offeringRun(),
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await story.chooseLatestLanding();
  const endpoints = page.getByRole("table", {
    name: "Baseline and selection CI builds with timing",
  });
  await expect.element(endpoints.getByText(gap)).toBeVisible();
  await expect
    .element(endpoints.getByText(baseline.revision.slice(0, 7)))
    .toBeVisible();
  await activateComparisonControl(
    page.getByRole("button", { name: "Check again" }),
  );
  await expect.poll(() => asks).toBe(2);
  await expect.element(endpoints.getByText(gap)).toBeVisible();
  await expect.element(story.runChoice(run.key)).toBeChecked();
});
