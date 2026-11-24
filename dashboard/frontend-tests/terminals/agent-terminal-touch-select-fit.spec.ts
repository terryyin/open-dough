import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { landscape } from "../navigation/board-touch-page.ts";
import { terminal } from "../sessions/session-terminal-page.ts";
import {
  conversationLine,
  selfScrollingApplication,
} from "./terminal-test-output.ts";
import {
  drawnRows,
  liveScreen,
  mountTouchTerminal,
  showsRow,
  socketSize,
  swipeTerminal,
  terminalKey,
} from "./terminal-touch-input.ts";
import {
  expectPausedOverScreen,
  pausedLines,
  pausedText,
  returnToTerminal,
  selectOutput,
  selectPausedRange,
} from "./terminal-paused-output.ts";

test("Select pauses an application-scrolled screen without giving its next swipe to the live terminal", async () => {
  const lines = 60;
  const shown = 10;
  const program = selfScrollingApplication({ lines, shown });
  const { attachment, sent } = await mountTouchTerminal(
    "Application scroll then Select",
    {
      program,
      openingLines: [conversationLine(lines)],
    },
  );
  const { rows } = socketSize(attachment.sizes);
  const screen = liveScreen();
  const travel = (screen.getBoundingClientRect().height * 5.4) / rows;
  await swipeTerminal(screen, travel);
  const earliest = lines - shown + 1 - 5;
  await showsRow(conversationLine(earliest));
  expect(drawnRows()).not.toContain(conversationLine(lines));
  const sentAfterSwipe = sent().length;

  await selectOutput();
  await expectPausedOverScreen();
  expect(pausedLines().slice(0, shown + 1)).toEqual([
    ...Array.from({ length: shown }, (...[, row]) =>
      conversationLine(earliest + row),
    ),
    "> ",
  ]);
  expect(pausedLines()).toHaveLength(rows);
  const first = conversationLine(earliest + 1);
  const last = conversationLine(earliest + 2);
  expect(selectPausedRange(first, last).text).toBe(`${first}\n${last}`);

  await swipeTerminal(pausedText(), travel);
  await returnToTerminal();
  await showsRow(conversationLine(earliest));
  expect(drawnRows()).not.toContain(conversationLine(earliest - 1));
  await userEvent.keyboard("!");
  await expect.poll(() => sent().slice(sentAfterSwipe)).toEqual(["!"]);
});

test("paused text fits above a soft keyboard, scrolls by touch, and survives rotation", async () => {
  const { sent } = await mountTouchTerminal("Phone select fit", {
    openingLines: ["attached abcdef12", "Claude Code"],
  });
  await selectOutput();
  const paused = pausedLines();
  expect(paused.slice(0, 2)).toEqual(["attached abcdef12", "Claude Code"]);
  const original = Object.getOwnPropertyDescriptor(window, "visualViewport");
  const viewport = window.visualViewport;
  const restore = () => {
    if (original) Object.defineProperty(window, "visualViewport", original);
    else Reflect.deleteProperty(window, "visualViewport");
    window.dispatchEvent(new Event("resize"));
  };
  onTestFinished(restore);
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: { width: viewport?.width ?? innerWidth, height: 320, offsetTop: 0 },
  });
  window.dispatchEvent(new Event("resize"));
  await expect
    .poll(() => terminal.element().getBoundingClientRect().height)
    .toBeCloseTo(320, 0);
  await expectPausedOverScreen();
  const text = pausedText();
  const control = terminalKey("Select").element();
  expect(text.getBoundingClientRect().bottom).toBeLessThanOrEqual(321);
  expect(control.getBoundingClientRect().bottom).toBeLessThanOrEqual(321);
  expect(
    text.scrollHeight - text.clientHeight - text.scrollTop,
  ).toBeGreaterThan(100);
  await swipeTerminal(text, -100);
  await expect.poll(() => text.scrollTop).toBeGreaterThan(50);
  expect(window.getSelection()?.toString()).toBe("");
  expect(pausedLines()).toEqual(paused);

  restore();
  await page.viewport(landscape.width, landscape.height);
  await expectPausedOverScreen();
  expect(pausedLines()).toEqual(paused);
  await returnToTerminal();
  await showsRow("Claude Code");
  expect(sent()).toEqual([]);
});
