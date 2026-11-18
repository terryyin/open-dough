import { expect, test } from "vitest";
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

test("swiping from a card or action does not select, inspect or launch it; taps still work", async () => {
  const board = await mountPhoneBoard({ observeLaunch: true });
  await board.showsPublishedStories();
  const story = board.storyCard(board.readyStory);
  await story.swipeFromCard("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await story.showsSelected(false);
  await story.showsInspected(false);
  await board.showsNoLaunchDialog();
  expect(await board.launchAcceptances()).toEqual([]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await story.swipeFromStart("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await story.showsSelected(false);
  await story.showsInspected(false);
  await board.showsNoLaunchDialog();
  expect(await board.launchAcceptances()).toEqual([]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await story.tapInspect();
  await story.showsInspected(true);
  await story.tapEmptyArea();
  await story.showsSelected(true);
});

test("swipes share the controls' chosen column and preserve open detail through rotation with reduced motion", async () => {
  const board = await mountPhoneBoard({ reducedMotion: "reduce" });
  await board.showsPublishedStories();
  const story = board.storyCard(board.readyStory);
  const portrait = { width: 390, height: 844 };
  const landscape = { width: 844, height: 390 };
  expect(board.viewport()).toEqual(portrait);
  expect(board.prefersReducedMotion()).toBe(true);
  await story.tapInspect();
  await story.tapEmptyArea();
  await story.showsSelected(true);
  await board.countSlides();
  await board.swipe("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  expect(await board.slides()).toBe(0);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await story.showsInspected(true);
  await board.swipe("left");
  expect(await board.resize(landscape.width, landscape.height)).toEqual({
    browser: landscape,
    frame: landscape,
  });
  await board.showsPhone(["Taken", "Recently done"], ["Backlog 2 entries"]);
  expect(await board.resize(portrait.width, portrait.height)).toEqual({
    browser: portrait,
    frame: portrait,
  });
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await story.showsInspected(true);
  await story.showsSelected(true);
});
