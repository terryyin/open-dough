// This browser keeps the side panel's one preferred width
// (./sidePanelWidthPage.ts): chosen on the edge, a reload recovers it for
// either content, within the room there is now; a width the room or Maximize
// imposes never replaces it. Another browser, a refused storage or an unusable
// kept value starts at half the room, and the panel still resizes for the
// page's lifetime. Each test's browser context keeps its own storage; the real
// `claude` is never reached.

import type { Locator, Page } from "@playwright/test";
import { cardSessions, parts } from "./dashboardPage.ts";
import { watchPageErrors } from "./pageErrors.ts";
import { pressWhereShown } from "./pageLayout.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  control,
  dragEdge,
  expectEdgeSays,
  expectWidth,
  keyStep,
  resizeEdge,
  split,
  storyAWithSession,
  usableMinimum,
  wideWindow,
} from "./sidePanelWidthPage.ts";
import { expect, test } from "./support/preparationPage.ts";

const widthKey = "open-dough.sidePanel.width";

const storyA = (page: Page) =>
  parts(page).backlog.getByRole("article", { name: "Story A" });

async function openTerminal(page: Page) {
  await cardSessions(storyA(page))
    .getByRole("button", { name: "Open terminal" })
    .click();
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal.locator(".xterm-rows")).toContainText("attached");
  return terminal;
}

async function openReview(page: Page) {
  await storyA(page).getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(review).toBeVisible();
  return review;
}

async function expectHalfTheRoom(page: Page, panel: Locator) {
  await expect(resizeEdge(page)).toBeVisible();
  const { dashboard, panel: width } = await split(page, panel);
  expect(width).toBeCloseTo((dashboard + width) / 2, 0);
  await expectEdgeSays(page, Math.round((dashboard + width) / 2));
}

const keptWidth = (page: Page) =>
  page.evaluate((key) => window.localStorage.getItem(key), widthKey);

test("a width chosen on the terminal is recovered for a review after a reload, and another browser starts at half", async ({
  page,
  browser,
  dashboard,
  origin,
}) => {
  await storyAWithSession(page, dashboard, origin);
  const terminal = await openTerminal(page);
  await expectHalfTheRoom(page, terminal);
  const start = await split(page, terminal);
  const chosen = Math.round((start.dashboard + start.panel) / 2) + 200;
  await dragEdge(page, -200);
  await expectWidth(terminal, chosen);

  await test.step("reloaded, a review opens at the chosen width", async () => {
    await page.reload();
    const review = await openReview(page);
    await expectWidth(review, chosen);
    await expectEdgeSays(page, chosen);
    expect((await split(page, review)).dashboard).toBeCloseTo(
      start.dashboard + start.panel - chosen,
      0,
    );
  });

  await test.step("a fresh browser context keeps nothing and starts at half the room", async () => {
    const fresh = await browser.newContext({
      baseURL: dashboard.baseURL,
      viewport: wideWindow,
    });
    try {
      const other = await fresh.newPage();
      await other.goto("/");
      await expectHalfTheRoom(other, await openTerminal(other));
    } finally {
      await fresh.close();
    }
  });

  await test.step("the first browser still recovers its width", async () => {
    await page.reload();
    await expectWidth(await openTerminal(page), chosen);
  });
});

test("reloaded in less room the panel fits it, and neither that nor Maximize replaces the chosen width", async ({
  page,
  dashboard,
  origin,
}) => {
  await storyAWithSession(page, dashboard, origin);
  const terminal = await openTerminal(page);
  const start = await split(page, terminal);
  const chosen = Math.round((start.dashboard + start.panel) / 2) + 200;
  await dragEdge(page, -200);
  await expectWidth(terminal, chosen);
  expect(await keptWidth(page)).toBe(String(chosen));

  await test.step("in a smaller window the reloaded review takes only what the room allows", async () => {
    await page.setViewportSize({ width: 1000, height: wideWindow.height });
    await page.reload();
    const review = await openReview(page);
    const room = await split(page, review);
    const fitted = Math.floor(room.dashboard + room.panel - usableMinimum);
    expect(fitted).toBeLessThan(chosen);
    await expectWidth(review, fitted);
    await expectEdgeSays(page, fitted);
    await pressWhereShown(control(review, "Maximize"));
    await expect(resizeEdge(page)).toHaveCount(0);
    await pressWhereShown(control(review, "Restore"));
    await expectWidth(review, fitted);
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("reloaded in a narrow window the panel stacks with no edge", async () => {
    await page.setViewportSize({ width: 760, height: wideWindow.height });
    await page.reload();
    const review = await openReview(page);
    await expect(review).toBeVisible();
    await expect(resizeEdge(page)).toHaveCount(0);
    expect(await keptWidth(page)).toBe(String(chosen));
  });

  await test.step("a wide window recovers the chosen width, also after reloading while maximized", async () => {
    await page.setViewportSize(wideWindow);
    const review = page.getByRole("region", { name: "Review changes" });
    await expectWidth(review, chosen);
    await pressWhereShown(control(review, "Maximize"));
    await expect(resizeEdge(page)).toHaveCount(0);
    await page.reload();
    const reopened = await openTerminal(page);
    await expectWidth(reopened, chosen);
    await expectEdgeSays(page, chosen);
  });
});

test("an unusable kept width starts at half the room, leaving the other preferences, and the next choice is kept", async ({
  page,
  dashboard,
  origin,
}) => {
  await storyAWithSession(page, dashboard, origin);
  const errors = watchPageErrors(page);
  // The Sessions sidebar's own kept preference is untouched.
  await page.evaluate(() => {
    window.localStorage.setItem("open-dough.sessionSidebar.open", "true");
  });
  for (const malformed of ["wide", "0", "Infinity"]) {
    await test.step(`kept as ${JSON.stringify(malformed)}`, async () => {
      await page.evaluate(
        ([key, value]) => {
          window.localStorage.setItem(key, value);
        },
        [widthKey, malformed] as const,
      );
      await page.reload();
      await expect(sidebarParts(page).sidebar).toBeVisible();
      await expectHalfTheRoom(page, await openTerminal(page));
    });
  }
  const terminal = page.getByRole("region", { name: "Terminal" });
  const start = await split(page, terminal);
  await resizeEdge(page).focus();
  await page.keyboard.press("ArrowLeft");
  const chosen = start.panel + keyStep;
  await expectWidth(terminal, Math.round(chosen));
  await page.reload();
  await expectWidth(await openReview(page), Math.round(chosen));
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the panel starts at half the room and resizes for the page's lifetime without error", async ({
  page,
  dashboard,
  origin,
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
  await storyAWithSession(page, dashboard, origin);
  await expect(keptWidth(page)).rejects.toThrow("Storage is refused.");
  const terminal = await openTerminal(page);
  await expectHalfTheRoom(page, terminal);
  const start = await split(page, terminal);
  const chosen = Math.round((start.dashboard + start.panel) / 2) + 200;
  await dragEdge(page, -200);
  await expectWidth(terminal, chosen);
  await expectEdgeSays(page, chosen);
  await expectWidth(await openReview(page), chosen);
  await page.reload();
  await expectHalfTheRoom(page, await openTerminal(page));
  expect(errors).toEqual([]);
});
