// A comparison chosen in Intent's Compare that cannot be read is explained
// where the header explains the story's comparison, never as a story without
// changes, while the other choices stay offered; a failed read offers Retry,
// which reads it again. The case's review answers own the Git judgment.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  doneCompletion,
  intentStoryCompare,
  openDoneStoryComparison,
  openStoryAComparison,
  publishedCompletion,
  doneOutsideKinds,
  outsideKinds,
  recordOutsideReads,
} from "./intent-story-compare-page.ts";

const [first, second] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
];
const missing = "The story's commit objects are missing from this machine.";
const unreadable = "The chosen changes could not be read.";
const wholeStory = "Describes the whole story, not the chosen comparison.";
const unread = () => new Promise<never>(() => undefined);
const takenOnCommits = () =>
  Promise.resolve(
    makeMe.aStoryReview
      .modifying("dashboard/tests/a.spec.ts")
      .adding("dashboard/tests/boundary/b.spec.ts")
      .onCommits(second, first)
      .please(),
  );

test("an unavailable commit range is explained in the header, not as a story without changes, and All changes stays offered", async () => {
  await openStoryAComparison({
    review: takenOnCommits,
    range: () => Promise.resolve({ kind: "unavailable", explanation: missing }),
    fileDiff: unread,
    fileText: unread,
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");

  // Commits is explained without Retry, not as a story without changes.
  await story.choose("Commits");
  await expect.poll(story.alertText).toBe(unreadable);
  await expect.element(story.retryControl).not.toBeInTheDocument();
  await expect.poll(story.headerText).toContain(missing);
  expect(story.headerText()).not.toContain("No comparison is available");

  // CI comparison and Intent coverage say they describe the whole story.
  for (const name of ["CI comparison", "Intent coverage"] as const) {
    await story.chooseTab(name);
    await expect
      .poll(() => story.wholeStoryNote(name).query()?.textContent)
      .toBe(wholeStory);
  }
  await story.chooseTab("Changes");

  // All changes again compares the story.
  await story.choose("All changes");
  await expect.element(story.alert).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain("Compared");
});

test("a failed read of a chosen commit range offers Retry, which reads it again", async () => {
  let rangeAsks = 0;
  await openStoryAComparison({
    review: takenOnCommits,
    range: () => {
      rangeAsks += 1;
      return rangeAsks === 1
        ? Promise.reject(new Error("The range read was refused."))
        : Promise.resolve({
            ...makeMe.aStoryReview
              .modifying("dashboard/tests/a.spec.ts")
              .pleaseRange(),
            from: first.fromTree,
            tree: second.tree,
          });
    },
    fileDiff: unread,
    fileText: unread,
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");

  // Commits whose read fails explains the failure.
  await story.choose("Commits");
  await expect.poll(story.alertText).toContain(unreadable);
  await expect
    .poll(story.headerText)
    .toContain("The chosen commits could not be read:");

  // Retry reads the range again and shows it.
  const asked = rangeAsks;
  await story.retry();
  await expect.poll(story.range).toContain("second change");
  await expect.element(story.alert).not.toBeInTheDocument();
  expect(rangeAsks).toBeGreaterThan(asked);
});

const run = makeMe.aReviewRun
  .keyed("capture-chosen-run")
  .launchedAt("2026-01-02T12:00:00.000Z")
  .comparing("3".repeat(40), "4".repeat(40))
  .please();
// The Done story's default: its published completion, offering one run.
const offeringRun = () => ({ ...publishedCompletion(), runs: [run] });

test("a Done story's landed run whose objects are missing is explained, and Published completion stays offered", async () => {
  const outside = recordOutsideReads();
  const runGap: StoryReview = makeMe.aStoryReview
    .unavailable("The landed run's objects are missing from this machine.")
    .please();
  await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(query.run === run.key ? runGap : offeringRun()),
    range: unread,
    fileDiff: unread,
    fileText: unread,
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));

  // Landed runs is explained, not as a story without changes.
  await story.choose("Landed runs");
  await expect.poll(story.alertText).toBe(unreadable);
  await expect
    .poll(story.headerText)
    .toContain("The landed run's objects are missing from this machine.");
  expect(story.headerText()).not.toContain("No comparison is available");

  // CI comparison and Intent coverage say they describe the whole story at
  // the measured build.
  for (const name of ["CI comparison", "Intent coverage"] as const) {
    await story.chooseTab(name);
    const note = story.wholeStoryNote(name);
    await expect
      .poll(() => note.query()?.textContent)
      .toContain("Describes the whole story");
    await expect
      .poll(() => note.query()?.querySelector("code")?.textContent)
      .toBe(doneCompletion.slice(0, 7));
  }
  await story.chooseTab("Changes");

  // Published completion again names the completion.
  await story.choose("Published completion");
  await expect.element(story.alert).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));
  // Plan 764 slices 1 (story notes) and 4 (done wall-time history) make this [].
  expect(outsideKinds(outside)).toEqual(doneOutsideKinds);
});

test("a failed read of a chosen landed run offers Retry, which reads that run again", async () => {
  const outside = recordOutsideReads();
  let runAsks = 0;
  await openDoneStoryComparison({
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
    range: unread,
    fileDiff: unread,
    fileText: unread,
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await expect.poll(story.revisions).toContain(doneCompletion.slice(0, 7));

  // Landed runs whose read fails explains the failure.
  await story.choose("Landed runs");
  await expect.poll(story.alertText).toContain(unreadable);
  await expect
    .poll(story.headerText)
    .toContain("The review could not be read:");

  // Retry reads that run again and lists its changes.
  const asked = runAsks;
  await story.retry();
  await expect.poll(story.outside).toContain("chosen.txt");
  await expect.element(story.alert).not.toBeInTheDocument();
  expect(runAsks).toBeGreaterThan(asked);
  // Plan 764 slices 1 (story notes) and 4 (done wall-time history) make this [].
  expect(outsideKinds(outside)).toEqual(doneOutsideKinds);
});
