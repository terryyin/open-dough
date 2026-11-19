// Choose-and-reveal journeys for the banner Recent stories control
// (../src/recentStoriesControl.tsx): two-project Roster setup, Development
// reveal observations, and an unavailable history row.

import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { pausePageClock } from "./autoRefreshJourney.ts";
import {
  expectProjectChoice,
  expectSettledPage,
  projectTab,
} from "./dashboardPage.ts";
import {
  doughnutPublication,
  doughnutTakenIdentity,
  doughnutTakenTitle,
  openDoughPublication,
  openDoughTakenIdentity,
  openDoughTakenTitle,
  titlesOfOpenDough,
} from "./projectSelectionProjects.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import {
  chooseRecentStory,
  dismissRecentStoriesWithEscape,
  expectColumnsForProject,
  expectRecentStoriesButton,
  expectRecentStoriesList,
  expectStoryRevealedInDevelopment,
  seedRecentStoriesHistory,
  selectStoryOnProject,
  showRosterKeepingSelection,
} from "./recentStoriesPage.ts";
import { referenceNotice } from "./storyReference.ts";
import { emptyArea, expectSelected } from "./storyCardSelection.ts";
import { answerOnlyPublications } from "./support/frontendCatalogProjects.ts";
import type { FrontendServiceState } from "./support/frontendServiceState.ts";

export type TwoProjectTakenCards = {
  readonly openDoughTaken: Locator;
  readonly doughnutTaken: Locator;
};

export async function openOpenDoughWithDoughnutBoard(
  page: Page,
  services: FrontendServiceState,
): Promise<TwoProjectTakenCards> {
  await page.setViewportSize({ width: 1280, height: 800 });
  await answerOnlyPublications(page, services, [
    openDoughPublication,
    doughnutPublication,
  ]);
  await pausePageClock(page);
  await page.goto("/");
  await expectSettledPage(page, titlesOfOpenDough);
  await expectProjectChoice(page, "Open Dough");
  return {
    openDoughTaken: page.getByRole("article", {
      name: openDoughTakenTitle,
      exact: true,
    }),
    doughnutTaken: page.getByRole("article", {
      name: doughnutTakenTitle,
      exact: true,
    }),
  };
}

// Selects Open Dough's then Doughnut's taken stories and shows Open Dough's
// Roster while Doughnut's story remains the Selected story.
export async function rememberDoughnutThenShowOpenDoughRoster(
  page: Page,
  cards: TwoProjectTakenCards,
) {
  await emptyArea(cards.openDoughTaken).click();
  await expectSelected(cards.openDoughTaken, true);
  await selectStoryOnProject(page, "Doughnut", cards.doughnutTaken);
  await projectTab(page, "Open Dough").check();
  await expectProjectChoice(page, "Open Dough");
  await showRosterKeepingSelection(page, "open-dough");
  await expectRecentStoriesButton(page, {
    selected: doughnutTakenIdentity,
    filled: true,
  });
}

export async function expectChoseDoughnutFromRoster(
  page: Page,
  doughnutTaken: Locator,
) {
  await expectColumnsForProject(page, {
    id: "doughnut",
    label: "Doughnut",
  });
  await expectStoryRevealedInDevelopment(page, doughnutTaken);
  await expectRecentStoriesButton(page, {
    selected: doughnutTakenIdentity,
    filled: true,
  });
  await expectRecentStoriesList(page, [
    {
      project: "Doughnut",
      identity: doughnutTakenIdentity,
      checked: true,
    },
    {
      project: "Open Dough",
      identity: openDoughTakenIdentity,
      checked: false,
    },
  ]);
  await dismissRecentStoriesWithEscape(page);
}

export async function chooseUnavailableRecentStory(
  page: Page,
  goneIdentity: string,
) {
  await seedRecentStoriesHistory(page, [
    { project: "doughnut", identity: goneIdentity },
    { project: "doughnut", identity: doughnutTakenIdentity },
    { project: "open-dough", identity: openDoughTakenIdentity },
  ]);
  await reloadUntilRead(page);
  await expectProjectChoice(page, "Doughnut");
  await expectRecentStoriesButton(page, {
    selected: undefined,
    filled: false,
  });
  await chooseRecentStory(page, {
    project: "Doughnut",
    identity: goneIdentity,
  });
  await expect(referenceNotice(page)).toContainText(
    `${goneIdentity} is unavailable in Doughnut's dashboard`,
  );
  await expectRecentStoriesButton(page, {
    selected: goneIdentity,
    filled: true,
  });
}
