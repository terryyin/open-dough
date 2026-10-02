// Accessibility proof for published dependency facts on a consumer card.
import { expect, type Locator, type Page } from "@playwright/test";
import {
  expectFocusedAndIndicated,
  expectReadableContrast,
  zoomedWindow,
} from "./accessibleReading.ts";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import {
  suppliers,
  reason,
  condition,
  decision,
} from "./storyDependencyFixture.ts";

export async function expectDependencyAccessibly(
  page: Page,
  card: Locator,
  revision: string,
) {
  const summary = card.locator(".story-dependencies summary");
  const list = card.getByRole("list", { name: "Story dependencies" });
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
  await expect(
    list.getByRole("link", { name: suppliers[0].identity }),
  ).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md#b`,
  );
  expect((await summary.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expectReadableContrast(summary);
  await page.setViewportSize(zoomedWindow);
  await expectNoSidewaysScrollAndWholeText(page);
  await summary.scrollIntoViewIfNeeded();
  await expect(summary).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Space");
  await expect(list).not.toBeVisible();
  await summary.tap();
  await expect(list).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
}
