// Controls and observes the page's reads of Pygardon's done catalog, which
// the Recently done sessions selection journeys
// (./recentlyDoneSelectionJourney.ts) check a linked row's story against.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { holdNextReads } from "./nextActionReads.ts";

export const isPygardonCatalog = (url: URL) =>
  url.pathname === authenticatedReadEndpoint &&
  url.searchParams.get("source") === "pygardon" &&
  url.searchParams.get("done") === "catalog";

// Holds the Pygardon done catalog reads the journey's next action leads to,
// after letting the first `passing` through, as ./nextActionReads.ts holds
// them: page time must be paused before the page opens.
export const holdPygardonCatalog = (page: Page, passing = 0) =>
  holdNextReads(page, isPygardonCatalog, passing);

// Resolves once the page has read Pygardon's done catalog.
export const pygardonCatalogRead = (page: Page) =>
  page.waitForResponse((response) =>
    isPygardonCatalog(new URL(response.url())),
  );

// Resolves once the page has abandoned a read of Pygardon's done catalog.
export const pygardonCatalogAbandoned = (page: Page) =>
  page.waitForEvent("requestfailed", (request) =>
    isPygardonCatalog(new URL(request.url())),
  );
