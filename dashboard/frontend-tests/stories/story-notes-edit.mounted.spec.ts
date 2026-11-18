// Mounted board against the notes service rule, with immutable line context.
import { expect, test } from "vitest";
import { mountStoryNotesBoard } from "../../test-support/mounted-dashboard/mountedStoryNotesPage.ts";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
} from "../../src/storyNote.ts";

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

test("a line note edits text alone, cancel keeps it, delete removes and updates count", async () => {
  const board = await mountStoryNotesBoard({
    text: "Original observation",
    context,
  });
  const { notes, notesService } = board;
  const card = board.card("Recently done", board.cards.done);
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
  expect(notesService.changes).toEqual([
    {
      action: "edit",
      identity: board.identity,
      id: board.note.id,
      text: "Updated observation",
    },
  ]);
  await notes.delete(0);
  await notes.expectDeleteCancelFocused(0);
  expect(notesService.changes).toHaveLength(1);
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
  expect(notesService.changes.slice(1)).toEqual([
    { action: "delete", identity: board.identity, id: board.note.id },
  ]);
});

test("saving an unchanged edit of a sent note shows it waiting again", async () => {
  const board = await mountStoryNotesBoard({
    text: "Send this again unchanged",
    context,
    sentAt: "2026-11-17T00:10:00.000Z",
  });
  const { notes, notesService } = board;
  const card = board.card("Recently done", board.cards.done);
  await notes.expectWaiting(card, 0);
  await notes.open(card);
  await notes.expectNoteState(0, storyNoteSentToFollowUp);
  await notes.edit(0);
  await notes.expectComposing("Send this again unchanged");
  await notes.save();
  await notes.expectAnnouncement("Note updated.");
  await notes.expectNoteState(0, storyNoteWaitingForFollowUp);
  await notes.close();
  await notes.expectWaiting(card, 1);
  expect(notesService.changes).toEqual([
    {
      action: "edit",
      identity: board.identity,
      id: board.note.id,
      text: "Send this again unchanged",
    },
  ]);
});

test("refused edits keep typed text and original note; refused deletion keeps text and reports failure", async () => {
  const board = await mountStoryNotesBoard({
    text: "Original text stays saved",
    context,
  });
  const { notes, notesService } = board;
  const card = board.card("Recently done", board.cards.done);
  await notes.open(card);
  await notes.edit(0);
  await notes.type("Typed edit survives refusal");
  notesService.failNext = "refused";
  await notes.save();
  await notes.expectProblem("The note could not be saved.");
  await notes.expectComposing("Typed edit survives refusal");
  await notes.expectNotes(["Original text stays saved"]);
  await notes.cancel();
  notesService.failNext = "refused";
  await notes.delete(0);
  await notes.answerDelete(0, "Delete");
  await notes.expectProblem("The note could not be deleted.");
  await notes.expectNotes(["Original text stays saved"]);
  await notes.expectCount(card, 1);
  await notes.expectActionFocused("Delete");
  await notes.delete(0);
  await notes.answerDelete(0, "Delete");
  await notes.expectNotes([]);
  const { identity } = board;
  const { id } = board.note;
  expect(notesService.changes).toEqual([
    { action: "edit", identity, id, text: "Typed edit survives refusal" },
    { action: "delete", identity, id },
    { action: "delete", identity, id },
  ]);
});
