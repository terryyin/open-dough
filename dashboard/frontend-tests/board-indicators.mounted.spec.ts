import { expect, test } from "vitest";
import { mountPhoneBoard } from "../tests/phone-board-mount/phoneBoard.ts";

test("thin phone indicators give stories more room and native taps share the swipe destinations", async ({
  annotate,
}) => {
  const board = await mountPhoneBoard();
  await board.showsPublishedStories();
  await board.swipe("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  const room = await board.columnReadingRoom("Taken");
  await annotate(`indicator-room ${JSON.stringify(room)}`);
  expect(room.controlWidths).toHaveLength(2);
  for (const width of room.controlWidths) expect(width).toBeLessThanOrEqual(16);
  // Compare the rendered view and card with the 44 px reserved on each side before.
  const previousView = room.board - 2 * 44;
  expect(room.view - previousView).toBeGreaterThan(44);
  expect(room.card - previousView).toBeGreaterThan(44);
  await board.tapIndicator("Recently done");
  await board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  await board.swipe("right");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});

test("thin indicators retain complete destination names, keyboard activation and focus handoff", async () => {
  const board = await mountPhoneBoard();
  await board.showsPublishedStories();
  await board.focusIndicator("Taken");
  await board.indicatorFocused("Taken");
  await board.activateIndicator("Taken");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.indicatorFocused("Recently done");
  await board.activateIndicator("Recently done");
  await board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  await board.indicatorFocused("Taken");
  await board.activateIndicator("Taken");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
});
