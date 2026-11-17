// Board answers for journeys that move the published revision on the page's
// paused clock (../autoRefreshJourney.ts).
import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { pausePageClock } from "../autoRefreshJourney.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { preholdRevisionStreamSlots } from "./revisionStreamSlots.ts";

const readsWith = (keys: string) => (url: URL) =>
  url.pathname === authenticatedReadEndpoint &&
  [...url.searchParams.keys()].join() === keys;

// Every story record is published empty, so detail reads settle as gaps
// rather than transient failures the page keeps retrying before it checks.
// The ref is resolved when the page asks, on the page's own clock, paused
// before the page opens; with both stream slots held elsewhere, the page's
// next revision check falls due only as a step passes page time.
export async function answerBoardOnPausedPageTime(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
  await pausePageClock(page);
  await preholdRevisionStreamSlots(page);
  await page.route(readsWith("source,revision,path"), (route) => {
    const params = new URL(route.request().url()).searchParams;
    return route.fulfill({
      json: {
        revision: params.get("revision"),
        path: params.get("path"),
        text: "",
      },
    });
  });
  await page.route(readsWith("source"), async (route) => {
    const askedAt = await page.evaluate(() => new Date().toISOString());
    await route.fulfill({
      json: {
        revision: services.revision,
        backlog: services.backlog,
        askedAt,
      },
    });
  });
}
