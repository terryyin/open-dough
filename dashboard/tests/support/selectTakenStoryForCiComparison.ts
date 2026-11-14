// Select a Taken Story A and open Intent's CI timing comparison panel for
// the Taken provisional journeys in ../../../e2e/intent/intent-ci-comparison-taken.spec.ts.

import { expect } from "./preparationPage.ts";
import { parts } from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import { expectStoryTab } from "./intentStoryPage.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { emptyArea, expectSelected } from "../storyCardSelection.ts";
import { storyCard } from "../storyCardControls.ts";

export async function selectTakenStoryForCiComparison(
  page: import("@playwright/test").Page,
  title = "Story A",
) {
  await page.goto("/");
  await showColumn(page, "Taken");
  const { taken, intentChoice, intent } = parts(page);
  const card = storyCard(taken, title);
  await emptyArea(card).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  // A new selection opens the story at its CI comparison.
  await expectStoryTab(intent, "CI comparison");
  const panel = intent.getByRole("region", {
    name: "CI timing comparison",
    exact: true,
  });
  await expect(panel).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  await expect(panel.locator(".intent-ci-reading")).toHaveCount(0, {
    timeout: readWaitLimitMs + 15_000,
  });
  // Wait until a resolved comparison table is present (not a transient abort
  // gap from an earlier head observation while the tip is still settling).
  await expect(panel.locator(".intent-ci-comparison")).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  const status = intent.getByRole("region", { name: "CI status", exact: true });
  return { intent, status, panel, card };
}
