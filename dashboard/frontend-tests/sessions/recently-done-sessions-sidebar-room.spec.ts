// Three-list room for Recently done sessions with the open list and Running
// Cursor sessions against controlled machine and Cursor-runner answers:
// expand, resize, independent scroll, short window, reload.
import {
  keyStep,
  sidebarListDivider,
  wide,
} from "../../tests/cursorSessionsSidebarResizePage.ts";
import {
  compactProjectSelectCut,
  expectEveryControlReachable,
  expectInside,
  expectNoSidewaysScrollAndWholeText,
} from "../../tests/pageLayout.ts";
import {
  crowd,
  listFloor as floor,
  scrollTopOf,
  wheelToEnd,
} from "../../tests/runningCursorSessionsPage.ts";
import { roomOfThree } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import { sessionsSidebarTitleCut } from "../../tests/sessionsSidebarPage.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { expandThreeCrowdedFrontend } from "../../tests/support/frontendRecentlyDoneSidebar.ts";

test("both optional sections share one room: expand, resize, scroll, short window, and reload preference", async ({
  page,
  frontendServices,
}) => {
  const { shown, expectNothingChanged } = await expandThreeCrowdedFrontend(
    page,
    frontendServices,
  );
  const resize = sidebarListDivider(page, shown.divider);
  const { header, list, body, running, openEntries, entries } = shown;
  const room = await roomOfThree(shown);
  const start = Math.round(room / 3);

  await test.step("the three lists share the room and each keeps a usable floor", async () => {
    expect(await resize.heightOf(list)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(await resize.heightOf(body)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(await resize.heightOf(running.body)).toBeGreaterThanOrEqual(
      floor - 0.5,
    );
    expect(
      Math.abs(
        (await resize.heightOf(list)) +
          (await resize.heightOf(body)) +
          (await resize.heightOf(running.body)) -
          room,
      ),
    ).toBeLessThanOrEqual(2);
  });

  await test.step("independent scrolling leaves the other lists where they were", async () => {
    for (const area of [list, body, running.body])
      await area.evaluate((element) => {
        element.scrollTo(0, 0);
      });
    await resize.expectScrollsOnItsOwn(list, openEntries.last(), [
      body,
      running.body,
    ]);
    const listTop = await scrollTopOf(list);
    const runningTop = await scrollTopOf(running.body);
    await wheelToEnd(page, body);
    await expect(entries).toHaveCount(crowd);
    await wheelToEnd(page, body);
    await expectInside(entries.last(), body);
    expect(await scrollTopOf(list)).toBe(listTop);
    expect(await scrollTopOf(running.body)).toBe(runningTop);
  });

  await test.step("dragging or keying the Recently done divider resizes within floors", async () => {
    await expect(shown.divider).toHaveAccessibleName(
      "Recently done sessions divider",
    );
    const before = await resize.valueOf("aria-valuenow");
    await resize.dragDivider(2000);
    await resize.expectDividerSays(floor);
    await resize.keyDivider("ArrowUp", 3);
    await resize.expectDividerSays(floor + 3 * keyStep);
    expect(await resize.heightOf(list)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(before).toBeGreaterThan(0);
    expect(start).toBeGreaterThan(0);
  });

  await test.step("a short window keeps every header and list reachable", async () => {
    await page.setViewportSize({ width: 320, height: 256 });
    await expect(shown.sidebar).toBeVisible();
    await expectNoSidewaysScrollAndWholeText(page, [
      sessionsSidebarTitleCut,
      ...compactProjectSelectCut,
    ]);
    await expectEveryControlReachable(shown.sidebar);
    await header.scrollIntoViewIfNeeded();
    await expect(header).toBeInViewport();
    await running.header.scrollIntoViewIfNeeded();
    await expect(running.header).toBeInViewport();
  });

  await test.step("reload keeps preferred sizes and starts Recently done collapsed", async () => {
    await page.setViewportSize(wide);
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await expect(running.header).toHaveAttribute("aria-expanded", "true");
    const preferred = floor + 3 * keyStep;
    await resize.expectDividerSays(preferred);
    await page.reload();
    await expect(shown.sidebar).toBeVisible();
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await header.click();
    await running.header.click();
    await resize.expectDividerSays(preferred);
    expectNothingChanged();
  });
});
