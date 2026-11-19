// Return-to-selected journeys for the banner Recent stories button
// (../src/recentStoriesControl.tsx): a Board tall enough to scroll the
// selected card out of view, a tall card whose start stays readable, and a
// selected story that belongs to another project.

import { expect, type Locator, type Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { pausePageClock } from "./autoRefreshJourney.ts";
import { boardScroll } from "./boardPage.ts";
import {
  expectProjectChoice,
  expectSettledPage,
  projectTab,
} from "./dashboardPage.ts";
import { describedRevision } from "./describedRevisions.ts";
import {
  cardStartIsReadable,
  expectRecentStoriesButton,
  expectRecentStoriesClosed,
  expectRecentStoriesList,
  expectStoryRevealedInDevelopment,
  recentStoriesButton,
  selectStoryOnProject,
} from "./recentStoriesPage.ts";
import {
  doughnutPublication,
  doughnutTakenIdentity,
  doughnutTakenTitle,
  openDoughTakenIdentity,
  openDoughTakenTitle,
} from "./projectSelectionProjects.ts";
import { answerOnlyPublications } from "./support/frontendCatalogProjects.ts";
import type { FrontendServiceState } from "./support/frontendServiceState.ts";
import { emptyArea, expectSelected } from "./storyCardSelection.ts";

export const returnTargetIdentity = "SEED-850#return-target";
export const returnTargetTitle = "Return target story";

const precedingQueued = [...Array(12).keys()].map((index) =>
  makeMe.aBacklogEntry
    .with({
      identity: `SEED-${String(800 + index)}#story`,
      title: `Earlier story ${String(index + 1)}`,
      href: `seeds/SEED-${String(800 + index)}.md#story`,
    })
    .please(),
);

const returnTarget = makeMe.aBacklogEntry
  .with({
    identity: returnTargetIdentity,
    title: returnTargetTitle,
    href: "seeds/SEED-850-return.md#return-target",
  })
  .please();

const tallBoardPublication = {
  ...makeMe.aPublishedSource
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
    })
    .please(),
  ...describedRevision(
    makeMe.aRepository
      .withRevision("published", {
        backlog: {
          direction: "A Board tall enough for Recent stories return.",
          taken: [
            makeMe.aBacklogEntry
              .with({
                identity: openDoughTakenIdentity,
                title: openDoughTakenTitle,
                href: "slice-plans/900-open-dough-story/PLAN.md",
              })
              .please(),
          ],
          queued: [...precedingQueued, returnTarget],
        },
      })
      .please(),
    "d0".repeat(20),
  ),
};

export type ReturnBoardCards = {
  readonly returnTarget: Locator;
  readonly openDoughTaken: Locator;
  readonly doughnutTaken: Locator;
};

export async function openTallReturnBoard(
  page: Page,
  services: FrontendServiceState,
): Promise<ReturnBoardCards> {
  await page.setViewportSize({ width: 1280, height: 800 });
  await answerOnlyPublications(page, services, [
    tallBoardPublication,
    doughnutPublication,
  ]);
  await pausePageClock(page);
  await page.goto("/");
  await expectSettledPage(page, {
    taken: [openDoughTakenTitle],
    backlog: [...precedingQueued.map(({ title }) => title), returnTargetTitle],
  });
  await expectProjectChoice(page, "Open Dough");
  return {
    returnTarget: page.getByRole("article", {
      name: returnTargetTitle,
      exact: true,
    }),
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

export async function scrollCardStartOutOfView(page: Page, card: Locator) {
  await boardScroll(page).evaluate((region) => {
    const scrolled = region;
    scrolled.scrollTop = 0;
  });
  await expect.poll(() => cardStartIsReadable(card)).toBe(false);
}

export async function lengthenCardPastFold(card: Locator) {
  await card.evaluate((element) => {
    const cardEl = element as HTMLElement;
    cardEl.style.minHeight = "200vh";
  });
  await expect.poll(() => cardStartIsReadable(card)).toBe(true);
  await expect
    .poll(() =>
      card.evaluate((element) => {
        const region = element.closest(".board-scroll");
        if (!region) throw new Error("No Board scroll region");
        return (
          element.getBoundingClientRect().bottom >
          region.getBoundingClientRect().bottom
        );
      }),
    )
    .toBe(true);
}

export async function returnToSelectedStory(page: Page) {
  await recentStoriesButton(page).click();
}

export async function returnOutOfViewThenList(
  page: Page,
  card: Locator,
  row: { readonly project: string; readonly identity: string },
) {
  await returnToSelectedStory(page);
  await expectRecentStoriesClosed(page);
  await expectStoryRevealedInDevelopment(page, card);
  await expectRecentStoriesList(page, [{ ...row, checked: true }]);
}

// First click opens the list while the selected card's start is readable
// (including a tall card whose end is below the fold).
export async function listWhileStartReadable(
  page: Page,
  row: { readonly project: string; readonly identity: string },
) {
  await expectRecentStoriesList(page, [{ ...row, checked: true }]);
}

export async function selectReturnTargetThenScrollAway(
  page: Page,
  card: Locator,
) {
  await emptyArea(card).click();
  await expectSelected(card, true);
  await expectRecentStoriesButton(page, {
    selected: returnTargetIdentity,
    filled: true,
  });
  await scrollCardStartOutOfView(page, card);
}

export async function selectDoughnutWhileShowingOpenDough(
  page: Page,
  cards: ReturnBoardCards,
) {
  await emptyArea(cards.openDoughTaken).click();
  await expectSelected(cards.openDoughTaken, true);
  await selectStoryOnProject(page, "Doughnut", cards.doughnutTaken);
  await projectTab(page, "Open Dough").check();
  await expectProjectChoice(page, "Open Dough");
  await expectRecentStoriesButton(page, {
    selected: doughnutTakenIdentity,
    filled: true,
  });
}

export async function returnFollowsOtherProject(
  page: Page,
  doughnutTaken: Locator,
) {
  await returnToSelectedStory(page);
  await expectProjectChoice(page, "Doughnut");
  await expectStoryRevealedInDevelopment(page, doughnutTaken);
  await expectRecentStoriesClosed(page);
}
