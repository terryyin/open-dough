import { expect, onTestFinished } from "vitest";
import { pointInBrowser } from "../navigation/board-reading-page.ts";
import {
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { browserSession } from "../review/browser-session.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  sidebarButton,
  sidebarSession,
} from "../sessions/session-card-page.ts";
import { terminal } from "../sessions/session-terminal-page.ts";
import { tapTerminalControl } from "./terminal-input-controls.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";

export const toolbar = terminal.getByRole("toolbar", { name: "Terminal keys" });
export const terminalKey = (name: string) =>
  toolbar.getByRole("button", { name, exact: true });

export function liveScreen() {
  const screen = terminal.element().querySelector(".xterm-screen");
  if (!screen) throw new Error("The terminal has no live screen.");
  return screen;
}

export function liveRowElements() {
  return [...terminal.element().querySelectorAll(".xterm-rows > div")];
}

export function drawnRows() {
  return liveRowElements().map((row) => row.textContent);
}

export async function showsRow(text: string) {
  if (!text.trim()) throw new Error("Use a nonempty terminal row.");
  await expect
    .poll(() => drawnRows().some((row) => row.trimEnd() === text.trimEnd()))
    .toBe(true);
}

export function socketSize(sizes: readonly { cols: number; rows: number }[]) {
  const size = sizes.at(-1);
  if (!size) throw new Error("The terminal has not sent its dimensions.");
  return size;
}

export async function mountTouchTerminal(
  title: string,
  options: Pick<
    NonNullable<Parameters<typeof mountTerminalInput>[0]>,
    | "viewport"
    | "program"
    | "openingLines"
    | "connecting"
    | "storeTerminalImage"
  > = {},
) {
  await useTouchScreen();
  return mountTerminalInput({
    viewport: portrait,
    ...options,
    record: makeMe.aLaunchRecord.adHoc({ instruction: title, title }).please(),
    openSession: async () => {
      await tapTerminalControl(sidebarButton);
      await tapTerminalControl(sidebarSession(title));
    },
  });
}

export async function swipeTerminal(surface: Element, distance: number) {
  const box = surface.getBoundingClientRect();
  const travel =
    Math.min(Math.abs(distance), box.height - 12) * Math.sign(distance);
  const x = box.left + box.width * 0.5;
  const y = box.top + (box.height - travel) / 2;
  expect(surface.contains(document.elementFromPoint(x, y))).toBe(true);
  const browser = browserSession();
  const timestamp = Date.now() / 1000 - 0.8;
  await browser.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [pointInBrowser({ x, y })],
    timestamp,
  });
  for (let step = 1; step <= 5; step += 1) {
    await browser.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [pointInBrowser({ x, y: y + (travel * step) / 5 })],
      timestamp: timestamp + step * 0.12,
    });
  }
  await browser.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
    timestamp: timestamp + 0.72,
  });
  return { x, y };
}

export async function tapLiveScreen() {
  await tapWhereShown(liveScreen());
}

export function stubClipboard(item: ClipboardItem) {
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { read: () => Promise.resolve([item]) },
  });
  onTestFinished(() => {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else Reflect.deleteProperty(navigator, "clipboard");
  });
}
