// Running Cursor sessions as a collapsible section of the Sessions sidebar,
// below its session list. Collapsed, only its header shows, and the session
// list fills the rest of the sidebar. Expanded, the session list and the
// section's content share the room equally, each scrolling on its own;
// collapsing gives the room back and leaves the keyboard on the header. A
// short, zoomed window keeps both lists and the header in reach by scrolling.
// Choosing a held row and keeping expansion across page changes are
// ./cursor-sidebar-panels-navigation.spec.ts's. The crowded lists' saved
// sessions and runner answers are preconditions only.
import type { Locator, Page } from "@playwright/test";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
} from "./pageLayout.ts";
import {
  changesAsked,
  holdSession,
  runningCursorParts,
  showPage,
} from "./runningCursorSessionsPage.ts";
import { expect, keptRecord, test } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";

const rem = 16;
const floor = 8 * rem;
const crowd = 30;

test.use({ cursorScreen: "working" });

// Many saved sessions beside the held one, for the session list to overflow.
async function keepCrowd(dashboard: DashboardServer, held: LaunchRecord) {
  const now = Date.now();
  const saved = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const name = `Crowded session ${String(index + 1)}`;
    const launchedAt = new Date(now - (index + 1) * 60_000).toISOString();
    const sessionId = dashboard.claudeListsSession({
      name,
      cwd: dashboard.home,
      startedAt: Date.parse(launchedAt),
    });
    return {
      request: {
        source: "open-dough",
        workflow: "ad-hoc",
        title: name,
        host: "claude",
      },
      session: {
        host: "claude",
        sessionId,
        shortId: sessionId.slice(0, 8),
        name,
      },
      launchedAt,
    };
  });
  await keepLaunchRecords(dashboard, [held, ...saved]);
}

// The runner answers with as many held sessions, for its list to overflow.
async function answerCrowd(page: Page, held: LaunchRecord) {
  const sessions = Array.from(Array(crowd).keys(), (index) => ({
    record: {
      ...held,
      session: {
        ...held.session,
        sessionId: `6f1e8c2a-9b34-4d5e-8f70-${String(index).padStart(12, "0")}`,
      },
    },
    label: "working",
  }));
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    (route) => route.fulfill({ json: { runner: "running", sessions } }),
  );
}

const scrollTopOf = (area: Locator) => area.evaluate((at) => at.scrollTop);

// Scrolls the area with the mouse wheel until it can scroll no further.
async function wheelToEnd(page: Page, area: Locator) {
  const at = await box(area);
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await expect
    .poll(async () => {
      await page.mouse.wheel(0, 600);
      return area.evaluate(
        (element) =>
          element.scrollTop + element.clientHeight >= element.scrollHeight - 1,
      );
    })
    .toBe(true);
}

async function expectInside(inner: Locator, outer: Locator) {
  const [shown, around] = await Promise.all([box(inner), box(outer)]);
  expect(shown.y).toBeGreaterThanOrEqual(around.y - 1);
  expect(shown.y + shown.height).toBeLessThanOrEqual(
    around.y + around.height + 1,
  );
}

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
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await holdSession(dashboard, cursor);
  const held = keptRecord(dashboard.home);
  await keepCrowd(dashboard, held);
  const asked = changesAsked(page);
  await showPage(page, origin);
  await answerCrowd(page, held);
  const calls = cursor.calls().length;
  const { sidebar, button, entries, heading, region, header, list, body } =
    runningCursorParts(page);
  const heldRows = region.getByRole("button", { name: /Open Dough/ });
  await button.click();
  await expect(entries).toHaveCount(crowd + 1);

  let collapsedList = 0;
  await test.step("collapsed, the header lies below the session list, which fills the rest of the sidebar", async () => {
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(body).toHaveCount(0);
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
    expect(listed.height).toBeGreaterThanOrEqual(floor);
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
    const listTop = await scrollTopOf(list);
    const listBox = await box(list);
    const firstEntry = await box(entries.first());
    await wheelToEnd(page, body);
    await expectInside(heldRows.last(), body);
    await expect(heldRows.last()).toBeInViewport();
    expect(await scrollTopOf(list)).toBe(listTop);
    expect(await box(list)).toEqual(listBox);
    expect(await box(entries.first())).toEqual(firstEntry);
  });

  await test.step("scrolling the session list reaches its last entry and leaves the Running Cursor sessions list in place", async () => {
    const bodyTop = await scrollTopOf(body);
    const bodyBox = await box(body);
    const lastRow = await box(heldRows.last());
    await wheelToEnd(page, list);
    await expectInside(entries.last(), list);
    await expect(entries.last()).toBeInViewport();
    expect(await scrollTopOf(body)).toBe(bodyTop);
    expect(await box(body)).toEqual(bodyBox);
    expect(await box(heldRows.last())).toEqual(lastRow);
  });

  await test.step("collapsed with the keyboard, the session list takes the room back and the header keeps the keyboard", async () => {
    await header.focus();
    await page.keyboard.press("Space");
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(body).toHaveCount(0);
    await expect(header).toBeFocused();
    expect((await box(list)).height).toBeCloseTo(collapsedList, 0);
  });

  await test.step("in a short, zoomed window, both lists, their last entries, and the header stay in reach without sideways scrolling", async () => {
    await header.click();
    await expect(heldRows).toHaveCount(crowd);
    await page.setViewportSize({ width: 320, height: 256 });
    await expect(sidebar).toBeVisible();
    // An entry's title is cut by design (./session-sidebar-row.spec.ts).
    await expectNoSidewaysScrollAndWholeText(page, [".sidebar-title"]);
    for (const area of [list, body]) {
      expect((await box(area)).height).toBeGreaterThanOrEqual(floor - 1);
    }
    await expectEveryControlReachable(sidebar);
    for (const [area, last] of [
      [list, entries.last()],
      [body, heldRows.last()],
    ] as const) {
      await area.evaluate((element) => {
        element.scrollTo(0, element.scrollHeight);
      });
      await last.scrollIntoViewIfNeeded();
      await expectInside(last, area);
      await expect(last).toBeInViewport();
    }
    await header.scrollIntoViewIfNeeded();
    await expect(header).toBeInViewport();
    await header.focus();
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(header).toBeFocused();
  });

  // Only reads: the disclosure, scrolling, and resizing the window asked
  // for no launch, attach, done mark, delete, or runner control.
  expect(asked).toEqual([]);
  expect(cursor.calls()).toHaveLength(calls);
  expect(cursor.attaches()).toHaveLength(1);
});
