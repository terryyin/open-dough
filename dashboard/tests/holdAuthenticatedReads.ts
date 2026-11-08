// Holds authenticated reads, of one path or matching a query, until release
// or failure, for Intent journeys that observe a read still in flight
// (`./intent/intent-selection-reads.spec.ts`, `./intent/intent-revision-notice.spec.ts`,
// `./intent/intent-revision-update-outcomes.spec.ts`,
// `./intent/intent-revision-update-boundaries.spec.ts`,
// `./intent/intent-story-coverage.spec.ts`). Its route pattern also
// serves journeys that observe Session details' reads
// (`./support/historicalCreditReads.ts`).

import type { Page, Route } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

export const authenticatedReadRoute = `**${authenticatedReadEndpoint}?*`;

// Holds the page's reads of `path` until the returned release. Push the
// release onto `releases` so afterEach can free a held journey that failed.
export function holdAuthenticatedReadsOf(
  page: Page,
  path: string,
  releases: (() => void)[],
) {
  return holdAuthenticatedReadsWhere(
    page,
    (params) => params.get("path") === path,
    releases,
  );
}

// Holds the page's authenticated reads whose query matches `which`. `release`
// lets the held reads be answered; `fail` ends them as an unreachable
// boundary. Either way, later reads pass.
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
