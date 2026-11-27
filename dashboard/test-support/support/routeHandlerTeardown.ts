// How a test's page finishes its intercepted reads before the context that
// owns their answers is torn down (./pageTest.ts): a page still open waits
// for every route handler it has started; a spec that closed its page has no
// handler left to finish.

import type { Page } from "@playwright/test";

export type RoutedPage = Pick<Page, "isClosed" | "unrouteAll">;

export async function finishRouteHandlers(page: RoutedPage): Promise<void> {
  if (!page.isClosed()) await page.unrouteAll({ behavior: "wait" });
}
