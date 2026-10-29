// Browser terminal observations, independent of a
// session's native setup and input/output assertions.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { tapWhereShown } from "./pageLayout.ts";
export {
  scrollByTouch,
  readAfterTouchFrame,
  type TouchReading,
} from "./touchGestures.ts";

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
          innerHeight * (stacked === true && maximized !== true ? 0.5 : 1);
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

export async function focusByTouch(panel: Locator) {
  await tapWhereShown(panel.locator(".xterm-screen"));
  await expect(panel.locator("textarea")).toBeFocused();
}

export function titleWordsReading(
  heading: Locator,
  start: number,
  end: number,
) {
  return heading.evaluateHandle(
    (element, { start, end }) =>
      () => {
        if (!element.isConnected) return false;
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

export async function titleWordsShown(
  heading: Locator,
  start: number,
  end: number,
) {
  const reading = await titleWordsReading(heading, start, end);
  try {
    return await reading.evaluate((sample) => sample());
  } finally {
    await reading.dispose();
  }
}

export function sessionReading(session: Locator) {
  return session.evaluateHandle((element) => () => {
    if (!element.isConnected) return false;
    const identity = element
      .closest(".terminal-identity")
      ?.getBoundingClientRect();
    const shown = element.getBoundingClientRect();
    return (
      identity !== undefined &&
      shown.top >= Math.max(identity.top, 0) &&
      shown.bottom <= Math.min(identity.bottom, innerHeight)
    );
  });
}
