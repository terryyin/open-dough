// Built app with explicit story-review and notes substitutes: what Review
// changes offers for notes and keeps around Story notes. The real Published
// completion journey is ../../../e2e/review/story-review-diff-add-note.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
} from "../../tests/support/frontendStoryReview.ts";
import { openFrontendStoryReview } from "../../tests/support/frontendStoryReviewOpen.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { fileDiff } from "../../tests/support/reviewTreeRows.ts";
import {
  codePane,
  scrollPane,
  scrollTopOf,
} from "../../tests/support/reviewPanes.ts";
import { shownComparisonDescription } from "../../tests/support/reviewContextLine.ts";
import {
  reviewHeaderActions,
  reviewRefresh,
} from "../../tests/support/reviewControls.ts";
import { takenIdentity, takenStory } from "../../tests/launchJourney.ts";

const longDiff = frontendFileDiff(
  "story.txt",
  [...Array(120).keys()].map((n) => `+story line ${n + 1}`),
);

test("the Review changes toolbar groups the Notes icon with Refresh", async ({
  page,
  frontendServices,
}) => {
  const { review } = await openFrontendStoryReview(page, frontendServices);
  const actions = reviewHeaderActions(review);
  await storyNotesPage(page).expectIconBeside(actions, reviewRefresh(actions));
});

test("Taken workspace file note keeps the Comparison switch's words and endpoints; its line menu offers Add note alone", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    undefined,
    (answers) => {
      answers.answerFile(longDiff, "story.txt");
    },
  );
  const diff = fileDiff(review, "Added story.txt", { exact: true });
  const notes = storyNotesPage(page);
  await notes.fromFile(diff);
  await notes.expectComposerAlone();
  const comparison = `All changes ${frontendReviewIds.baseline} → ${frontendReviewIds.tree}`;
  await notes.expectComposerContext([takenStory, "story.txt", comparison]);
  await notes.expectNoComposerLine();
  await notes.saveDiffNote("Workspace file observation");
  await notes.expectDiffSaved();
  expect(service.changes()[0]).toEqual({
    action: "add",
    identity: takenIdentity,
    text: "Workspace file observation",
    context: {
      view: "Review changes",
      path: "story.txt",
      comparison: {
        name: "All changes",
        baseline: frontendReviewIds.baseline,
        tree: frontendReviewIds.tree,
      },
    },
  });
  await expect(await notes.lineActions(diff, "new", 54)).toHaveText([
    "Add note",
  ]);
});

test("Notes from Review changes keeps the displayed diff and returns focus", async ({
  page,
  frontendServices,
}) => {
  await installFrontendStoryNotes(page);
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    undefined,
    (answers) => {
      answers.answerFile(longDiff, "story.txt");
    },
  );
  const diff = fileDiff(review, "Added story.txt", { exact: true });
  const notes = storyNotesPage(page);
  await notes.fromFile(diff);
  await notes.saveDiffNote("Keep this review observation");
  const code = codePane(diff);
  const readingAt = await scrollPane(code, 150);
  expect(readingAt).toBeGreaterThan(0);
  const comparison = shownComparisonDescription(review);
  const comparisonBefore = await comparison.textContent();
  if (comparisonBefore === null) throw new Error("Comparison was not shown");
  await notes.expectCount(review, 1);
  await notes.open(review, "keyboard");
  await notes.expectContext(takenStory, takenIdentity);
  await notes.expectNotes(["Keep this review observation"]);
  await notes.close();
  await notes.expectOpenerFocused(review);
  await expect(comparison).toHaveText(comparisonBefore);
  await expect(diff).toBeVisible();
  expect(await scrollTopOf(code)).toBe(readingAt);
});
