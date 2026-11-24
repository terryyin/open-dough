// The kept Sessions sidebar height (./cursor-sessions-sidebar-size-kept.spec.ts)
// within the room there is now: less room fits the shown height, also after a
// reload, and a height the room imposes never replaces the kept one.
// Registered by ./cursor-sessions-sidebar-size-kept.spec.ts.
import {
  runningCursorSplit,
  wide,
} from "../../dashboard/test-support/cursorSessionsSidebarResizePage.ts";
import { runningCursorParts } from "../../dashboard/test-support/runningCursorList.ts";
import {
  listFloor as floor,
  showPage,
} from "../../dashboard/test-support/runningCursorSessionsPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";

test("less room fits the shown height, also after a reload, without replacing the kept one, and more room recovers it", async ({
  page,
  origin,
}) => {
  await showPage(page, origin);
  const shown = runningCursorParts(page);
  const split = runningCursorSplit(page, shown);
  const { button, header, divider } = shown;
  await button.click();
  await header.click();
  await expect(shown.body).toBeVisible();
  const room = await split.roomOf();
  // What the sidebar's heading, header and padding take from its height.
  const taken = wide.height - room;
  await split.dragDivider(-150);
  const chosen = await split.valueOf("aria-valuenow");
  expect(chosen).toBeGreaterThan(Math.round(room / 2) + 100);
  await split.expectSplit(room, chosen);
  const expectKept = async () => {
    expect(await split.keptHeight()).toBe(String(chosen));
  };
  await expectKept();
  const less = Math.ceil(taken + 2 * floor + 40);
  const fitted = Math.floor(less - taken - floor);
  expect(fitted).toBeLessThan(chosen);

  await test.step("less room fits the shown height and keeps the chosen one", async () => {
    await page.setViewportSize({ width: wide.width, height: less });
    await split.expectCursorHeight(less - taken, fitted);
    await expectKept();
  });

  await test.step("too little room for both floors offers no range and keeps the chosen one", async () => {
    await page.setViewportSize({
      width: wide.width,
      height: Math.floor(taken + 2 * floor - 40),
    });
    await expect(divider).toBeDisabled();
    await expectKept();
  });

  await test.step("reloaded in less room, expanding fits the room and keeps the chosen one", async () => {
    await page.setViewportSize({ width: wide.width, height: less });
    await page.reload();
    await split.expectCollapsed();
    await header.click();
    await split.expectCursorHeight(less - taken, fitted);
    await expectKept();
  });

  await test.step("more room recovers the chosen height", async () => {
    await page.setViewportSize(wide);
    await split.expectCursorHeight(room, chosen);
    await expectKept();
  });
});
