// Mounted board against the notes service rule and the fixture's timers:
// follow-up states on cards and entries, and later project reads.
import { test } from "vitest";
import { commands } from "vitest/browser";
import { mountStoryNotesBoard } from "../../test-support/mounted-dashboard/mountedStoryNotesBoard.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import {
  storyNoteSentToFollowUp,
  storyNoteWaitingForFollowUp,
} from "../../src/storyNote.ts";

test("waiting and sent notes show their state; the card counts only waiting notes", async () => {
  const board = await mountStoryNotesBoard("waiting and sent");
  const { notes, notesService, cards, identities } = board;
  const [waiting, sent] = board.arrangedNotes[identities.done] ?? [];
  if (!waiting || !sent) throw new Error("Expected a waiting and a sent note.");
  const done = board.card("Recently done", cards.done);
  await notes.expectCount(done, 2);
  await notes.expectWaiting(done, 1);
  await notes.open(done);
  await notes.expectNotes(["Already sent", "Still waiting"]);
  await notes.expectNoteState(0, storyNoteSentToFollowUp);
  await notes.expectNoteState(1, storyNoteWaitingForFollowUp);
  await notes.expectEntryActions(0);
  await notes.close();
  notesService.setNotes(board.project, {
    [identities.done]: [sent],
    [identities.taken]: [waiting],
  });
  await board.runFor(checkIntervalMs);
  await notes.expectCount(done, 1);
  await notes.expectWaiting(done, 0);
  await notes.open(done);
  await notes.expectNoteState(0, storyNoteSentToFollowUp);
  await notes.expectEntryActions(0);
  await notes.close();
  const taken = board.card("Taken", cards.taken);
  await notes.expectCount(taken, 1);
  await notes.expectWaiting(taken, 1);
});

test("next project read updates the count and open list; an older read cannot replace a save", async () => {
  const board = await mountStoryNotesBoard("no notes");
  const { notes, notesService } = board;
  const card = board.card("Recently done", board.cards.done);
  await notes.open(card);
  await notes.expectNotes([]);
  const remote = await commands.storyNote({ text: "Saved on another page" });
  notesService.setNotes(board.project, { [board.identities.done]: [remote] });
  await board.runFor(checkIntervalMs);
  await notes.expectNotes(["Saved on another page"]);
  await notes.close();
  await notes.expectCount(card, 1);
  await notes.open(card);
  const old = board.holdNext();
  await board.runFor(checkIntervalMs);
  await old.received;
  await notes.addNote("Saved here afterwards");
  await notes.expectSaved();
  await old.release();
  await notes.expectNotes(["Saved here afterwards", "Saved on another page"]);
  await notes.close();
  await notes.expectCount(card, 2);
});
