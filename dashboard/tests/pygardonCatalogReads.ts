// Controls and observes the page's reads of Pygardon's done catalog, which
// the Recently done sessions selection journeys
// (./recentlyDoneSelectionJourney.ts) check a linked row's story against.

import type { Page, Route } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

// Holds Pygardon's done catalog reads from now on: `asked` resolves once one
// reaches the page's boundary, and `release` lets every held one through.
export async function holdPygardonCatalog(page: Page) {
  let asked: () => void = () => undefined;
  const askedOnce = new Promise<void>((resolve) => {
    asked = resolve;
  });
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(isPygardonCatalog, async (route: Route) => {
    asked();
    await released;
    // The page may have abandoned the read meanwhile.
    await route.fallback().catch(() => undefined);
  });
  return { asked: askedOnce, release };
}

export const isPygardonCatalog = (url: URL) =>
  url.pathname === authenticatedReadEndpoint &&
  url.searchParams.get("source") === "pygardon" &&
  url.searchParams.get("done") === "catalog";

// Resolves once the page has read Pygardon's done catalog.
export const pygardonCatalogRead = (page: Page) =>
  page.waitForResponse((response) =>
    isPygardonCatalog(new URL(response.url())),
  );
