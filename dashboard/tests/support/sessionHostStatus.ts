// Host-status story setup and controlled endpoint observations. The title
// row's figures are read through ../sessionsSidebarFigures.ts.
import type { Page, Request } from "@playwright/test";
import type { test as dashboardTest } from "../dashboardTest.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { sessionsSidebarFigures } from "../sessionsSidebarFigures.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { hostStatusEndpoint, type HostStatus } from "../../src/hostStatus.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";

export const story = (index: number) => ({
  identity: `SEED-902#status-${index}`,
  title: `Status story ${index}`,
});

const isHostRead = (request: Request) =>
  request.method() === "GET" &&
  new URL(request.url()).pathname === hostStatusEndpoint;

// The page's host status reads as they are sent, and what each answered.
export function noteHostReads(page: Page) {
  const asked: Request[] = [];
  const answers: HostStatus[] = [];
  page.on("request", (request) => {
    if (isHostRead(request)) asked.push(request);
  });
  page.on("response", async (response) => {
    if (isHostRead(response.request()))
      answers.push((await response.json()) as HostStatus);
  });
  return { asked: () => asked.length, answers };
}

export function statusJourney(test: typeof dashboardTest) {
  let journey: StoryColumnsJourney;
  test.beforeAll(async () => {
    journey = await publishStoryColumnsJourney();
  });
  test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());
  return () => journey;
}

export async function hostStatusAnswer(
  page: Page,
  initial: HostStatus | undefined,
) {
  const host = { answer: initial };
  await page.route(
    (url) => url.pathname === hostStatusEndpoint,
    (route) =>
      host.answer === undefined
        ? route.fulfill({ status: 503, json: { error: "Ask again." } })
        : route.fulfill({ json: host.answer }),
  );
  return host;
}

export async function unreadSessions(page: Page) {
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    (route) =>
      route.request().method() === "GET"
        ? route.fulfill({ status: 503, json: { error: "Ask again." } })
        : route.continue(),
  );
}

export async function readStatusView(page: Page, journey: StoryColumnsJourney) {
  const { settled } = await openStoryColumnsJourney(page, journey);
  const sidebar = sessionsSidebarParts(page);
  const figures = sessionsSidebarFigures(page);
  await settled();
  return { ...sidebar, ...figures };
}
