// Mounted board against the notes service rule: general notes on every card
// kind, and saves the service refuses or cannot be reached for.
import { expect, test } from "vitest";
import { mountStoryNotesBoard } from "../../test-support/mounted-dashboard/mountedStoryNotesBoard.ts";
import type { StoryNoteSaveFailure } from "../../test-support/support/frontendStoryNotesRule.ts";

test("all card kinds offer general notes, blank is unsaved, newest first", async () => {
  const board = await mountStoryNotesBoard("no notes");
  const { notes, notesService, cards, identities } = board;
  const done = board.card("Recently done", cards.done);
  await notes.expectCount(done, 0);
  await notes.open(done);
  await notes.expectContext(cards.done, identities.done);
  await notes.close();
  await notes.expectCount(board.card("Taken", cards.taken), 0);
  const card = board.card("Backlog", cards.backlog);
  await notes.open(card);
  await notes.expectContext(cards.backlog, identities.backlog);
  await notes.add();
  await notes.type("   ");
  await notes.save();
  await notes.expectComposing("   ");
  expect(notesService.asked.filter(({ method }) => method === "POST")).toEqual(
    [],
  );
  await notes.cancel();
  await notes.addNote("First observation");
  await notes.expectSaved();
  await notes.expectNotes(["First observation"]);
  await notes.expectNoteContext(
    "First observation",
    `${cards.backlog} · ${identities.backlog}`,
  );
  await notes.addNote("Later observation");
  await notes.expectSaved();
  await notes.expectNotes(["Later observation", "First observation"]);
  expect(notesService.changes).toEqual([
    { action: "add", identity: identities.backlog, text: "First observation" },
    { action: "add", identity: identities.backlog, text: "Later observation" },
  ]);
  await notes.close();
  await notes.expectCount(card, 2);
  await expect
    .element(card.getByRole("button", { name: "Notes (2)", exact: true }))
    .toHaveFocus();
  await notes.open(done);
  await notes.expectNotes([]);
  await notes.close();
});

async function keepsDraftAfterFailedSave(failNext: StoryNoteSaveFailure) {
  const board = await mountStoryNotesBoard("no notes");
  const { notes, notesService } = board;
  await notes.open(board.card("Recently done", board.cards.done));
  await notes.add();
  const draft = "Keep the observation when saving fails.";
  await notes.type(draft);
  notesService.failNext = failNext;
  await notes.save();
  await notes.expectProblem("The note could not be saved.");
  await notes.expectComposing(draft);
  await notes.save();
  await notes.expectSaved();
  await notes.expectNotes([draft]);
}

test("a refused save keeps its draft and says so; saving again saves and clears it", () =>
  keepsDraftAfterFailedSave("refused"));

test("a save that cannot reach the dashboard keeps its draft and says so; saving again saves and clears it", () =>
  keepsDraftAfterFailedSave("unreachable"));
