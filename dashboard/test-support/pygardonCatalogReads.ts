// Observes the page's reads of Pygardon's done catalog, which the Recently
// done sessions selection journeys check a linked row's story against.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

const isPygardonCatalog = (url: URL) =>
  url.pathname === authenticatedReadEndpoint &&
  url.searchParams.get("source") === "pygardon" &&
  url.searchParams.get("done") === "catalog";

// Resolves once the page has read Pygardon's done catalog.
export const pygardonCatalogRead = (page: Page) =>
  page.waitForResponse((response) =>
    isPygardonCatalog(new URL(response.url())),
  );
