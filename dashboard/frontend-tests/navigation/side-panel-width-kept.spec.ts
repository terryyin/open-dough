// This browser keeps the side panel's one preferred width
// (../../tests/sidePanelWidthPage.ts): chosen on the divider, a reload
// recovers it within the room there is now; a width the room or Maximize
// imposes never replaces it. No kept value, a refused storage or an unusable
// kept value starts at half the room, and the panel still resizes for the
// page's lifetime.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendServiceSubstitutes } from "../../tests/support/frontendServiceSubstitutes.ts";
import { installFrontendStoryReview } from "../../tests/support/frontendStoryReview.ts";
import { watchPageErrors } from "../../tests/pageErrors.ts";
import { reviewRegion } from "../../tests/support/reviewControls.ts";
import { sessionsSidebarParts } from "../../tests/sessionsSidebarPage.ts";
import {
  dragDivider,
  expectCovering,
  expectDividerSays,
  expectWidth,
  focusDivider,
  keyStep,
  panelDivider,
  pressDividerKey,
  split,
  usableMinimum,
  wideWindow,
} from "../../tests/sidePanelWidthPage.ts";
import {
  maximizeSidePanel,
  restoreSidePanel,
} from "../../tests/sidePanelFrame.ts";
import {
  expectHalfTheRoom,
  keptWidth,
  openReview,
  reloadAndOpenReview,
  takenStoryWithReview,
  widthKey,
} from "../../tests/support/frontendSidePanelWidth.ts";

test("a chosen width is recovered after a reload, and neither less room nor Maximize replaces it", async ({
  page,
  browser,
  frontendServices,
}) => {
  await takenStoryWithReview(page, frontendServices);
  const review = await openReview(page);
  await expectHalfTheRoom(page, review);
  const start = await split(page, review);
  const chosen = Math.round((start.pageColumn + start.sidePanel) / 2) + 200;
  await dragDivider(page, -200);
  await expectWidth(review, chosen);
  expect(await keptWidth(page)).toBe(String(chosen));

  await test.step("reloaded, the review opens at the chosen width", async () => {
    const reopened = await reloadAndOpenReview(page);
    await expectWidth(reopened, chosen);
    await expectDividerSays(page, chosen);
    expect((await split(page, reopened)).pageColumn).toBeCloseTo(
      start.pageColumn + start.sidePanel - chosen,
      0,
    );
  });

  await test.step("a fresh browser context keeps nothing and starts at half the room", async () => {
    const fresh = await browser.newContext({ viewport: wideWindow });
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
    await page.setViewportSize({ width: 1000, height: wideWindow.height });
    const reopened = await reloadAndOpenReview(page);
    const room = await split(page, reopened);
    const fitted = Math.floor(room.pageColumn + room.sidePanel - usableMinimum);
    expect(fitted).toBeLessThan(chosen);
    await expectWidth(reopened, fitted);
    await expectDividerSays(page, fitted);
    await maximizeSidePanel(reopened);
    await expect(panelDivider(page)).toHaveCount(0);
    await restoreSidePanel(reopened);
    await expectWidth(reopened, fitted);
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("reloaded in a narrow window the panel covers with no divider or Maximize", async () => {
    await page.setViewportSize({ width: 760, height: wideWindow.height });
    await expectCovering(await reloadAndOpenReview(page));
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("a wide window recovers the chosen width, also after reloading while maximized", async () => {
    await page.setViewportSize(wideWindow);
    const shown = reviewRegion(page, { exact: true });
    await expectWidth(shown, chosen);
    await maximizeSidePanel(shown);
    await expect(panelDivider(page)).toHaveCount(0);
    const reopened = await reloadAndOpenReview(page);
    await expectWidth(reopened, chosen);
    await expectDividerSays(page, chosen);
  });
});

test("an unusable kept width starts at half the room, leaving the other preferences, and the next choice is kept", async ({
  page,
  frontendServices,
}) => {
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
  const start = await split(page, review);
  await focusDivider(page);
  await pressDividerKey(page, "ArrowLeft");
  const chosen = Math.round(start.sidePanel + keyStep);
  await expectWidth(review, chosen);
  await expectWidth(await reloadAndOpenReview(page), chosen);
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the panel starts at half the room and resizes for the page's lifetime without error", async ({
  page,
  frontendServices,
}) => {
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
  const start = await split(page, review);
  const chosen = Math.round((start.pageColumn + start.sidePanel) / 2) + 200;
  await dragDivider(page, -200);
  await expectWidth(review, chosen);
  await expectDividerSays(page, chosen);
  await expectHalfTheRoom(page, await reloadAndOpenReview(page));
  expect(errors).toEqual([]);
});
