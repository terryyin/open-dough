// Browser terminal observations, independent of a
// session's native setup and input/output assertions.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { box, tapWhereShown } from "./pageLayout.ts";
import {
  expectTerminalInputFocused,
  terminalScreenParts,
} from "./terminalScreenPage.ts";
import { scrollByTouch } from "./touchGestures.ts";
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

// The rows of the size the session last reported, among the `COLSxROWS`
// sizes noted above.
export function reportedRows(sizes: readonly string[]) {
  return Number(sizes.at(-1)?.split("x")[1]);
}

// Fitting is observed at the native PTY and the rendered cells, not merely
// by the CSS box. The current panel must fill the visible viewport share
// (visualViewport when present) and xterm must fit its available room before
// the journey measures a touch coordinate.
export async function expectFittedInput(panel: Locator, sizes: string[]) {
  const { screen } = terminalScreenParts(panel);
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
        // Soft-keyboard fit pins the panel to the visual viewport; without one
        // the layout viewport height is the covering/split pin.
        const visible = window.visualViewport;
        const visibleTop = visible?.offsetTop ?? 0;
        const panelHeight = visible?.height ?? innerHeight;
        const visibleBottom = visibleTop + panelHeight;
        return {
          rows: element.querySelectorAll(".xterm-rows > div").length,
          fits:
            room !== undefined &&
            Math.abs(room.height - panelHeight) < 1 &&
            Math.abs(room.y - visibleTop) < 1 &&
            availableHeight - input.height >= -1 &&
            availableHeight - input.height < rowHeight + 1 &&
            input.width >= 44 &&
            input.height >= 44 &&
            input.x >= room.x &&
            input.y >= room.y &&
            input.x + input.width <= room.right + 1 &&
            input.y + input.height <= room.bottom + 1 &&
            input.y >= visibleTop - 1 &&
            input.bottom <= visibleBottom + 1 &&
            document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
        };
      });
      return reportedRows(sizes) === fitted.rows && fitted.fits;
    })
    .toBe(true);
}

export {
  clearSoftKeyboardViewport,
  expectControlInVisualViewport,
  hideKeyboardControl,
  simulateSoftKeyboardViewport,
} from "./touchTerminalSoftKeyboardPage.ts";

// The terminal box shrinks when chrome around it appears, such as a status
// line or the composer, and xterm keeps its former rows until the next resize
// observation refits it. Touch the screen once its rows lie within that box.
export async function focusByTouch(panel: Locator) {
  const { screen } = terminalScreenParts(panel);
  await expect
    .poll(() =>
      screen.evaluate((element) => {
        const host = element.closest(".terminal-screen");
        if (host === null) return false;
        const room = host.getBoundingClientRect();
        const input = element.getBoundingClientRect();
        return input.bottom <= room.bottom + 1 && input.right <= room.right + 1;
      }),
    )
    .toBe(true);
  await tapWhereShown(screen);
  await expectTerminalInputFocused(panel);
}

// Coarse-pointer accessory bar; absent on fine-pointer desktop chrome.
export function terminalKeyToolbar(panel: Locator) {
  return panel.getByRole("toolbar", { name: "Terminal keys", exact: true });
}

export function terminalKey(panel: Locator, name: string) {
  return terminalKeyToolbar(panel).getByRole("button", { name, exact: true });
}

// Where the phone is narrower than its keys, the keys before Enter scroll
// sideways in a lane of their own and the toolbar scrolls sideways as a
// whole. A finger stroke along whichever cuts `name`, as long as the cut and
// one key's width more, brings that key wholly into view whatever travel the
// browser spends recognizing the stroke.
export async function bringKeyIntoView(panel: Locator, name: string) {
  const key = terminalKey(panel, name);
  const toolbar = terminalKeyToolbar(panel);
  const lane = toolbar.locator(".terminal-key-toolbar-primary");
  const scroller = (await lane
    .getByRole("button", { name, exact: true })
    .count())
    ? lane
    : toolbar;
  // How far the key reaches past the end of what scrolls it.
  const cut = async () => {
    const [at, room] = [await box(key), await box(scroller)];
    return at.x + at.width - (room.x + room.width);
  };
  await scrollByTouch(
    panel.page(),
    scroller,
    -(Math.max(0, await cut()) + 44),
    "horizontal",
    undefined,
    scroller,
  );
  await expect.poll(cut, `${name} is wholly in view`).toBeLessThanOrEqual(0);
}

// Docs 44px primary targets without tapping; tapWhereShown also enforces size
// when the control is activated.
export async function expectMinTouchTarget(control: Locator) {
  expect(
    await control.evaluate((button) => {
      const box = button.getBoundingClientRect();
      return box.width >= 44 && box.height >= 44;
    }),
  ).toBe(true);
}

// Tap a toolbar key and keep observing that xterm's textarea holds focus
// (Blink-style: toolbar pointerdown must not dismiss the soft keyboard).
export async function tapTerminalKey(panel: Locator, name: string) {
  await tapWhereShown(terminalKey(panel, name));
  await expectTerminalInputFocused(panel);
}

// Optional phone draft field + Insert; revealed by Compose on coarse chrome.
export function composeToggle(panel: Locator) {
  return terminalKey(panel, "Compose");
}

export function terminalComposerDraft(panel: Locator) {
  return panel.getByRole("textbox", { name: "Terminal draft", exact: true });
}

export function insertDraftButton(panel: Locator) {
  return panel.getByRole("button", { name: "Insert draft", exact: true });
}

export async function openTerminalComposer(panel: Locator) {
  const more = terminalKey(panel, "More terminal keys");
  if ((await more.getAttribute("aria-expanded")) !== "true") {
    await tapWhereShown(more);
  }
  const toggle = composeToggle(panel);
  if ((await toggle.getAttribute("aria-expanded")) !== "true") {
    await tapWhereShown(toggle);
  }
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(terminalComposerDraft(panel)).toBeVisible();
}
