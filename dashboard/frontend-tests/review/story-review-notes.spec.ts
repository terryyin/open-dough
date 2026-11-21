// Notes from Review changes on a Taken story's workspace: the Notes icon sits
// with Refresh; a file's note keeps the comparison's words and endpoints and a
// line's menu offers Add note alone; closing Story notes keeps the diff and
// returns focus. The real Published completion journey is
// ../../../e2e/review/story-review-diff-add-note.spec.ts.
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
const file = "Added story.txt";
const longStory = reviewSourceAnswering({
  review: () =>
    Promise.resolve(makeMe.aStoryReview.adding("story.txt", 120).please()),
  fileDiff: () =>
    Promise.resolve(
      makeMe.aReviewedFileDiff
        .adding(
          "story.txt",
          ...[...Array(120).keys()].map((at) => `story line ${at + 1}`),
        )
        .please(),
    ),
});

test("the Review changes toolbar groups the Notes icon with Refresh", async () => {
  const review = await mountReviewChanges(longStory, doneStory);
  await review.expectComparisonNamed("All changes");
  await review.expectNotesIconBesideRefresh();
});

test("Taken workspace file note keeps the Comparison switch's words and endpoints; its line menu offers Add note alone", async () => {
  const notes = notesKept();
  const review = await mountReviewChanges(longStory, doneStory, {
    notes: notes.source,
  });
  await review.expectDiffShows(file, "+story line 1");
  await review.addNoteFromFile(file);
  await review.expectComposerAlone();
  await review.expectComposerSaysWithoutLine([
    doneStoryTitle,
    "story.txt",
    `All changes ${ids.baseline} → ${ids.tree}`,
  ]);
  await review.saveNote("Workspace file observation");
  expect(notes.changes()).toEqual([
    {
      action: "add",
      identity,
      text: "Workspace file observation",
      context: {
        view: "Review changes",
        path: "story.txt",
        comparison: {
          name: "All changes",
          baseline: ids.baseline,
          tree: ids.tree,
        },
      },
    },
  ]);
  expect(await review.lineActions(file, "new", 54)).toEqual(["Add note"]);
});

test("Notes from Review changes keeps the displayed diff and returns focus", async () => {
  const review = await mountReviewChanges(longStory, doneStory, {
    notes: notesKept().source,
  });
  await review.expectDiffShows(file, "+story line 1");
  await review.addNoteFromFile(file);
  await review.saveNote("Keep this review observation");
  const readingAt = review.scrollCodeTo(file, 150);
  expect(readingAt).toBeGreaterThan(0);
  const described = review.comparisonDescription();
  expect(described).toContain("All changes");
  expect(described).toContain(ids.baseline.slice(0, 7));
  expect(described).toContain(ids.tree.slice(0, 7));
  await review.expectNotesCounted(1);
  await review.openNotesByKeyboard();
  await review.expectStoryNotes(doneStoryTitle, identity, [
    "Keep this review observation",
  ]);
  await review.closeNotes();
  await review.expectNotesOpenerFocused();
  await review.expectComparisonNamed("All changes");
  expect(review.comparisonDescription()).toBe(described);
  await review.expectDiffShows(file, "+story line 1");
  expect(review.codeScrollTop(file)).toBe(readingAt);
});
