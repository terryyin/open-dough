import { expect, test } from "vitest";
import { mountPhoneBoard } from "../../test-support/phone-board-mount/phoneBoard.ts";

test("completed swipes traverse one whole column and stop at both ends", async () => {
  const board = await mountPhoneBoard();
  board.showsPublishedStories();
  board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  board.swipe("right");
  board.showsColumn("Backlog", ["Taken 1 entry"]);
  board.swipe("left", { finish: false });
  board.showsSlidingColumn();
  board.finishSlide();
  board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  board.swipe("left");
  board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  board.swipe("left");
  board.showsColumn("Recently done", ["Taken 1 entry"]);
  board.swipe("right");
  board.showsColumn("Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  board.swipe("right");
  board.showsColumn("Backlog", ["Taken 1 entry"]);
});

test("short and cancelled gestures leave the view alone, and the next swipe works", async () => {
  const board = await mountPhoneBoard();
  board.showsPublishedStories();
  board.swipe("left", { distance: 24 });
  board.showsColumn("Backlog", ["Taken 1 entry"]);
  board.swipe("left", { cancel: true });
  board.showsColumn("Backlog", ["Taken 1 entry"]);
  board.swipe("left");
  board.showsColumn("Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
});

test("swiping from a card or action does not select, inspect or launch it; taps still work", async () => {
  const board = await mountPhoneBoard();
  board.showsPublishedStories();
  const story = board.storyCard(board.readyStory);
  story.swipeFromCard("left");
  board.showsColumn("Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  story.showsSelected(false);
  story.showsInspected(false);
  board.showsNoLaunchDialog();
  expect(board.launchAcceptances).toEqual([]);
  board.tapIndicator("Backlog");
  board.showsColumn("Backlog", ["Taken 1 entry"]);
  story.swipeFromStart("left");
  board.showsColumn("Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  story.showsSelected(false);
  story.showsInspected(false);
  board.showsNoLaunchDialog();
  expect(board.launchAcceptances).toEqual([]);
  board.tapIndicator("Backlog");
  board.showsColumn("Backlog", ["Taken 1 entry"]);
  story.tapInspect();
  story.showsInspected(true);
  story.tapEmptyArea();
  story.showsSelected(true);
});

test("the board leaves vertical touch available for native reading without paging", async () => {
  const board = await mountPhoneBoard({ backlog: "long" });
  board.showsPublishedStories();
  const before = board.scrollY();
  board.readVertically(240);
  expect(board.scrollY()).toBeGreaterThan(before);
  board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});

test("swipes share the controls' chosen column and preserve open detail through rotation with reduced motion", async () => {
  const board = await mountPhoneBoard({ reducedMotion: "reduce" });
  board.showsPublishedStories();
  const story = board.storyCard(board.readyStory);
  const portrait = { width: 390, height: 844 };
  const landscape = { width: 844, height: 390 };
  expect(board.viewport()).toEqual(portrait);
  expect(board.prefersReducedMotion()).toBe(true);
  story.tapInspect();
  story.tapEmptyArea();
  story.showsSelected(true);
  board.swipe("left", { finish: false });
  expect(board.isSliding()).toBe(false);
  board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  board.tapIndicator("Backlog");
  board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  story.showsInspected(true);
  board.swipe("left");
  expect(await board.resize(landscape.width, landscape.height)).toEqual(
    landscape,
  );
  board.showsPhone(["Taken", "Recently done"], ["Backlog 2 entries"]);
  expect(await board.resize(portrait.width, portrait.height)).toEqual(portrait);
  board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  board.tapIndicator("Backlog");
  board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  story.showsInspected(true);
  story.showsSelected(true);
});
