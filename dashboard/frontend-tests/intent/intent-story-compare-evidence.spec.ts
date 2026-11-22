// While a comparison other than the story's default is chosen, CI comparison,
// a file's Proof and Intent coverage each say they describe the whole story,
// and keep reading what the default comparison read
// (../../src/IntentStoryComparison.tsx). With the default chosen, none says so.
// The commit range is chosen as ./intent-story-compare-commits.spec.ts does; a
// Done story's landed run as ./intent-story-compare-done.spec.ts does. The CI
// evidence comes from the case's typed CI reads.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  doneOutsideKinds,
  openDoneStoryComparison,
  openStoryAComparison,
} from "./intent-story-compare-stories.ts";

const wholeStory = "Describes the whole story, not the chosen comparison.";
const views = ["CI comparison", "Proof", "Intent coverage"] as const;
type View = (typeof views)[number];

// Opens VIEW; Proof is the Proof tab of the file FILE names.
async function open(
  story: ReturnType<typeof intentStoryCompare>,
  view: View,
  file: () => ReturnType<typeof story.file>,
) {
  if (view !== "Proof") {
    await story.chooseTab(view);
    return;
  }
  await story.chooseTab("Changes");
  await file().click();
  await story.chooseProof();
}

const [first, second] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
];
const modified = "Modified dashboard/tests/a.spec.ts";

test("CI comparison, Proof and Intent coverage say they describe the whole story only while a commit range is chosen, reading the same evidence either way", async () => {
  await openStoryAComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .modifying("dashboard/tests/a.spec.ts")
          .onCommits(second, first)
          .please(),
      ),
    range: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .modifying("dashboard/tests/a.spec.ts")
          .pleaseRange(first),
      ),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding("dashboard/tests/a.spec.ts", "all changes")
          .please(),
      ),
  });
  const story = intentStoryCompare();
  const file = () => story.file(modified);
  const read: Partial<Record<View, string>> = {};

  // With the default comparison chosen, no view says it describes the whole
  // story.
  await story.chooseTab("Changes");
  await expect.element(story.choice("All changes")).toBeChecked();
  for (const view of views) {
    await open(story, view, file);
    await expect.poll(() => story.viewText(view)).not.toBe("");
    expect(story.noteIn(view), view).toBeNull();
    read[view] = story.viewText(view);
  }

  // Choosing the first commit alone.
  await story.chooseTab("Changes");
  await story.choose("Commits");
  await story.chooseAlone("first change");
  await expect.poll(story.range).toContain("first change");

  // Each view says so and, beside the note, reads as it did.
  for (const view of views) {
    await open(story, view, file);
    await expect.poll(() => story.noteIn(view)).toBe(wholeStory);
    expect(story.viewText(view).replace(wholeStory, ""), view).toBe(read[view]);
  }
});

const landing = "dashboard/src/landing.ts";
const run = makeMe.aReviewRun
  .keyed("capture-run")
  .launchedAt("2026-01-01T10:00:00.000Z")
  .comparing("1".repeat(40), "2".repeat(40))
  .please();

test("with a Done story's landed run chosen, CI comparison, Proof and Intent coverage each name the build measured beside the whole-story note", async () => {
  // The published completion modifies landing; its one captured landed run
  // adds it.
  const published = makeMe.aStoryReview
    .published(doneCompletion)
    .modifying(landing)
    .please();
  const { outsideKinds } = await openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.historical === "true"
          ? { ...published, runs: [run] }
          : query.run === run.key
            ? makeMe.aStoryReview
                .landed()
                .adding(landing)
                .onRun(run, [run])
                .please()
            : published,
      ),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(landing, "landing").please(),
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).not.toBe("");
  const measured = story.landedEndpoint();

  // With the published completion chosen, Proof has no note.
  await open(story, "Proof", () => story.outsideFile(`Modified ${landing}`));
  await expect.poll(() => story.proofLabels(doneIdentity)).not.toEqual([]);
  const proofLabels = story.proofLabels(doneIdentity);
  expect(story.noteIn("Proof")).toBeNull();

  // Choosing Landed runs chooses the captured run.
  await story.choose("Landed runs");
  await expect.element(story.run).toHaveValue(run.key);

  // Each view's note names the build the CI comparison measures; the landed
  // run lists the same file as added.
  const added = () => story.outsideFile(`Added ${landing}`);
  for (const view of views) {
    await open(story, view, added);
    await expect.poll(() => story.noteBuild(view)).toMatch(/^[0-9a-f]{7}$/);
    expect(measured, view).toContain(story.noteBuild(view));
  }

  // The CI comparison still measures the same build, and Proof still reads the
  // same labels.
  await story.chooseTab("CI comparison");
  await expect.poll(story.landedEndpoint).toBe(measured);
  await open(story, "Proof", added);
  await expect.poll(() => story.proofLabels(doneIdentity)).toEqual(proofLabels);
  expect(outsideKinds()).toEqual(doneOutsideKinds);
});
