// Select a Recently done Story A and open Intent's CI status panel for the
// comparison journeys in ../intent-ci-comparison*.spec.ts.

import { expect } from "./preparationPage.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { selectDoneStoryInIntent } from "./selectDoneStoryInIntent.ts";

export async function selectDoneStoryForCiComparison(
  page: import("@playwright/test").Page,
  address = "/",
) {
  const selected = await selectDoneStoryInIntent(
    page,
    undefined,
    undefined,
    address,
  );
  const { panel } = selected;
  await expect(panel).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  // Comparison walks many head_sha lookups; wait through the shared read bound.
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  return selected;
}
