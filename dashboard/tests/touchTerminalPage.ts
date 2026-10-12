// Browser terminal observations and real touch gestures, independent of a
// session's native setup and input/output assertions.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { box, tapWhereShown } from "./pageLayout.ts";

// Observe browser traffic without supplying input or native resize outcomes.
export function noteTerminalTraffic(page: Page) {
  const sent: string[] = [];
  const sizes: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framesent", ({ payload }) => {
      if (typeof payload !== "string") return;
      const { input } = JSON.parse(payload) as { input?: unknown };
      if (typeof input === "string") sent.push(input);
    });
    socket.on("framereceived", ({ payload }) => {
      if (typeof payload !== "string") return;
      for (const match of payload.matchAll(
        /(?:attached \S+|resized) (\d+x\d+)/g,
      ))
        sizes.push(match[1] ?? "");
    });
  });
  return { sent, sizes };
}

// Fitting is observed at the native PTY and the rendered cells, not merely
// by the CSS box. The current panel must fill its viewport share and xterm
// must fit its available room before the journey measures a touch coordinate.
export async function expectFittedInput(panel: Locator, sizes: string[]) {
  const screen = panel.locator(".xterm-screen");
  await expect
    .poll(async () => {
      const fitted = await screen.evaluate((element) => {
        const input = element.getBoundingClientRect();
        const panel = element.closest(".side-panel");
        const room = panel?.getBoundingClientRect();
        const host = element.closest(".terminal-screen");
        const padding = host === null ? undefined : getComputedStyle(host);
        const availableHeight =
          host === null || padding === undefined
            ? 0
            : host.clientHeight -
              Number.parseFloat(padding.paddingTop) -
              Number.parseFloat(padding.paddingBottom);
        const rowHeight =
          element.querySelector(".xterm-rows > div")?.getBoundingClientRect()
            .height ?? 0;
        const stacked =
          panel?.parentElement?.classList.contains("page-stacked");
        const maximized =
          panel?.parentElement?.classList.contains("page-maximized");
        const panelHeight =
          innerHeight * (stacked === true && maximized !== true ? 0.7 : 1);
        return {
          rows: element.querySelectorAll(".xterm-rows > div").length,
          fits:
            room !== undefined &&
            Math.abs(room.height - panelHeight) < 1 &&
            availableHeight - input.height >= -1 &&
            availableHeight - input.height < rowHeight + 1 &&
            input.width >= 44 &&
            input.height >= 44 &&
            input.x >= room.x &&
            input.y >= room.y &&
            input.x + input.width <= room.right + 1 &&
            input.y + input.height <= room.bottom + 1 &&
            input.y >= 0 &&
            input.bottom <= innerHeight &&
            document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
        };
      });
      return sizes.at(-1)?.split("x")[1] === String(fitted.rows) && fitted.fits;
    })
    .toBe(true);
}

// Send native finger movement explicitly: Linux Chromium's synthesized scroll
// can deliver only touchstart/end. Split long drags into feasible in-view
// strokes. No DOM scroll position is assigned to supply the result.
export async function scrollByTouch(
  page: Page,
  area: Locator,
  distance: number,
) {
  const bounds = await box(area);
  const browser = await page.context().newCDPSession(page);
  try {
    const x = bounds.x + bounds.width / 2;
    const edge = Math.min(8, bounds.height / 2);
    const y = distance > 0 ? bounds.y + edge : bounds.y + bounds.height - edge;
    const height = await page.evaluate(() => innerHeight);
    const room = distance > 0 ? height - edge - y : y - edge;
    expect(room, "room for an in-view finger stroke").toBeGreaterThan(0);
    const strokes = Math.ceil(Math.abs(distance) / room);
    const duration = Math.abs(distance) / strokes / 400;
    // Model a stationary finger before lifting, preserving the synthesized
    // gesture's preventFling behavior. These are input timestamps, not waits
    // for the page result; keep the whole gesture in the past.
    let timestamp = Date.now() / 1000 - strokes * (duration + 0.1);
    for (let stroke = 0; stroke < strokes; stroke += 1) {
      await browser.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
        timestamp,
      });
      for (let step = 1; step <= 10; step += 1) {
        await browser.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: y + (distance * step) / (strokes * 10) }],
          timestamp: timestamp + (duration * step) / 10,
        });
      }
      timestamp += duration + 0.1;
      await browser.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
        timestamp,
      });
    }
  } finally {
    await browser.detach();
  }
}

export async function focusByTouch(panel: Locator) {
  await tapWhereShown(panel.locator(".xterm-screen"));
  await expect(panel.locator("textarea")).toBeFocused();
}

export function titleWordsShown(heading: Locator, start: number, end: number) {
  return heading.evaluate(
    (element, { start, end }) => {
      const text = element.firstChild;
      const identity = element
        .closest(".terminal-identity")
        ?.getBoundingClientRect();
      if (text === null || identity === undefined) return false;
      const words = document.createRange();
      words.setStart(text, start);
      words.setEnd(text, end);
      return Array.from(words.getClientRects()).every(
        (shown) =>
          shown.top >= identity.top &&
          shown.bottom <= identity.bottom + 1 &&
          shown.left >= identity.left &&
          shown.right <= identity.right + 1,
      );
    },
    { start, end },
  );
}
