import { expect, test } from "vitest";
import { pointInBrowser } from "../navigation/board-reading-page.ts";
import { browserSession } from "../review/browser-session.ts";
import { terminal } from "../sessions/session-terminal-page.ts";
import { conversationLine } from "./terminal-test-output.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";
import { pausedOutput } from "./terminal-paused-output.ts";
import {
  drawnRows,
  liveScreen,
  showsRow,
  terminalKey,
  toolbar,
} from "./terminal-touch-input.ts";

test("a fine-pointer terminal has native mouse selection and scrollback without Select", async () => {
  const { attachment, sent } = await mountTerminalInput({
    viewport: { width: 1280, height: 800 },
  });
  expect(matchMedia("(any-pointer: fine)").matches).toBe(true);
  attachment.print(
    Array.from({ length: 80 }, (...[, index]) =>
      conversationLine(index + 1),
    ).join("\r\n"),
  );
  const lastLine = conversationLine(80);
  await showsRow(lastLine);

  expect(toolbar.query()).toBeNull();
  expect(terminalKey("Select").query()).toBeNull();
  expect(pausedOutput()).toBeNull();

  const row = terminal
    .getByText(lastLine, { exact: true })
    .element()
    .getBoundingClientRect();
  const from = pointInBrowser({ x: row.left + 2, y: row.top + row.height / 2 });
  const browser = browserSession();
  await browser.send("Input.dispatchMouseEvent", {
    ...from,
    type: "mousePressed",
    button: "left",
    buttons: 1,
    clickCount: 1,
  });
  await browser.send("Input.dispatchMouseEvent", {
    ...from,
    x: from.x + 150,
    type: "mouseMoved",
    button: "left",
    buttons: 1,
  });
  await browser.send("Input.dispatchMouseEvent", {
    ...from,
    x: from.x + 150,
    type: "mouseReleased",
    button: "left",
    clickCount: 1,
  });
  await expect
    .poll(
      () =>
        terminal.element().querySelectorAll(".xterm-selection > div").length,
    )
    .toBeGreaterThan(0);

  expect(drawnRows()).not.toContain(conversationLine(1));
  const screen = liveScreen().getBoundingClientRect();
  const center = pointInBrowser({
    x: screen.left + screen.width / 2,
    y: screen.top + screen.height / 2,
  });
  await browser.send("Input.dispatchMouseEvent", {
    ...center,
    type: "mouseMoved",
  });
  for (let step = 0; step < 24; step += 1) {
    await browser.send("Input.dispatchMouseEvent", {
      ...center,
      type: "mouseWheel",
      deltaX: 0,
      deltaY: -1000,
    });
  }
  await showsRow(conversationLine(1));
  expect(sent()).toEqual([]);
});
