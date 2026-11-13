import { expect, test } from "../dashboardTest.ts";
import { publishLargeBacklog } from "../accessibleBoard.ts";
import { scrollYOf } from "../boardPage.ts";
import {
  expectAtBoardBottom,
  expectDocumentStill,
  readWithKey,
} from "../boardReading.ts";
import { expectSettledPage, parts } from "../dashboardPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";

test("native modified reading keys move an unfocused Board and preserve modal and app shortcuts", async ({
  page,
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

  await publishLargeBacklog(page);
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
