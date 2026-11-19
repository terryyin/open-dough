// Story notes beside an attached session terminal: the terminal's socket is
// answered on the provider's page for this case. Real store persistence and
// refusals: ../../backend-tests/review/story-notes-*.spec.ts.
import { expect, test } from "vitest";
import { mountStoryNotesBoard } from "../../test-support/mounted-dashboard/mountedStoryNotesBoard.ts";
import {
  attachedTerminal,
  sessionTerminal,
} from "../../test-support/mounted-dashboard/mountedSessionTerminal.ts";

test("Story notes leaves an attached terminal mounted and connected", async () => {
  const terminal = await attachedTerminal("Terminal before notes\r\n");
  const board = await mountStoryNotesBoard(
    "no notes",
    "Terminal kept during notes",
  );
  const screen = sessionTerminal();
  await screen.open("Terminal kept during notes");
  await screen.expectText("Terminal before notes");
  const originalScreen = screen.screen();
  const card = board.card("Recently done", board.cards.done);
  await board.notes.open(card, "keyboard");
  await board.notes.expectContext(board.cards.done, board.identities.done);
  await terminal.print("Terminal while notes open\r\n");
  await board.notes.close();
  await screen.expectText("Terminal before notes");
  await screen.expectText("Terminal while notes open");
  expect(originalScreen.isConnected).toBe(true);
  expect(await terminal.attachments()).toBe(1);
  await board.notes.expectOpenerFocused(card);
});
