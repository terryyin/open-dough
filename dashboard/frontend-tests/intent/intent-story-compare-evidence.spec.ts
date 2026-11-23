// While a comparison other than the story's default is chosen, CI comparison,
// a file's Proof and Intent coverage each say they describe the whole story,
// and keep reading what the default comparison read
// (../../src/IntentStoryComparison.tsx). With the default chosen, none says so.
// The commit range is chosen as ./intent-story-compare-commits.spec.ts does; a
// Done story's landed run as ./intent-story-compare-done.spec.ts does. The CI
// evidence comes from the case's typed CI reads.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  openDoneStoryComparison,
  openStoryAComparison,
} from "./intent-story-compare-stories.ts";

const wholeStory = "Describes the whole story, not the chosen comparison.";
const views = ["CI comparison", "Proof", "Intent coverage"] as const;
type View = (typeof views)[number];

async function openProof(
  story: ReturnType<typeof intentStoryCompare>,
  file: ReturnType<typeof story.file>,
) {
  await story.chooseTab("Changes");
  await activateComparisonControl(file);
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
  });
  const story = intentStoryCompare();
  const read: Partial<Record<View, string>> = {};

  await openProof(story, story.file(modified));
  for (const view of views) {
    await comparisonRead(() => story.viewText(view)).not.toBe("");
    expect(story.noteIn(view), view).toBeNull();
    read[view] = story.viewText(view);
  }

  await story.choose("Commits");
  await story.chooseAlone("first change");
  await comparisonRead(story.range).toContain("first change");

  for (const view of views) {
    await comparisonRead(() => story.noteIn(view)).toBe(wholeStory);
    expect(story.viewText(view).replace(wholeStory, ""), view).toBe(read[view]);
  }
});

test("a Taken branch range names the build of its already shown provisional CI comparison", async () => {
  const measured = "f".repeat(40);
  const provisional = makeMe.aComparedStory
    .takenOnStoryBranch()
    .withBranch({ revision: measured })
    .please().answer;
  await openStoryAComparison(
    {
      review: () =>
        Promise.resolve(makeMe.aStoryReview.onCommits(first).please()),
      range: () => Promise.resolve(makeMe.aStoryReview.pleaseRange(first)),
    },
    {
      readComparison: (...[, identity]) =>
        Promise.resolve({ ...provisional, identity }),
    },
  );
  const story = intentStoryCompare();
  await story.choose("Commits");
  const short = measured.slice(0, 7);
  await comparisonRead(() => story.noteBuild("CI comparison")).toBe(short);
  expect(story.viewText("CI comparison")).toMatch(/provisional/i);
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
  const { outsideCalls } = await openDoneStoryComparison({
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
  });
  const story = intentStoryCompare();
  await comparisonRead(story.landedEndpoint).not.toBe("");
  const measured = story.landedEndpoint();

  await openProof(story, story.outsideFile(`Modified ${landing}`));
  await comparisonRead(() => story.proofLabels(doneIdentity)).not.toEqual([]);
  const proofLabels = story.proofLabels(doneIdentity);
  expect(story.noteIn("Proof")).toBeNull();

  await story.choose("Landed runs");

  await activateComparisonControl(story.outsideFile(`Added ${landing}`));
  for (const view of views) {
    await comparisonRead(() => story.noteBuild(view)).toMatch(/^[0-9a-f]{7}$/);
    expect(measured, view).toContain(story.noteBuild(view));
  }

  expect(story.landedEndpoint()).toBe(measured);
  await comparisonRead(() => story.proofLabels(doneIdentity)).toEqual(
    proofLabels,
  );
  expect(outsideCalls()).toEqual([]);
});
