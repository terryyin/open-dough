// Three-list room for Recently done sessions with the open list and Running
// Cursor sessions: expand, resize, independent scroll, short window, reload.
import {
  dragDivider,
  expectDividerSays,
  heightOf,
  keyStep,
  press,
  valueOf,
  wide,
} from "./cursorSessionsSidebarResizePage.ts";
import {
  compactProjectSelectCut,
  expectEveryControlReachable,
  expectInside,
  expectNoSidewaysScrollAndWholeText,
} from "./pageLayout.ts";
import {
  listFloor as floor,
  scrollTopOf,
  wheelToEnd,
} from "./runningCursorSessionsPage.ts";
import {
  expandThreeCrowded,
  roomOfThree,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("both optional sections share one room: expand, resize, scroll, short window, and reload preference", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(180_000);
  const { shown, expectNothingChanged } = await expandThreeCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const { divider, header, list, body, running, openEntries, entries } = shown;
  const room = await roomOfThree(shown);
  const start = Math.round(room / 3);

  await test.step("the three lists share the room and each keeps a usable floor", async () => {
    expect(await heightOf(list)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(await heightOf(body)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(await heightOf(running.body)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(
      Math.abs(
        (await heightOf(list)) +
          (await heightOf(body)) +
          (await heightOf(running.body)) -
          room,
      ),
    ).toBeLessThanOrEqual(2);
  });

  await test.step("independent scrolling leaves the other lists where they were", async () => {
    for (const area of [list, body, running.body])
      await area.evaluate((element) => {
        element.scrollTo(0, 0);
      });
    const bodyTop = await scrollTopOf(body);
    const runningTop = await scrollTopOf(running.body);
    await wheelToEnd(page, list);
    await expectInside(openEntries.last(), list);
    expect(await scrollTopOf(body)).toBe(bodyTop);
    expect(await scrollTopOf(running.body)).toBe(runningTop);
    const listTop = await scrollTopOf(list);
    await wheelToEnd(page, body);
    await expectInside(entries.last(), body);
    expect(await scrollTopOf(list)).toBe(listTop);
    expect(await scrollTopOf(running.body)).toBe(runningTop);
  });

  await test.step("dragging or keying the Recently done divider resizes within floors", async () => {
    await expect(divider).toHaveAccessibleName(
      "Recently done sessions divider",
    );
    const before = await valueOf(divider, "aria-valuenow");
    await dragDivider(page, divider, 2000);
    await expectDividerSays(divider, floor);
    await divider.focus();
    await press(page, "ArrowUp", 3);
    await expectDividerSays(divider, floor + 3 * keyStep);
    expect(await heightOf(list)).toBeGreaterThanOrEqual(floor - 0.5);
    expect(before).toBeGreaterThan(0);
    expect(start).toBeGreaterThan(0);
  });

  await test.step("a short window keeps every header and list reachable", async () => {
    await page.setViewportSize({ width: 320, height: 256 });
    await expect(shown.sidebar).toBeVisible();
    // Entry titles are cut by design (./sessions-sidebar-row.spec.ts).
    await expectNoSidewaysScrollAndWholeText(page, [
      ".sessions-sidebar-session-entry-title",
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
    await expectDividerSays(divider, preferred);
    await page.reload();
    await expect(shown.sidebar).toBeVisible();
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await header.click();
    await running.header.click();
    await expectDividerSays(divider, preferred);
    expectNothingChanged();
  });
});
