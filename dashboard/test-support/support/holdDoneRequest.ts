// Holds the page's Mark as done POSTs so a journey can observe marking,
// Maximize/Close, or the wait bound before the boundary answers.

import type { Page, Route } from "@playwright/test";
import { agentDoneEndpoint } from "../../src/doneMark.ts";

// Holds each done request until released, then lets it reach the boundary.
// `held` settles with the pending Playwright route when the page posts.
export async function holdDoneRequestRoute(
  page: Page,
): Promise<{ release: () => void; held: Promise<Route> }> {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  let resolveHeld: (route: Route) => void = () => {};
  const held = new Promise<Route>((resolve) => {
    resolveHeld = resolve;
  });
  await page.route(`**${agentDoneEndpoint}`, async (route) => {
    resolveHeld(route);
    await released;
    await route.continue();
  });
  return { release, held };
}

// Holds done requests until released when the journey does not need the route.
export async function holdDoneRequests(page: Page): Promise<() => void> {
  const { release } = await holdDoneRequestRoute(page);
  return release;
}
