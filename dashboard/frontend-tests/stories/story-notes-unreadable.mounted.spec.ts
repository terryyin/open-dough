// Mounted board with the notes service's unreadable answer; the real store's
// refusal and preservation are proved in story-notes.unit.spec.ts.
import { test } from "vitest";
import { mountStoryNotesBoard } from "../../test-support/mounted-dashboard/mountedStoryNotesBoard.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";

test("unreadable notes replace the count on every card kind and say so in Story notes", async () => {
  const board = await mountStoryNotesBoard();
  const { notes } = board;
  const done = board.card("Recently done", board.cards.done);
  await notes.expectCount(done, 1);
  board.notesService.markUnreadable(board.project);
  await board.runFor(checkIntervalMs);
  const problem = "The notes could not be read.";
  await notes.expectUnreadable(done, problem);
  await notes.open(done);
  await notes.expectProblem(problem);
  await notes.add();
  await notes.type("Keep this draft while the notes file needs recovery.");
  await notes.save();
  await notes.expectProblem("The note could not be saved.");
  await notes.expectComposing(
    "Keep this draft while the notes file needs recovery.",
  );
  await notes.close();
  await notes.expectUnreadable(board.card("Taken", board.cards.taken), problem);
  await notes.expectUnreadable(
    board.card("Backlog", board.cards.backlog),
    problem,
  );
});
