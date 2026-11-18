// This browser keeps the side panel's one preferred width
// (../../test-support/sidePanelWidthPage.ts): chosen on the divider, a reload
// recovers it within the room there is now; a width the room or Maximize
// imposes never replaces it. No kept value, a refused storage or an unusable
// kept value starts at half the room, and the panel still resizes for the
// page's lifetime.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendServiceSubstitutes } from "../../test-support/support/frontendServiceSubstitutes.ts";
import { installFrontendStoryReview } from "../../test-support/support/frontendStoryReview.ts";
import { watchPageErrors } from "../../test-support/pageErrors.ts";
import { reviewRegion } from "../../test-support/support/reviewControls.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import { sidePanelWidthPage } from "../../test-support/sidePanelWidthPage.ts";
import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../test-support/sidePanelFrame.ts";
import {
  expectHalfTheRoom,
  keptWidth,
  openReview,
  reloadAndOpenReview,
  takenStoryWithReview,
  widthKey,
} from "../../test-support/support/frontendSidePanelWidth.ts";

test("a chosen width is recovered after a reload, and neither less room nor Maximize replaces it", async ({
  page,
  browser,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  await takenStoryWithReview(page, frontendServices);
  const review = await openReview(page);
  await expectHalfTheRoom(page, review);
  const start = await width.split(review);
  const chosen = Math.round((start.pageColumn + start.sidePanel) / 2) + 200;
  await width.dragDivider(-200);
  await width.expectWidth(review, chosen);
  expect(await keptWidth(page)).toBe(String(chosen));

  await test.step("reloaded, the review opens at the chosen width", async () => {
    const reopened = await reloadAndOpenReview(page);
    await width.expectWidth(reopened, chosen);
    await width.expectDividerSays(chosen);
    expect((await width.split(reopened)).pageColumn).toBeCloseTo(
      start.pageColumn + start.sidePanel - chosen,
      0,
    );
  });

  await test.step("a fresh browser context keeps nothing and starts at half the room", async () => {
    const fresh = await browser.newContext({ viewport: width.wideWindow });
    try {
      const other = await fresh.newPage();
      await installFrontendServiceSubstitutes(other, frontendServices);
      await installFrontendStoryReview(other);
      await openFrontendTakenBacklog(other);
      await expectHalfTheRoom(other, await openReview(other));
    } finally {
      await fresh.close();
    }
  });

  await test.step("in a smaller window the reloaded review takes only what the room allows", async () => {
    await page.setViewportSize({
      width: 1000,
      height: width.wideWindow.height,
    });
    const reopened = await reloadAndOpenReview(page);
    const room = await width.split(reopened);
    const fitted = Math.floor(
      room.pageColumn + room.sidePanel - width.usableMinimum,
    );
    expect(fitted).toBeLessThan(chosen);
    await width.expectWidth(reopened, fitted);
    await width.expectDividerSays(fitted);
    await maximizeSidePanel(reopened);
    await expect(width.divider).toHaveCount(0);
    await restoreSidePanel(reopened);
    await width.expectWidth(reopened, fitted);
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("reloaded in a narrow window the panel covers with no divider or Maximize", async () => {
    await page.setViewportSize({ width: 760, height: width.wideWindow.height });
    await width.expectCovering(await reloadAndOpenReview(page));
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("a wide window recovers the chosen width, also after reloading while maximized", async () => {
    await page.setViewportSize(width.wideWindow);
    const shown = reviewRegion(page, { exact: true });
    await width.expectWidth(shown, chosen);
    await maximizeSidePanel(shown);
    await expect(width.divider).toHaveCount(0);
    const reopened = await reloadAndOpenReview(page);
    await width.expectWidth(reopened, chosen);
    await width.expectDividerSays(chosen);
  });
});

test("an unusable kept width starts at half the room, leaving the other preferences, and the next choice is kept", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  await takenStoryWithReview(page, frontendServices);
  const errors = watchPageErrors(page);
  // The Sessions sidebar's own kept preference is untouched.
  await page.evaluate(() => {
    window.localStorage.setItem("open-dough.sessionsSidebar.open", "true");
  });
  for (const malformed of ["wide", "0", "Infinity"]) {
    await test.step(`kept as ${JSON.stringify(malformed)}`, async () => {
      await page.evaluate(
        ([key, value]) => {
          window.localStorage.setItem(key, value);
        },
        [widthKey, malformed] as const,
      );
      const review = await reloadAndOpenReview(page);
      await expect(sessionsSidebarParts(page).sidebar).toBeVisible();
      await expectHalfTheRoom(page, review);
    });
  }
  const review = reviewRegion(page, { exact: true });
  const start = await width.split(review);
  await width.focusDivider();
  await width.pressDividerKey("ArrowLeft");
  const chosen = Math.round(start.sidePanel + width.keyStep);
  await width.expectWidth(review, chosen);
  await width.expectWidth(await reloadAndOpenReview(page), chosen);
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the panel starts at half the room and resizes for the page's lifetime without error", async ({
  page,
  frontendServices,
}) => {
  const width = sidePanelWidthPage(page);
  await page.addInitScript(() => {
    const refused = () => {
      throw new DOMException("Storage is refused.", "SecurityError");
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refused,
    });
  });
  const errors = watchPageErrors(page);
  await takenStoryWithReview(page, frontendServices);
  await expect(keptWidth(page)).rejects.toThrow("Storage is refused.");
  const review = await openReview(page);
  await expectHalfTheRoom(page, review);
  const start = await width.split(review);
  const chosen = Math.round((start.pageColumn + start.sidePanel) / 2) + 200;
  await width.dragDivider(-200);
  await width.expectWidth(review, chosen);
  await width.expectDividerSays(chosen);
  await expectHalfTheRoom(page, await reloadAndOpenReview(page));
  expect(errors).toEqual([]);
});
