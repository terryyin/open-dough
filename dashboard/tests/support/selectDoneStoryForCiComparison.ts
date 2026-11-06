// Select a Recently done Story A and open Intent's CI status panel for the
// comparison journeys in ../intent-ci-comparison*.spec.ts.

import { expect } from "./preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { expectSelected } from "../storyCardSelection.ts";

export async function selectDoneStoryForCiComparison(
  page: import("@playwright/test").Page,
) {
  await page.goto("/");
  await showColumn(page, "Recently done");
  const { recentlyDone, intentChoice, intent } = parts(page);
  const card = recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  await expect(panel).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  // Comparison walks many head_sha lookups; wait through the shared read bound.
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  return { intent, panel, card };
}
