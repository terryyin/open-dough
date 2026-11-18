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
import { expectSettledPage } from "../dashboardPage.ts";
import { frontendBoard, type FrontendBoard } from "./frontendBoard.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";

export { expect };

export const test = base.extend<{
  frontendApp: FrontendAppServer;
  frontendServices: FrontendServiceState;
  baseURL: string;
  page: Page;
}>({
  // The worker's dashboardAppReady has built the app before any case starts.
  frontendApp: async ({ dashboardAppReady }, use) => {
    await Promise.resolve(dashboardAppReady);
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
export async function openFrontendTakenBacklog(
  page: Page,
): Promise<FrontendBoard> {
  await page.goto("/");
  await expectSettledPage(page, takenBacklogStories);
  return frontendBoard(page);
}

export { takenStoryCard } from "./frontendBoard.ts";
