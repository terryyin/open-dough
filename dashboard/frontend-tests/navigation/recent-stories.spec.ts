// Recent stories in the banner (../../src/recentStoriesControl.tsx): outline vs
// filled bookmark, empty and ordered history, and Escape/outside dismiss,
// with selections from a card empty area and from opening a Side panel
// terminal. ADR 0008 names the control; browser storage is a later slice.

import { test } from "../../test-support/support/frontendApp.ts";
import {
  openFrontendTakenBacklog,
  takenStoryCard,
} from "../../test-support/support/frontendApp.ts";
import { takenStoryWorkingSession } from "../../test-support/support/frontendCardSessions.ts";
import { parts } from "../../test-support/dashboardPage.ts";
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
  dismissRecentStoriesByBannerClick,
  dismissRecentStoriesWithEscape,
  expectRecentStoriesButton,
  expectRecentStoriesEmpty,
  expectRecentStoriesList,
  openRecentStories,
} from "../../test-support/recentStoriesPage.ts";
import { expectBannerRow } from "../../test-support/bannerReading.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import { settings } from "../../test-support/support/systemSettingsPage.ts";
import { closeSidePanel } from "../../test-support/sidePanelFrame.ts";

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
