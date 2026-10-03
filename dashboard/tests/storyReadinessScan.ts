// The story readiness scan view at reading widths: a card reads whole beside
// its badges, and the keyboard goes from the card to its detail and back.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  expectFocusedAndIndicated,
  narrowWindow,
  twiceZoomedWindow,
} from "./accessibleReading.ts";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import { plannedBlocked, plannedReady } from "./storyReadinessFixture.ts";

// At 420px and at the 640x450 proxy for 200% browser zoom, a card's scan view
// reads whole beside its badges, and the keyboard goes from Inspect story to
// the detail's source links and back to the card.
export async function expectScanToDetailAt420AndTwiceZoom(
  page: Page,
  taken: Locator,
  backlog: Locator,
) {
  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  const blockedCard = backlog.getByRole("article", {
    name: plannedBlocked.title,
  });
  for (const window of [narrowWindow, twiceZoomedWindow]) {
    await page.setViewportSize(window);
    const hide = readyCard.getByRole("button", { name: "Hide detail" });
    if ((await hide.count()) > 0) {
      await hide.focus();
      await page.keyboard.press("Enter");
    }
    await expectNoSidewaysScrollAndWholeText(page);
    await expect(
      readyCard.getByRole("heading", { name: plannedReady.title }),
    ).toBeVisible();
    await expect(readyCard).toContainText("0 of 5 slices recorded complete");
    await expect(
      readyCard.getByText("Ready for execution", { exact: true }),
    ).toBeVisible();
    await expect(blockedCard.getByText("Priority 2")).toBeVisible();
    await expect(
      blockedCard.getByText("Not ready", { exact: true }),
    ).toBeVisible();
    // Secondary facts wait in the detail.
    await expect(readyCard).not.toContainText(plannedReady.identity);
    await expect(readyCard.getByRole("link")).toHaveCount(0);

    // From the card, the keyboard reaches its Inspect story.
    const inspect = readyCard.getByRole("button", { name: "Inspect story" });
    await readyCard.focus();
    await page.keyboard.press("Tab");
    await expectFocusedAndIndicated(page, inspect);
    await page.keyboard.press("Enter");
    const detail = readyCard.getByRole("region", {
      name: `Detail for ${plannedReady.title}`,
    });
    await expect(detail).toContainText(plannedReady.identity);
    const canonical = detail.getByRole("link", { name: /^Canonical record/ });
    await page.keyboard.press("Tab");
    await expect(canonical).toBeInViewport({ ratio: 1 });
    await expectFocusedAndIndicated(page, canonical);
    await expectNoSidewaysScrollAndWholeText(page);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");
    await expect(detail).toHaveCount(0);
    await expectFocusedAndIndicated(page, readyCard);
  }
}
