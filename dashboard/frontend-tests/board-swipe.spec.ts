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
import {
  boardScroll,
  tapColumnIndicator,
  expectView,
  expectColumnReading,
  recordSlides,
  scrollYOf,
  slidesOf,
  swipeBoard,
} from "../tests/boardPage.ts";
import { tapInspectStory } from "../tests/storyCardControls.ts";
import { compactProjectSelectCut } from "../tests/pageLayout.ts";
import { scrollByTouch } from "../tests/touchGestures.ts";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

const at = (
  page: Parameters<typeof expectView>[0],
  shown: "Backlog" | "Taken" | "Recently done",
  controls: string[],
) => expectColumnReading(page, shown, controls, compactProjectSelectCut);

test("completed native swipes traverse one whole column and stop at both ends", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  await at(page, "Backlog", ["Taken 1 entry"]);
  await swipeBoard(page, "right");
  await at(page, "Backlog", ["Taken 1 entry"]);
  await swipeBoard(page, "left");
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  await swipeBoard(page, "left");
  await at(page, "Recently done", ["Taken 1 entry"]);
  await swipeBoard(page, "left");
  await at(page, "Recently done", ["Taken 1 entry"]);
  await swipeBoard(page, "right");
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  await swipeBoard(page, "right");
  await at(page, "Backlog", ["Taken 1 entry"]);
});

test("short and cancelled gestures leave the view alone, and the next swipe works", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  await swipeBoard(page, "left", { distance: 24 });
  await at(page, "Backlog", ["Taken 1 entry"]);
  await swipeBoard(page, "left", { cancel: true });
  await at(page, "Backlog", ["Taken 1 entry"]);
  await swipeBoard(page, "left");
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
});

test("swiping from a card or action does not select, inspect or launch it; taps still work", async ({
  page,
}) => {
  const boundary = await installFrontendLaunchBoundary(page);
  await openFrontendTakenBacklog(page);
  const { card, start } = backlogLaunchers(page);
  const story = card(readyStory);
  await swipeBoard(page, "left", { from: emptyArea(story) });
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  await expectSelected(story, false);
  await expectInspected(story, false);
  await tapColumnIndicator(page, "Backlog");
  await at(page, "Backlog", ["Taken 1 entry"]);
  await swipeBoard(page, "left", { from: start(readyStory) });
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  await expectSelected(story, false);
  await expectInspected(story, false);
  await expectNoLaunchDialog(page);
  expect(boundary.acceptances).toEqual([]);
  await tapColumnIndicator(page, "Backlog");
  await at(page, "Backlog", ["Taken 1 entry"]);
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
  const before = await scrollYOf(page);
  await scrollByTouch(
    page,
    boardScroll(page),
    -240,
    "vertical",
    undefined,
    boardScroll(page),
  );
  expect(await scrollYOf(page)).toBeGreaterThan(before);
  await at(page, "Backlog", ["Taken 1 entry"]);
});

test("swipes share the controls' chosen column and preserve open detail through rotation with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFrontendTakenBacklog(page);
  const story = backlogLaunchers(page).card(readyStory);
  await tapInspectStory(story);
  await tapCardEmptyArea(story);
  await expectSelected(story, true);
  await recordSlides(page);
  await swipeBoard(page, "left");
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  expect(await slidesOf(page)).toBe(0);
  await tapColumnIndicator(page, "Backlog");
  await at(page, "Backlog", ["Taken 1 entry"]);
  await expectInspected(story, true);
  await swipeBoard(page, "left");
  await page.setViewportSize({ width: 844, height: 390 });
  await expectView(
    page,
    ["Taken", "Recently done"],
    ["Backlog 2 entries"],
    compactProjectSelectCut,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await at(page, "Taken", ["Backlog 2 entries", "Recently done 0 entries"]);
  await tapColumnIndicator(page, "Backlog");
  await at(page, "Backlog", ["Taken 1 entry"]);
  await expectInspected(story, true);
  await expectSelected(story, true);
});
