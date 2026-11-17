// Playwright fixture for frontend-only app journeys: serves the shared app
// build with explicit service substitutes and never starts dashboardServer.

import type { Page } from "@playwright/test";
import { expect, test as base } from "./pageTest.ts";
import {
  startFrontendAppServer,
  type FrontendAppServer,
} from "./frontendAppServer.ts";
import {
  defaultFrontendServiceState,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { installFrontendServiceSubstitutes } from "./frontendServiceSubstitutes.ts";
import { endHeldAnswers } from "./frontendSubstituteAnswers.ts";
import { expectSettledPage, parts } from "../dashboardPage.ts";
import { takenStory } from "../launchJourney.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";

export { expect };

export const test = base.extend<{
  frontendApp: FrontendAppServer;
  frontendServices: FrontendServiceState;
  baseURL: string;
  page: Page;
}>({
  // Accepted cost: a worker's first case waits here for the run's one shared
  // dashboard build (about 2 s in CI). The build is the app under test and is
  // made once per run; the wait only lands on whichever case starts a worker.
  // eslint-disable-next-line no-empty-pattern
  frontendApp: async ({}, use) => {
    const server = await startFrontendAppServer();
    await use(server);
    await server.close();
  },
  baseURL: async ({ frontendApp }, use) => {
    await use(frontendApp.baseURL);
  },
  // Mutable substitute answers; installed onto `page` below.
  // eslint-disable-next-line no-empty-pattern
  frontendServices: async ({}, use) => {
    await use(defaultFrontendServiceState());
  },
  page: async ({ page, frontendServices }, use) => {
    await installFrontendServiceSubstitutes(page, frontendServices);
    await use(page);
    await endHeldAnswers(page);
  },
});

// Opens the substitute Open Dough project at a settled Taken/Backlog board.
export async function openFrontendTakenBacklog(page: Page): Promise<void> {
  await page.goto("/");
  await expectSettledPage(page, takenBacklogStories);
}

// The substitute project's Taken story card.
export const takenStoryCard = (page: Page) =>
  parts(page).taken.getByRole("article", { name: takenStory, exact: true });
