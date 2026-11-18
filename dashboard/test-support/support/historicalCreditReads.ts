// Observes the authenticated reads SessionAssignment asks for a saved
// revision's profiles and profile addition — the historical credit walk.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { authenticatedReadRoute } from "../holdAuthenticatedReads.ts";

export function collectAuthenticatedReads(page: Page): string[] {
  const reads: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === authenticatedReadEndpoint) {
      reads.push(request.url());
    }
  });
  return reads;
}

export function isHistoricalCreditRead(
  url: string,
  revision?: string,
): boolean {
  const query = new URL(url).searchParams;
  if (revision !== undefined && query.get("revision") !== revision) {
    return false;
  }
  return (
    query.get("agents") === "profiles" || query.get("committed") === "added"
  );
}

export function historicalCreditReads(
  urls: readonly string[],
  revision: string,
): string[] {
  return urls.filter((url) => isHistoricalCreditRead(url, revision));
}

export function profileListingsAt(
  urls: readonly string[],
  revision: string,
): string[] {
  return urls.filter((url) => {
    const query = new URL(url).searchParams;
    return (
      query.get("revision") === revision && query.get("agents") === "profiles"
    );
  });
}

export function readsAtRevision(
  urls: readonly string[],
  revision: string,
): string[] {
  return urls.filter(
    (url) => new URL(url).searchParams.get("revision") === revision,
  );
}

// Holds the first historical-credit request at `revision` until release.
export async function holdFirstHistoricalCreditRead(
  page: Page,
  revision: string,
): Promise<{ release: () => void }> {
  let releaseHeld: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    releaseHeld = resolve;
  });
  let holding = true;
  await page.route(authenticatedReadRoute, async (route) => {
    if (holding && isHistoricalCreditRead(route.request().url(), revision)) {
      holding = false;
      await held;
      await route.fallback();
      return;
    }
    await route.fallback();
  });
  return { release: releaseHeld };
}

// Fails the first historical-credit request at `revision`, then passes through.
export async function failFirstHistoricalCreditRead(
  page: Page,
  revision: string,
): Promise<void> {
  let failOnce = true;
  await page.route(authenticatedReadRoute, async (route) => {
    if (failOnce && isHistoricalCreditRead(route.request().url(), revision)) {
      failOnce = false;
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "saved revision unavailable" }),
      });
      return;
    }
    await route.fallback();
  });
}
