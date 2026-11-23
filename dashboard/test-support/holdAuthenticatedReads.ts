// Holds matching authenticated reads for journeys that observe an in-flight
// request. The route pattern also serves Session details read observations.

import type { Page, Route } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

export const authenticatedReadRoute = `**${authenticatedReadEndpoint}?*`;

// Holds the page's authenticated reads whose query matches `which`. `release`
// lets the held reads be answered; `fail` ends them as an unreachable
// boundary. Either way, later reads pass. Free `releases` in `test.afterEach`
// so a case failing while reads are held reports promptly instead of waiting
// out the test timeout in teardown.
export async function holdAuthenticatedReadsWhere(
  page: Page,
  which: (params: URLSearchParams) => boolean,
  releases: (() => void)[],
) {
  let settle: (failed: boolean) => void = () => undefined;
  let done = false;
  const settled = new Promise<boolean>((resolve) => {
    settle = (failed) => {
      done = true;
      resolve(failed);
    };
  });
  const release = () => {
    settle(false);
  };
  releases.push(release);
  const held: Route[] = [];
  await page.route(authenticatedReadRoute, async (route) => {
    if (done || !which(new URL(route.request().url()).searchParams)) {
      await route.fallback();
      return;
    }
    held.push(route);
    if (await settled) await route.abort("connectionreset");
    else await route.fallback();
  });
  return {
    held: () => held.length,
    release,
    fail: () => {
      settle(true);
    },
  };
}
