// Show latest 10: with more than ten entries shown, the action beside
// Recently done's heading shows only the latest ten again, reading nothing,
// brings the heading into view, and leaves the keyboard at the start of
// Recently done, while an open terminal stays as it was. A held older read
// -- a revealed batch, or a journey's destination -- answering afterwards
// neither extends the list again nor scrolls, and a fresh journey can
// extend it. Publication, sessions, and the
// held record: ../recentlyDoneProgressiveJourney.ts; the Running Cursor
// sessions row is ./recently-done-progressive-navigation-cursor.spec.ts's.
// The `gh` calls reaching the fake GitHub show which records were read.

import type { Locator, Page } from "@playwright/test";
import { agentTerminalEndpoint } from "../../dashboard/src/agentTerminal.ts";
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  rem,
  scrollYOf,
  showColumn,
} from "../../dashboard/test-support/boardPage.ts";
import {
  untilBoardRests,
  watchBoardScroll,
} from "../../dashboard/test-support/boardReading.ts";
import {
  expectEntries,
  revealAction,
  showLatestAction,
  shownEntries,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import {
  openTerminalControl,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  recordsAsked,
  terminalOf,
  untilPageRests,
} from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import {
  destination,
  openedWithHeldPublishedStory,
  openedWithTakenNativeSession,
  publishedNames,
  publishedPaths,
} from "../../dashboard/test-support/recentlyDoneProgressiveJourney.ts";
import {
  recordReveals,
  revealsOf,
} from "../../dashboard/test-support/sessionNavigationJourney.ts";
import { openRunningList } from "../../dashboard/test-support/runningCursorList.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  expect,
  keptRecord,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";

test.use({ projectFolders: ["open-dough"], cursorScreen: "working" });

const heading = (recent: Locator) =>
  recent.getByRole("heading", { name: "Recently done" });

// Shows only the latest ten of `total` from the keyboard: ten entries, the
// heading in view once the move to it ends, the keyboard at the start of
// Recently done.
async function collapsedFromKeyboard(
  page: Page,
  recent: Locator,
  total: number,
  latest: readonly string[],
) {
  await showLatestAction(recent).focus();
  const scrolled = await watchBoardScroll(page);
  await page.keyboard.press("Enter");
  await expect(shownEntries(recent)).toHaveCount(10);
  await expect(heading(recent)).toBeInViewport();
  await expect(recent).toBeFocused();
  await expect(showLatestAction(recent)).toHaveCount(0);
  await expect(recent).toContainText(`Showing 10 of ${String(total)} entries.`);
  await expectEntries(recent, latest);
  await scrolled();
}

test("Show latest 10 keeps an open Taken session while a held Done story read settles; a local Done mark keeps the current range", async ({
  afterGitHubStops,
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const view = await openedWithTakenNativeSession(
    page,
    dashboard,
    afterGitHubStops,
  );
  const { github, recent } = view;
  const terminal = terminalOf(page);
  await expect(revealAction(recent)).toHaveText("Show 10 of 25 older entries");
  await expect(showLatestAction(recent)).toHaveCount(0);

  await openTerminalControl(view.activeSession).click();
  await expect(terminalScreenParts(terminal).rows).toContainText("attached");
  await showColumn(page, "Recently done");

  await test.step("two reveals ask for entries 11 to 30, holding one record, and Show latest 10 is offered beside the heading", async () => {
    await revealAction(recent).click();
    await expect(revealAction(recent)).toHaveText(
      "Show 10 of 15 older entries",
    );
    await revealAction(recent).click();
    await expect(view.heldCard).toContainText("Reading done story…");
    await expect(revealAction(recent)).toHaveText("Reading done stories…");
    await expect(showLatestAction(recent)).toBeVisible();
    await expect
      .poll(() => recordsAsked(github).toSorted())
      .toEqual(publishedPaths(30).toSorted());
  });
  const asked = recordsAsked(github).length;

  await test.step("from the keyboard, Show latest 10 shows the first ten with the heading in view, reading nothing, the terminal still open", async () => {
    await collapsedFromKeyboard(page, recent, 35, publishedNames(10));
    await expect(revealAction(recent)).toHaveText(
      "Show 10 of 25 older entries",
    );
    await expect(terminalScreenParts(terminal).rows).toContainText("attached");
    await expect(view.activeSession).toHaveCount(1);
    expect(recordsAsked(github)).toHaveLength(asked);
  });

  await test.step("the held record answering afterwards neither extends the list nor scrolls", async () => {
    await untilBoardRests(page);
    const scrolled = await scrollYOf(page);
    view.release();
    await untilPageRests(page);
    await expectEntries(recent, publishedNames(10));
    await expect(recent).toBeFocused();
    expect(await scrollYOf(page)).toBe(scrolled);
    expect(recordsAsked(github)).toHaveLength(asked);
    await expect(terminalScreenParts(terminal).rows).toContainText("attached");
  });

  await test.step("a fresh reveal shows twenty, reusing what was read", async () => {
    await revealAction(recent).click();
    await expectEntries(recent, publishedNames(20));
    await untilPageRests(page);
    expect(recordsAsked(github)).toHaveLength(asked);
  });

  await test.step("When I mark the Taken session Done with its history open", async () => {
    await showColumn(page, "Taken");
    await view.showDoneHistory();
    await view.markDone();
  });
  await test.step("Then the terminal closes and focus returns to Done history", async () => {
    await expect(terminal).toHaveCount(0);
    await view.showsFocusedDoneSession();
  });
  await test.step("And the same twenty stories remain without additional reads", async () => {
    await expectEntries(recent, publishedNames(20));
    expect(recordsAsked(github)).toHaveLength(asked);
  });
});

test("Show latest 10 while a Running Cursor sessions row's published Done story is still read supersedes the journey; once read nothing reveals it, and choosing the row again does", async ({
  afterGitHubStops,
  page,
  dashboard,
  cursor,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const instruction = "hold this done session";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  // The terminal never connects, so the session stays done.
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  await recordReveals(page);
  const view = await openedWithHeldPublishedStory(
    page,
    dashboard,
    afterGitHubStops,
    instruction,
    held,
  );
  const { github, recent } = view;
  const entry = view.destinationCard;
  const terminal = terminalOf(page);
  const { sidebar, button } = sessionsSidebarParts(page);
  const choose = async () => {
    await (await openRunningList(page)).heldRows(/Open Dough/).click();
  };

  await choose();
  await expect(terminal).toHaveCount(1);
  await expect(view.heldCard).toContainText("Reading done story…");
  await expect(shownEntries(recent)).toHaveCount(destination);
  await expect
    .poll(() => recordsAsked(github).toSorted())
    .toEqual(publishedPaths(destination).toSorted());
  if (await sidebar.isVisible()) await button.click();

  await test.step("from the keyboard, Show latest 10 shows the first ten with the heading in view, reading nothing, the terminal still open", async () => {
    await collapsedFromKeyboard(page, recent, 35, publishedNames(10));
    await expect(terminal).toHaveCount(1);
    expect(recordsAsked(github).toSorted()).toEqual(
      publishedPaths(destination).toSorted(),
    );
  });

  await test.step("the held record answering afterwards neither extends the list nor brings the entry into view", async () => {
    await untilBoardRests(page);
    const before = (await revealsOf(page)).length;
    const scrolled = await scrollYOf(page);
    view.release();
    await untilPageRests(page);
    await expectEntries(recent, publishedNames(10));
    await expect(entry).toHaveCount(0);
    await expect(recent).toBeFocused();
    expect((await revealsOf(page)).slice(before)).toEqual([]);
    expect(await scrollYOf(page)).toBe(scrolled);
    expect(recordsAsked(github)).toHaveLength(
      publishedPaths(destination).length,
    );
    await expect(terminal).toHaveCount(1);
  });

  await test.step("choosing the row again extends the list through entry 27 and brings it into view, reusing what was read", async () => {
    await choose();
    await expect(entry).toBeInViewport();
    await expect(shownEntries(recent)).toHaveCount(destination);
    expect(recordsAsked(github).toSorted()).toEqual(
      publishedPaths(destination).toSorted(),
    );
  });
});
