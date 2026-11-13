// Accessibility proof for published dependency facts on a consumer card.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  expectFocusedAndIndicated,
  expectReadableContrast,
  zoomedWindow,
} from "./accessibleReading.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "./pageLayout.ts";
import { reason, condition, decision } from "./storyDependencyFixture.ts";
import {
  dependencyList,
  dependencySummary,
  followReference,
  storyReference,
} from "./storyReference.ts";
import { storyCard } from "./storyCardControls.ts";
import { parts } from "./dashboardParts.ts";

export async function expectDependencyAccessibly(
  page: Page,
  card: Locator,
  revision: string,
) {
  const summary = dependencySummary(card);
  const list = dependencyList(card);
  await summary.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expectFocusedAndIndicated(page, summary);
  await page.keyboard.press("Space");
  await expect(list).toBeVisible();
  await expect(list).toContainText(reason);
  await expect(list).toContainText(condition);
  await expect(list).toContainText("Waiting");
  await expect(list).toContainText("Decision needed");
  await expect(list).toContainText(decision);
  await expect(storyReference(card, "Story B")).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md#b`,
  );
  await followReference(card, "Story B", "keyboard");
  const supplier = storyCard(parts(page).board, "Story B");
  await expect(supplier).toBeFocused();
  await expect(
    supplier.getByRole("region", { name: "Detail for Story B" }),
  ).toBeVisible();
  await summary.focus();
  expect((await summary.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expectReadableContrast(summary);
  await page.setViewportSize(zoomedWindow);
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  await summary.scrollIntoViewIfNeeded();
  await expect(summary).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Space");
  await expect(list).not.toBeVisible();
  await summary.tap();
  await expect(list).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
}
