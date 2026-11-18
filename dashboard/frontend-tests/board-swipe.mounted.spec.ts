import { test } from "vitest";
import { mountPhoneBoard } from "../tests/phone-board-mount/phoneBoard.ts";

test("completed native swipes traverse one whole column and stop at both ends", async () => {
  const board = await mountPhoneBoard();
  await board.showsPublishedStories();
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await board.swipe("right");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await board.swipe("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.swipe("left");
  await board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  await board.swipe("left");
  await board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  await board.swipe("right");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.swipe("right");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});

test("short and cancelled gestures leave the view alone, and the next swipe works", async () => {
  const board = await mountPhoneBoard();
  await board.showsPublishedStories();
  await board.swipe("left", { distance: 24 });
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await board.swipe("left", { cancel: true });
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await board.swipe("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
});
