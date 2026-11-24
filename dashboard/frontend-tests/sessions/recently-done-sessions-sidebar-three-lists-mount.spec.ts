// The open list, Recently done and Running Cursor sessions share the Sessions
// sidebar's room, each keeping its floor; the Recently done divider drags and
// keys within it with native Chromium input, wheeling one list to its end
// leaves the others where they were, and a short window keeps every control
// reachable.
import { expect, onTestFinished, test } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { browserSession } from "../review/browser-session.ts";
import {
  adHocSessions,
  mountSessions,
} from "./recently-done-sidebar-mount-page.ts";

const crowd = 30;
const floor = 8 * 16;
const keyStep = 2 * 16;

const running = makeMe.aRunningCursorSessions
  .holding(
    ...Array.from(new Array<undefined>(crowd).keys(), (index) => ({
      record: makeMe.aLaunchRecord
        .adHoc({
          instruction: `Running ${String(index + 1)}`,
          title: `Running ${String(index + 1)}`,
        })
        .inCursorSession({
          sessionId: `12345678-1234-4123-8123-${String(index).padStart(12, "0")}`,
          continuation: { workspace: "/Users/test/git/open-dough" },
        })
        .please(),
      label: "working" as const,
    })),
  )
  .please();

const runningHeader = page.getByRole("button", {
  name: "Running Cursor sessions",
  exact: true,
});

const listOf = (selector: string) => {
  const element = document.querySelector(selector);
  if (element === null) throw new Error(`No ${selector}.`);
  return element;
};
const heightOf = (selector: string) =>
  listOf(selector).getBoundingClientRect().height;
const listHeights = () => ({
  open: heightOf(".sessions-sidebar-sessions"),
  done: heightOf(".recently-done-sessions-body"),
  running: heightOf(".running-cursor-body"),
});

// Maps a point inside the Vitest frame to the page that holds it.
function pagePoint(insideX: number, insideY: number) {
  const frame = window.frameElement?.getBoundingClientRect();
  const scale = frame ? frame.width / window.innerWidth : 1;
  return {
    x: (frame?.left ?? 0) + insideX * scale,
    y: (frame?.top ?? 0) + insideY * scale,
  };
}

// Drags `divider` down by `by` pixels with the pointer of the page that holds
// the Vitest frame.
async function dragDown(divider: Element, by: number) {
  const { x, y, width, height } = divider.getBoundingClientRect();
  const at = (insideY: number) => pagePoint(x + width / 2, insideY);
  const start = y + height / 2;
  const mouse = (type: string, point: { x: number; y: number }) =>
    browserSession().send("Input.dispatchMouseEvent", {
      type,
      ...point,
      button: "left",
      buttons: type === "mouseReleased" ? 0 : 1,
      clickCount: type === "mouseMoved" ? 0 : 1,
    });
  await mouse("mousePressed", at(start));
  for (let step = 1; step <= 8; step += 1)
    await mouse("mouseMoved", at(start + (by * step) / 8));
  await mouse("mouseReleased", at(start + by));
}

// Wheels over `area` with native Chromium input until it rests at its end.
async function wheelToEnd(area: Element) {
  const { x, y, width, height } = area.getBoundingClientRect();
  const atEnd = () =>
    area.scrollTop + area.clientHeight >= area.scrollHeight - 1;
  await expect
    .poll(async () => {
      if (!atEnd())
        await browserSession().send("Input.dispatchMouseEvent", {
          type: "mouseWheel",
          ...pagePoint(x + width / 2, y + height / 2),
          deltaX: 0,
          deltaY: 2000,
        });
      return atEnd();
    })
    .toBe(true);
}

// Each of `area`'s buttons, scrolled into view, that does not show whole
// inside the window and every scrolling or clipping area holding it.
function controlsOutOfReach(area: Locator) {
  const inside = (shown: DOMRect, room: DOMRect) =>
    shown.top >= room.top - 0.5 &&
    shown.bottom <= room.bottom + 0.5 &&
    shown.left >= room.left - 0.5 &&
    shown.right <= room.right + 0.5;
  const clipsIt = (holder: Element) => {
    const { overflowX, overflowY } = getComputedStyle(holder);
    return /(auto|scroll|hidden|clip)/.test(overflowX + overflowY);
  };
  return area
    .getByRole("button")
    .elements()
    .filter((control) => {
      control.scrollIntoView({ block: "nearest", behavior: "instant" });
      const shown = control.getBoundingClientRect();
      if (!inside(shown, new DOMRect(0, 0, innerWidth, innerHeight)))
        return true;
      for (let at = control.parentElement; at !== null; at = at.parentElement)
        if (clipsIt(at) && !inside(shown, at.getBoundingClientRect()))
          return true;
      return false;
    })
    .map((control) => {
      const { top, bottom } = control.getBoundingClientRect();
      return `${control.getAttribute("aria-label") ?? control.textContent} ${String(Math.round(top))}-${String(Math.round(bottom))}`;
    });
}

// A crowd in each of the three lists, all expanded, Recently done at its
// newest 20.
async function crowdedSidebar() {
  onTestFinished(() => {
    window.localStorage.clear();
  });
  const shown = await mountSessions(
    makeMe.aMachineAnswer
      .observingUnavailable(...adHocSessions("Done", crowd, true))
      .observingOpen(...adHocSessions("Open", crowd, false))
      .please(),
    {
      sessions: {
        ...pageReadsSupplying({}).sessions,
        readRunningCursorSessions: () => Promise.resolve(running),
        readHostStatus: () =>
          Promise.resolve(
            makeMe.aHostStatus
              .with({ cpuPercent: null, freeBytes: null })
              .please(),
          ),
      },
    },
  );
  await shown.header.click();
  await runningHeader.click();
  await expect
    .poll(
      () =>
        page
          .getByRole("region", { name: "Running Cursor sessions" })
          .getByRole("list")
          .getByRole("button")
          .all().length,
    )
    .toBe(crowd);
  await expect.poll(shown.titles).toHaveLength(20);
  return shown;
}

test("the three lists share the sidebar's room above their floors, and the Recently done divider drags to its floor and keys by its step", async () => {
  await crowdedSidebar();
  const start = listHeights();
  for (const height of Object.values(start))
    expect(height).toBeGreaterThanOrEqual(floor - 0.5);
  const room = start.open + start.done + start.running;

  const divider = page.getByRole("separator", {
    name: "Recently done sessions divider",
    exact: true,
  });
  const says = () => Number(divider.element().getAttribute("aria-valuenow"));
  await dragDown(divider.element(), 2000);
  await expect.poll(says).toBe(floor);
  await userEvent.click(divider);
  await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
  await expect.poll(says).toBe(floor + 3 * keyStep);
  const resized = listHeights();
  expect(resized.done).toBeCloseTo(floor + 3 * keyStep, 0);
  expect(resized.open).toBeGreaterThanOrEqual(floor - 0.5);
  expect(resized.running).toBeGreaterThanOrEqual(floor - 0.5);
  expect(
    Math.abs(resized.open + resized.done + resized.running - room),
  ).toBeLessThanOrEqual(2);
});

test("wheeling Recently done to its end reaches every row and leaves the open and Running lists where they were", async () => {
  const shown = await crowdedSidebar();
  const openList = listOf(".sessions-sidebar-sessions");
  const runningBody = listOf(".running-cursor-body");
  const doneBody = listOf(".recently-done-sessions-body");
  openList.scrollTop = 40;
  runningBody.scrollTop = 24;
  await wheelToEnd(doneBody);
  await expect.poll(shown.titles).toHaveLength(crowd);
  await wheelToEnd(doneBody);
  expect(doneBody.scrollTop).toBeGreaterThan(0);
  expect(openList.scrollTop).toBe(40);
  expect(runningBody.scrollTop).toBe(24);
});

test("a short window keeps every header and control of the sidebar reachable without sideways scrolling", async () => {
  const shown = await crowdedSidebar();
  await page.viewport(320, 256);
  const sideways = shown.sidebar.element();
  expect(sideways.scrollWidth).toBeLessThanOrEqual(sideways.clientWidth);
  for (const header of [shown.header, runningHeader]) {
    header.element().scrollIntoView();
    await expect.element(header).toBeInViewport();
  }
  await expect.element(shown.sidebar.getByRole("button").first()).toBeVisible();
  expect(controlsOutOfReach(shown.sidebar)).toEqual([]);
});
