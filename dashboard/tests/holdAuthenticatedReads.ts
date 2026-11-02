// Holds authenticated repository-file reads for one path until release, shared
// by Intent journeys that assert Partial progress while a contained feature
// is still reading.

import type { Page, Route } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

export const authenticatedReadRoute = `**${authenticatedReadEndpoint}?*`;

// Holds the page's reads of `path` until the returned release. Push the
// release onto `releases` so afterEach can free a held journey that failed.
export async function holdAuthenticatedReadsOf(
  page: Page,
  path: string,
  releases: (() => void)[],
) {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  releases.push(release);
  const held: Route[] = [];
  await page.route(authenticatedReadRoute, async (route) => {
    if (new URL(route.request().url()).searchParams.get("path") !== path) {
      await route.fallback();
      return;
    }
    held.push(route);
    await released;
    await route.fallback();
  });
  return { held: () => held.length, release };
}
