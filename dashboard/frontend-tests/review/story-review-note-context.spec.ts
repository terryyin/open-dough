// A landed run's file note from Review changes: the composer and the saved
// note keep the renamed path and the run's exact endpoints, with no line.
// Published Git selection remains the real journey's responsibility.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds as ids } from "../../../Distribution/tests/support/storyReviewSnapshotTestData.mjs";
import { notesKept } from "./story-review-page-contexts.ts";
import {
  doneStory,
  doneStoryTitle,
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const { identity } = doneStory;
const oldPath = "old-name.ts";
const path = "new-name.ts";
const renamed = `Renamed ${oldPath} → ${path}`;
const landedRename = reviewSourceAnswering({
  review: () =>
    Promise.resolve(
      makeMe.aStoryReview.landed().renaming(oldPath, path).please(),
    ),
  fileDiff: () =>
    Promise.resolve(makeMe.aReviewedFileDiff.adding(path, "changed").please()),
});

test("Landed run file note shows and saves renamed path and exact comparison endpoints without a line", async () => {
  const notes = notesKept();
  const review = await mountReviewChanges(landedRename, doneStory, {
    completed: true,
    notes: notes.source,
  });
  const comparison = `Landed run ${ids.baseline} → ${ids.tree}`;
  await review.expectDiffShows(renamed, "+changed");
  await review.addNoteFromFile(renamed);
  await review.expectComposerSaysWithoutLine([
    doneStoryTitle,
    identity,
    "Review changes",
    `${oldPath} → ${path}`,
    comparison,
  ]);
  await review.saveNote("Rename observation");
  expect(notes.changes()).toEqual([
    {
      action: "add",
      identity,
      text: "Rename observation",
      context: {
        view: "Review changes",
        path,
        oldPath,
        comparison: {
          name: "Landed run",
          baseline: ids.baseline,
          tree: ids.tree,
        },
      },
    },
  ]);
  await review.openNotesByKeyboard();
  await review.expectStoryNotes(doneStoryTitle, identity, [
    "Rename observation",
  ]);
  await review.expectNoteSays("Rename observation", `${oldPath} → ${path}`);
  await review.expectNoteSays("Rename observation", comparison);
});
