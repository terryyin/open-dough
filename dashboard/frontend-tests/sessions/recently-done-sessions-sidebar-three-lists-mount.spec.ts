// The open list, Recently done and Running Cursor sessions share the Sessions
// sidebar's room, each keeping its floor; the Recently done divider drags and
// keys within it with native Chromium input, and a short window keeps every
// header reachable.
import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
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

const heightOf = (selector: string) => {
  const element = document.querySelector(selector);
  if (element === null) throw new Error(`No ${selector}.`);
  return element.getBoundingClientRect().height;
};
const listHeights = () => ({
  open: heightOf(".sessions-sidebar-sessions"),
  done: heightOf(".recently-done-sessions-body"),
  running: heightOf(".running-cursor-body"),
});

// Drags `divider` down by `by` pixels with the pointer of the page that holds
// the Vitest frame.
async function dragDown(divider: Element, by: number) {
  const frame = window.frameElement?.getBoundingClientRect();
  const scale = frame ? frame.width / window.innerWidth : 1;
  const { x, y, width, height } = divider.getBoundingClientRect();
  const at = (insideY: number) => ({
    x: (frame?.left ?? 0) + (x + width / 2) * scale,
    y: (frame?.top ?? 0) + insideY * scale,
  });
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

test("the three lists share the sidebar's room above their floors, and the Recently done divider drags to its floor and keys by its step", async () => {
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

  await page.viewport(320, 256);
  const sideways = shown.sidebar.element();
  expect(sideways.scrollWidth).toBeLessThanOrEqual(sideways.clientWidth);
  for (const header of [shown.header, runningHeader]) {
    header.element().scrollIntoView();
    await expect.element(header).toBeInViewport();
  }
});
