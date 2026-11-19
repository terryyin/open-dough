// Recent stories in the banner (../../src/recentStoriesControl.tsx): outline vs
// filled bookmark, empty and ordered history, Escape/outside dismiss,
// disposable-storage retention across a reload (capped at 10), and choosing a
// row that selects and reveals the story in Development. Selections come from
// a card empty area and from opening a Side panel terminal. ADR 0008 names the
// control.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  openFrontendTakenBacklog,
  takenStoryCard,
} from "../../test-support/support/frontendApp.ts";
import { takenStoryWorkingSession } from "../../test-support/support/frontendCardSessions.ts";
import { expectSettledPage, parts } from "../../test-support/dashboardPage.ts";
import {
  readyIdentity,
  readyStory,
  takenIdentity,
} from "../../test-support/launchJourney.ts";
import {
  emptyArea,
  expectSelected,
} from "../../test-support/storyCardSelection.ts";
import { storyCard } from "../../test-support/storyCardControls.ts";
import {
  chooseRecentStory,
  dismissRecentStoriesByBannerClick,
  dismissRecentStoriesWithEscape,
  expectRecentStoriesButton,
  expectRecentStoriesEmpty,
  expectRecentStoriesList,
  openRecentStories,
  selectStoriesInTurn,
} from "../../test-support/recentStoriesPage.ts";
import {
  beyondCapHistoryStories,
  putRecentHistoryStories,
} from "../../test-support/recentStoriesHistory.ts";
import {
  chooseUnavailableRecentStory,
  expectChoseDoughnutFromRoster,
  openOpenDoughWithDoughnutBoard,
  rememberDoughnutThenShowOpenDoughRoster,
} from "../../test-support/recentStoriesChoosePage.ts";
import { expectBannerRow } from "../../test-support/bannerReading.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import { settings } from "../../test-support/support/systemSettingsPage.ts";
import { closeSidePanel } from "../../test-support/sidePanelFrame.ts";
import { reloadUntilRead } from "../../test-support/pageRequestNotes.ts";
import { watchPageErrors } from "../../test-support/pageErrors.ts";
import { recentStoriesLimit } from "../../src/recentStories.ts";
import { doughnutTakenIdentity } from "../../test-support/projectSelectionProjects.ts";

test("the banner Recent stories control shows selection state and lists recent stories from card and Side panel selection", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { openTerminal } = await takenStoryWorkingSession(
    page,
    frontendServices,
  );
  await openFrontendTakenBacklog(page);
  const { backlog, perspective, project, recentStories } = parts(page);
  const sessions = sessionsSidebarParts(page).button;
  const gear = settings(page);
  const storyA = storyCard(backlog, readyStory);
  const storyB = takenStoryCard(page);

  await test.step("with no selection the outline bookmark opens an empty Recent stories popover", async () => {
    await expectRecentStoriesButton(page, {
      selected: undefined,
      filled: false,
    });
    await expectBannerRow([
      sessions,
      perspective,
      recentStories,
      project,
      gear,
    ]);
    await expectRecentStoriesEmpty(page);
    await dismissRecentStoriesWithEscape(page);
  });

  await test.step("selecting A then B then A fills the bookmark and lists A checked, then B, each with its project", async () => {
    await emptyArea(storyA).click();
    await expectSelected(storyA, true);
    const panel = await openTerminal();
    await expectSelected(storyB, true);
    await closeSidePanel(panel);
    await emptyArea(storyA).click();
    await expectSelected(storyA, true);
    await expectRecentStoriesButton(page, {
      selected: readyIdentity,
      filled: true,
    });
    await expectRecentStoriesList(page, [
      { project: "Open Dough", identity: readyIdentity, checked: true },
      { project: "Open Dough", identity: takenIdentity, checked: false },
    ]);
    await dismissRecentStoriesWithEscape(page);
  });

  await test.step("clearing A leaves the outline bookmark and lists A unchecked", async () => {
    await emptyArea(storyA).click();
    await expectSelected(storyA, false);
    await expectRecentStoriesButton(page, {
      selected: undefined,
      filled: false,
    });
    await expectRecentStoriesList(page, [
      { project: "Open Dough", identity: readyIdentity, checked: false },
      { project: "Open Dough", identity: takenIdentity, checked: false },
    ]);
  });

  await test.step("Escape and an outside click close the popover without changing the selection", async () => {
    await dismissRecentStoriesWithEscape(page);
    await emptyArea(storyA).click();
    await expectSelected(storyA, true);
    await openRecentStories(page);
    await dismissRecentStoriesWithEscape(page);
    await expectSelected(storyA, true);
    await expectRecentStoriesButton(page, {
      selected: readyIdentity,
      filled: true,
    });
    await openRecentStories(page);
    await dismissRecentStoriesByBannerClick(page);
    await expectSelected(storyA, true);
  });
});

test("recent stories survive a reload, capped at the 10 most recent, and last only for the page when storage throws", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  putRecentHistoryStories(frontendServices, beyondCapHistoryStories);
  await page.goto("/");
  await expectSettledPage(page, {
    taken: [],
    backlog: beyondCapHistoryStories.map(({ title }) => title),
  });

  await test.step("after eleven distinct selections and a reload, no story is selected and the popover lists the last 10 newest first", async () => {
    await selectStoriesInTurn(
      page,
      beyondCapHistoryStories.map(({ title }) => title),
    );
    await expectRecentStoriesButton(page, {
      selected: beyondCapHistoryStories[recentStoriesLimit]?.identity,
      filled: true,
    });
    await reloadUntilRead(page);
    await expectSettledPage(page, {
      taken: [],
      backlog: beyondCapHistoryStories.map(({ title }) => title),
    });
    await expectRecentStoriesButton(page, {
      selected: undefined,
      filled: false,
    });
    await expectRecentStoriesList(
      page,
      beyondCapHistoryStories
        .slice(-recentStoriesLimit)
        .reverse()
        .map(({ identity }) => ({
          project: "Open Dough",
          identity,
          checked: false,
        })),
    );
    await dismissRecentStoriesWithEscape(page);
  });

  await test.step("when storage throws, the history lasts for the page", async () => {
    await page.addInitScript(() => {
      const refused = () => {
        throw new DOMException("Storage is refused.", "SecurityError");
      };
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get: refused,
      });
    });
    const errors = watchPageErrors(page);
    const first = beyondCapHistoryStories[0];
    const second = beyondCapHistoryStories[1];
    if (first === undefined || second === undefined) {
      throw new Error("Expected beyond-cap history stories.");
    }
    await reloadUntilRead(page);
    await expectSettledPage(page, {
      taken: [],
      backlog: beyondCapHistoryStories.map(({ title }) => title),
    });
    await expectRecentStoriesEmpty(page);
    await dismissRecentStoriesWithEscape(page);
    await selectStoriesInTurn(page, [first.title, second.title]);
    await expectRecentStoriesList(page, [
      { project: "Open Dough", identity: second.identity, checked: true },
      { project: "Open Dough", identity: first.identity, checked: false },
    ]);
    await reloadUntilRead(page);
    await expectRecentStoriesEmpty(page);
    expect(errors).toEqual([]);
  });
});

const goneIdentity = "GONE-1#nope";

test("choosing a Recent stories row selects and reveals that story in Development, including across projects and when unavailable", async ({
  page,
  frontendServices,
}) => {
  const board = await openOpenDoughWithDoughnutBoard(page, frontendServices);

  await test.step("from Open Dough's Roster, choosing Doughnut's taken story closes the popover, switches project, and reveals the card focused and cued", async () => {
    await rememberDoughnutThenShowOpenDoughRoster(page, board);
    await chooseRecentStory(page, {
      project: "Doughnut",
      identity: doughnutTakenIdentity,
    });
    await expectChoseDoughnutFromRoster(page, board.doughnutTaken);
  });

  await test.step("choosing a row whose story is no longer on the Board shows the story-reference unavailable notice", async () => {
    await chooseUnavailableRecentStory(page, goneIdentity);
  });
});
