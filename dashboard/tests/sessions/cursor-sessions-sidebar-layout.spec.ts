// Running Cursor sessions as a collapsible section of the Sessions sidebar,
// below its session list. Collapsed, only its header shows, and the session
// list fills the rest of the sidebar. Expanded, the session list and the
// section's content share the room equally, each scrolling on its own;
// collapsing gives the room back and leaves the keyboard on the header. A
// short, zoomed window keeps both lists and the header in reach by scrolling.
// Choosing a held row and keeping expansion across page changes are
// ./cursor-sessions-sidebar-navigation.spec.ts's. The crowded lists' saved
// sessions and runner answers are preconditions only.
import type { Locator } from "@playwright/test";
import {
  expectCollapsed,
  expectScrollsOnItsOwn,
  showCrowded,
} from "../cursorSessionsSidebarResizePage.ts";
import {
  box,
  compactProjectSelectCut,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
} from "../pageLayout.ts";
import {
  crowd,
  expectLastInReach,
  listFloor,
} from "../runningCursorSessionsPage.ts";
import { sessionsSidebarTitleCut } from "../sessionsSidebarPage.ts";
import { expect, test } from "../support/cursorStart.ts";

test.use({ cursorScreen: "working" });

// The bottom of the sidebar's content, inside its padding.
const contentBottom = (sidebar: Locator) =>
  sidebar.evaluate((element) => {
    const { bottom } = element.getBoundingClientRect();
    return bottom - parseFloat(getComputedStyle(element).paddingBottom);
  });

test("collapsed below the session list, expanded into two lists sharing the room and scrolling on their own, collapsed again with the keyboard on its header", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  const { shown, heldRows, expectNothingChanged } = await showCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const { sidebar, entries, heading, region, header, list, body } = shown;

  let collapsedList = 0;
  await test.step("collapsed, the header lies below the session list, which fills the rest of the sidebar", async () => {
    await expectCollapsed(shown);
    const [title, listed, section] = await Promise.all([
      box(heading),
      box(list),
      box(region),
    ]);
    expect(listed.y).toBeGreaterThanOrEqual(title.y + title.height);
    expect(section.y).toBeGreaterThanOrEqual(listed.y + listed.height);
    expect(section.y + section.height).toBeCloseTo(
      await contentBottom(sidebar),
      0,
    );
    collapsedList = listed.height;
  });

  await test.step("expanded with the keyboard, the two lists share the room equally, below one another", async () => {
    await header.focus();
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await expect(heldRows).toHaveCount(crowd);
    await expect(region).toContainText("The Cursor runner is running.");
    const [listed, shownHeader, content] = await Promise.all([
      box(list),
      box(header),
      box(body),
    ]);
    expect(shownHeader.y).toBeGreaterThanOrEqual(listed.y + listed.height);
    expect(content.y).toBeGreaterThanOrEqual(
      shownHeader.y + shownHeader.height,
    );
    expect(Math.abs(listed.height - content.height)).toBeLessThanOrEqual(1);
    expect(listed.height).toBeGreaterThanOrEqual(listFloor);
    expect(listed.height).toBeLessThan(collapsedList);
    expect(content.y + content.height).toBeCloseTo(
      await contentBottom(sidebar),
      0,
    );
    // The sidebar has room for both, so it does not scroll itself.
    expect(
      await sidebar.evaluate(
        (element) => element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
    // Ordinary entries stay the session list's own.
    await expect(entries).toHaveCount(crowd + 1);
  });

  await test.step("scrolling the Running Cursor sessions list reaches its last row and leaves the session list in place", async () => {
    const listBox = await box(list);
    const firstEntry = await box(entries.first());
    await expectScrollsOnItsOwn(body, heldRows.last(), [list]);
    await expect(heldRows.last()).toBeInViewport();
    expect(await box(list)).toEqual(listBox);
    expect(await box(entries.first())).toEqual(firstEntry);
  });

  await test.step("scrolling the session list reaches its last entry and leaves the Running Cursor sessions list in place", async () => {
    const bodyBox = await box(body);
    const lastRow = await box(heldRows.last());
    await expectScrollsOnItsOwn(list, entries.last(), [body]);
    await expect(entries.last()).toBeInViewport();
    expect(await box(body)).toEqual(bodyBox);
    expect(await box(heldRows.last())).toEqual(lastRow);
  });

  await test.step("collapsed with the keyboard, the session list takes the room back and the header keeps the keyboard", async () => {
    await header.focus();
    await page.keyboard.press("Space");
    await expectCollapsed(shown);
    await expect(header).toBeFocused();
    expect((await box(list)).height).toBeCloseTo(collapsedList, 0);
  });

  await test.step("in a short, zoomed window, both lists, their last entries, and the header stay in reach without sideways scrolling", async () => {
    await header.click();
    await expect(heldRows).toHaveCount(crowd);
    await page.setViewportSize({ width: 320, height: 256 });
    await expect(sidebar).toBeVisible();
    // An entry's title is cut by design (./sessions-sidebar-row.spec.ts).
    await expectNoSidewaysScrollAndWholeText(page, [
      sessionsSidebarTitleCut,
      ...compactProjectSelectCut,
    ]);
    for (const area of [list, body]) {
      expect((await box(area)).height).toBeGreaterThanOrEqual(listFloor - 1);
    }
    await expectEveryControlReachable(sidebar);
    await expectLastInReach([
      [list, entries.last()],
      [body, heldRows.last()],
    ]);
    await header.scrollIntoViewIfNeeded();
    await expect(header).toBeInViewport();
    await header.focus();
    await page.keyboard.press("Enter");
    await expectCollapsed(shown);
    await expect(header).toBeFocused();
  });

  // Only reads: the disclosure, scrolling, and resizing the window asked
  // for no launch, attach, done mark, delete, or runner control.
  expectNothingChanged();
});
