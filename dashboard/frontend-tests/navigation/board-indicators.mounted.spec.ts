import { expect, test } from "vitest";
import { mountPhoneBoard } from "../../test-support/phone-board-mount/phoneBoard.ts";

test("thin phone indicators give stories more room and taps share the swipe destinations", async () => {
  const board = await mountPhoneBoard();
  board.showsPublishedStories();
  board.swipe("left");
  board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  const room = board.columnReadingRoom("Taken");
  expect(room.controlWidths).toHaveLength(2);
  for (const width of room.controlWidths) expect(width).toBeLessThanOrEqual(16);
  const previousView = room.board - 2 * 44;
  expect(room.view - previousView).toBeGreaterThan(44);
  expect(room.card - previousView).toBeGreaterThan(44);
  board.tapIndicator("Recently done");
  board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  board.swipe("right");
  board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  board.tapIndicator("Backlog");
  board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});

test("thin indicators retain complete destination names, keyboard activation and focus handoff", async () => {
  const board = await mountPhoneBoard();
  board.showsPublishedStories();
  board.focusIndicator("Taken");
  board.indicatorFocused("Taken");
  board.activateIndicator("Taken");
  board.showsColumn("Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  board.indicatorFocused("Recently done");
  board.activateIndicator("Recently done");
  board.showsColumn("Recently done", ["Taken 1 entry"]);
  board.indicatorFocused("Taken");
  board.activateIndicator("Taken");
  board.showsColumn("Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
});
