import { expect, test } from "./dashboardTest.ts";
import { boardScroll, bottomOf, scrollYOf, wheelTo } from "./boardPage.ts";
import {
  largeBacklog,
  publishLargeBacklog,
  queuedTitle,
  revision,
} from "./accessibleBoard.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { closeSidePanel } from "./pageLayout.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { expectReadingTop } from "./readingPlace.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { expectCovering } from "./sidePanelWidthPage.ts";
import { launched } from "./agentTerminalBoundary.ts";

test.use({ projectFolders: ["open-dough"] });

test("body reading keys use native Board scrolling while focused controls and modal help keep their keys", async ({
  page,
}) => {
  await publishLargeBacklog(page);
  await page.goto("/");
  await expectSettledPage(page);
  const readKey = (key: string) =>
    Promise.all([
      boardScroll(page).evaluate(
        (element) =>
          new Promise<void>((resolve) => {
            element.addEventListener(
              "scrollend",
              () => {
                resolve();
              },
              { once: true },
            );
          }),
      ),
      page.keyboard.press(key),
    ]);
  await readKey("End");
  await expect.poll(() => scrollYOf(page)).toBe(await bottomOf(page));
  await expect(parts(page).board).toBeFocused();
  await readKey("Home");
  await expect.poll(() => scrollYOf(page)).toBe(0);
  await readKey("PageDown");
  await expect.poll(() => scrollYOf(page)).toBeGreaterThan(0);
  const down = await scrollYOf(page);
  await readKey("PageUp");
  await expect.poll(() => scrollYOf(page)).toBeLessThan(down);
  const control = parts(page)
    .backlog.getByRole("button", { name: "Inspect story" })
    .first();
  await control.focus();
  await readKey("PageDown");
  await expect(control).toBeFocused();
  await wheelTo(page, 40);
  await parts(page).preparationHelp.click();
  const dialog = page.getByRole("dialog", { name: "Preparation badges" });
  const close = dialog.getByRole("button", { name: "Close", exact: true });
  await expect(close).toBeFocused();
  const before = await scrollYOf(page);
  expect(before).toBeGreaterThan(0);
  await page.keyboard.press("End");
  await expect(close).toBeFocused();
  expect(await scrollYOf(page)).toBe(before);
  await page.keyboard.press("Escape");
  await expect(parts(page).preparationHelp).toBeFocused();
  expect(await scrollYOf(page)).toBe(before);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

for (const viewport of [
  { width: 1400, height: 420 },
  { width: 700, height: 800 },
]) {
  test(`URL and Session entry reveal a tall card's top within the Board at ${viewport.width}×${viewport.height}`, async ({
    page,
    dashboard,
  }) => {
    await page.setViewportSize(viewport);
    dashboard.claudeScenario("launched");
    const identity = "SEED-18#story";
    const title = queuedTitle(8);
    await launched(dashboard, "open-dough", { identity, title });
    await publishFiles(page, {
      repository: "terryyin/open-dough",
      revision,
      files: {
        ".planning/PRODUCT-BACKLOG.md": largeBacklog,
        ".planning/seeds/SEED-18-queued.md": `---\nid: SEED-18\n---\n\n# Seed\n\n<a id="story"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\n**Goal:** ${"Read a long published goal without losing its beginning. ".repeat(80)}`,
      },
    });
    await page.goto(
      `/?${new URLSearchParams({ project: "open-dough", story: identity })}`,
    );
    await expectSettledPage(page);
    const card = parts(page).backlog.getByRole("article", {
      name: title,
      exact: true,
    });
    await expect(card).toBeFocused();
    await expectReadingTop(card);
    // A height-only resize can change sticky-heading clearance without
    // changing the row's content size. The reveal follows its own viewport.
    await page.setViewportSize({ ...viewport, height: viewport.height + 200 });
    await expectReadingTop(card);
    await page.setViewportSize(viewport);
    await expectReadingTop(card);
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry(title).click();
    const terminal = page.getByRole("region", {
      name: "Terminal",
      exact: true,
    });
    await expect(terminal.locator(".xterm-rows")).toContainText("attached");
    // Covering hides the Board; Close first, then read the revealed card
    // (./board-session-reading.spec.ts). Beside, the Board stays readable.
    if (viewport.width <= 800) {
      await expectCovering(terminal);
      await closeSidePanel(terminal);
      await expectReadingTop(card);
    } else {
      await expect(terminal.locator("textarea")).toBeFocused();
      await expectReadingTop(card);
      // Short beside window: the card still exceeds the Board's room.
      expect((await card.boundingBox())?.height).toBeGreaterThan(
        await boardScroll(page).evaluate((region) => region.clientHeight),
      );
    }
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });
}
