// Reading keys move the Board natively: from the body, End, Home, PageDown
// and PageUp scroll the Board and hand it the keyboard, as the platform's
// modified reading keys do for an unfocused Board, while a focused control,
// modal help and app shortcuts keep their keys and the document stays still.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { publishLargeBacklog } from "../../test-support/accessibleBoard.ts";
import { scrollYOf, wheelTo } from "../../test-support/boardPage.ts";
import {
  expectAtBoardBottom,
  expectDocumentStill,
  readWithKey,
} from "../../test-support/boardReading.ts";
import { expectSettledPage, parts } from "../../test-support/dashboardPage.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";

test("body reading keys use native Board scrolling while focused controls and modal help keep their keys", async ({
  page,
  frontendServices,
}) => {
  publishLargeBacklog(frontendServices);
  await page.goto("/");
  await expectSettledPage(page);
  // The body holds the keyboard: End hands it to the Board as it scrolls.
  await readWithKey(page, "End");
  await expectAtBoardBottom(page);
  await expect(parts(page).board).toBeFocused();
  await readWithKey(page, "Home");
  await expect.poll(() => scrollYOf(page)).toBe(0);
  await readWithKey(page, "PageDown");
  await expect.poll(() => scrollYOf(page)).toBeGreaterThan(0);
  const down = await scrollYOf(page);
  await readWithKey(page, "PageUp");
  await expect.poll(() => scrollYOf(page)).toBeLessThan(down);
  const control = parts(page)
    .backlog.getByRole("button", { name: "Inspect story" })
    .first();
  await control.focus();
  await readWithKey(page, "PageDown");
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
  await expectDocumentStill(page);
});

test("native modified reading keys move an unfocused Board and preserve modal and app shortcuts", async ({
  page,
  frontendServices,
}) => {
  const down = process.platform === "darwin" ? "Meta+ArrowDown" : "Control+End";
  const up = process.platform === "darwin" ? "Meta+ArrowUp" : "Control+Home";
  // Compare against the browser's ordinary document scrolling on this host.
  await page.setContent(
    '<main style="height: 5000px">Native document reading</main>',
  );
  const end = await page.evaluate(
    () => document.documentElement.scrollHeight - innerHeight,
  );
  await readWithKey(page, down, "document");
  expect(await page.evaluate(() => scrollY)).toBe(end);
  await readWithKey(page, up, "document");
  expect(await page.evaluate(() => scrollY)).toBe(0);

  publishLargeBacklog(frontendServices);
  await page.goto("/");
  await expectSettledPage(page);
  await readWithKey(page, down);
  await expect(parts(page).board).toBeFocused();
  await expectAtBoardBottom(page);
  await parts(page).board.evaluate((element) => {
    (element as HTMLElement).blur();
  });
  await expect(page.locator("body")).toBeFocused();
  await readWithKey(page, up);
  await expect(parts(page).board).toBeFocused();
  expect(await scrollYOf(page)).toBe(0);
  await expectDocumentStill(page);

  await parts(page).preparationHelp.click();
  const close = page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true });
  await expect(close).toBeFocused();
  const position = await scrollYOf(page);
  await page.keyboard.press(down);
  await expect(close).toBeFocused();
  expect(await scrollYOf(page)).toBe(position);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Meta+b");
  await expect(sessionsSidebarParts(page).sidebar).toBeVisible();
  await page.keyboard.press("Meta+b");
  await expect(sessionsSidebarParts(page).sidebar).toBeHidden();
  expect(await scrollYOf(page)).toBe(position);
});
