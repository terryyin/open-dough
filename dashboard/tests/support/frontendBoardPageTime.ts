// Board answers for journeys that move the published revision on the page's
// paused clock (../autoRefreshJourney.ts).
import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

const readsWith = (keys: string) => (url: URL) =>
  url.pathname === authenticatedReadEndpoint &&
  [...url.searchParams.keys()].join() === keys;

// Every story record is published empty, so detail reads settle as gaps
// rather than transient failures the page keeps retrying before it checks.
// The ref is resolved when the page asks, on the page's own clock, so its next
// revision check falls due as page time passes.
export async function answerBoardOnPageTime(
  page: Page,
  services: FrontendServiceState,
): Promise<void> {
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
