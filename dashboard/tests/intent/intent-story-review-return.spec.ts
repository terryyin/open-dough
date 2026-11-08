// Closing Review changes opened by keyboard from the selected story's header
// in Intent clears the selected story (ADR 0008); Intent shows no Board, so
// the keyboard returns to Intent's chosen reading-mode tab above the CI
// status Intent then shows (../../src/storyCardFocus.ts,
// ../../src/IntentModeTabs.tsx). The header's count:
// ./intent-story-changes.spec.ts.

import { ciPanel } from "../intentCiStatusPage.ts";
import { intentModeTab } from "../intentModePage.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  expectOutsideCount,
  outsideCount,
  selectTakenStoryInIntent,
  storySummary,
} from "../support/intentStoryPage.ts";

test("closing Review changes opened by keyboard from the header returns the keyboard to Intent's reading-mode tab above its CI status", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(page, origin);
  await expectOutsideCount(intent, 2);
  await outsideCount(intent).focus();
  await page.keyboard.press("Enter");
  const review = page.getByRole("region", { name: "Story review" });
  await expect(review.locator(".story-review-files")).toBeVisible();
  await review.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(review).toHaveCount(0);

  await expect(intent).not.toHaveAttribute("data-selected-story");
  await expect(storySummary(intent)).toHaveCount(0);
  const home = intentModeTab(intent, "Intent");
  await expect(home).toBeFocused();
  await expect(home).toHaveAttribute("aria-selected", "true");
  await expect(ciPanel(intent)).toBeVisible();
  await expect(ciPanel(intent)).toContainText("CI status of main");
});
