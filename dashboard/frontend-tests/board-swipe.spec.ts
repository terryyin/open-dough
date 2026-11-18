import {
  expect,
  test,
  openFrontendTakenBacklog,
} from "../tests/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../tests/support/frontendLaunchSubstitutes.ts";
import { largeBacklog, queuedTitles } from "../tests/accessibleBoard.ts";
import { expectSettledPage } from "../tests/dashboardPage.ts";
import { readyStory } from "../tests/launchJourney.ts";
import {
  backlogLaunchers,
  expectNoLaunchDialog,
} from "../tests/launchStoryCardPage.ts";
import {
  emptyArea,
  expectSelected,
  expectInspected,
  tapCardEmptyArea,
} from "../tests/storyCardSelection.ts";
import { boardView } from "../tests/boardView.ts";
import { tapInspectStory } from "../tests/storyCardControls.ts";
import { scrollByTouch } from "../tests/touchGestures.ts";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test("completed native swipes traverse one whole column and stop at both ends", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const board = boardView(page);
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

test("short and cancelled gestures leave the view alone, and the next swipe works", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const board = boardView(page);
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

test("swiping from a card or action does not select, inspect or launch it; taps still work", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const board = boardView(page);
  const { card, start } = backlogLaunchers(page);
  const story = card(readyStory);
  await board.swipe("left", { from: emptyArea(story) });
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await expectSelected(story, false);
  await expectInspected(story, false);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await board.swipe("left", { from: start(readyStory) });
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await expectSelected(story, false);
  await expectInspected(story, false);
  await expectNoLaunchDialog(page);
  expect(boundary.acceptances).toEqual([]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await tapInspectStory(story);
  await expectInspected(story, true);
  await tapCardEmptyArea(story);
  await expectSelected(story, true);
});

test("native vertical reading scrolls without paging", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, { backlog: largeBacklog });
  await page.goto("/");
  await expectSettledPage(page, {
    backlog: queuedTitles,
    taken: ["Repair the installer's update report"],
  });
  const board = boardView(page);
  const before = await board.scrollY();
  await scrollByTouch(
    page,
    board.scrollRegion(),
    -240,
    "vertical",
    undefined,
    board.scrollRegion(),
  );
  expect(await board.scrollY()).toBeGreaterThan(before);
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});

test("swipes share the controls' chosen column and preserve open detail through rotation with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFrontendTakenBacklog(page);
  const board = boardView(page);
  const story = backlogLaunchers(page).card(readyStory);
  await tapInspectStory(story);
  await tapCardEmptyArea(story);
  await expectSelected(story, true);
  await board.countSlides();
  await board.swipe("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  expect(await board.slides()).toBe(0);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await expectInspected(story, true);
  await board.swipe("left");
  await page.setViewportSize({ width: 844, height: 390 });
  await board.showsPhone(["Taken", "Recently done"], ["Backlog 2 entries"]);
  await page.setViewportSize({ width: 390, height: 844 });
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
  await expectInspected(story, true);
  await expectSelected(story, true);
});
