// Real built UI against the external notes boundary, with immutable line context.
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../tests/support/frontendRecentlyDoneBoardReview.ts";
import { installFrontendStoryNotes } from "../../tests/support/frontendStoryNotes.ts";
import { storyNotesPage } from "../../tests/support/storyNotesPage.ts";
import { parts } from "../../tests/dashboardParts.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const context = {
  view: "Intent → Changed tests" as const,
  path: "src/result.ts",
  oldPath: "src/before.ts",
  comparison: {
    name: "Published completion",
    baseline: "abc123",
    tree: "def456",
  },
  line: { number: 7, side: "new" as const, text: "return result;" },
};
test("a line note edits text alone, cancel keeps it, delete removes and updates count", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const original = makeMe.aStoryNote
    .withText("Original observation")
    .withContext(context)
    .please();
  service.answer("open-dough", { [storyA.identity]: [original] });
  await openFrontendBoardReview(page, frontendServices);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  const notes = storyNotesPage(page);
  await notes.expectCount(card, 1);
  await notes.open(card);
  await notes.edit(0, "keyboard");
  await notes.expectComposerFocused();
  await notes.expectComposing("Original observation");
  const contextWords = [
    "Intent → Changed tests",
    "src/before.ts → src/result.ts",
    "Published completion abc123 → def456",
    "Line 7 · new",
    "return result;",
  ];
  await notes.expectComposerContext(contextWords);
  await notes.type("Updated observation");
  await notes.save();
  await notes.expectAnnouncement("Note updated.");
  await notes.expectActionFocused("Edit");
  await notes.expectNotes(["Updated observation"]);
  for (const text of contextWords)
    await notes.expectNoteContext("Updated observation", text);
  expect(service.changes()).toEqual([
    {
      action: "edit",
      identity: storyA.identity,
      id: original.id,
      text: "Updated observation",
    },
  ]);
  await notes.delete(0);
  await notes.expectDeleteCancelFocused(0);
  expect(service.changes()).toHaveLength(1);
  await notes.answerDelete(0, "Cancel");
  await notes.expectActionFocused("Delete");
  await notes.expectNotes(["Updated observation"]);
  await notes.expectCount(card, 1);
  await notes.delete(0);
  await notes.answerDelete(0, "Delete");
  await notes.expectAnnouncement("Note deleted.");
  await notes.expectNotes([]);
  await notes.expectActionFocused("Add note");
  await notes.close();
  await notes.expectCount(card, 0);
});

test("refused edits keep typed text and original note; refused deletion keeps text and reports failure", async ({
  page,
  frontendServices,
}) => {
  const service = await installFrontendStoryNotes(page);
  const original = makeMe.aStoryNote
    .withText("Original text stays saved")
    .withContext(context)
    .please();
  service.answer("open-dough", { [storyA.identity]: [original] });
  await openFrontendBoardReview(page, frontendServices);
  const card = parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  const notes = storyNotesPage(page);
  await notes.open(card);
  await notes.edit(0);
  await notes.type("Typed edit survives refusal");
  service.failNextChange();
  await notes.save();
  await notes.expectProblem("The note could not be saved.");
  await notes.expectComposing("Typed edit survives refusal");
  await notes.expectNotes(["Original text stays saved"]);
  await notes.cancel();
  service.failNextChange();
  await notes.delete(0);
  await notes.answerDelete(0, "Delete");
  await notes.expectProblem("The note could not be deleted.");
  await notes.expectNotes(["Original text stays saved"]);
  await notes.expectCount(card, 1);
  await notes.expectActionFocused("Delete");
  await notes.delete(0);
  await notes.answerDelete(0, "Delete");
  await notes.expectNotes([]);
});
