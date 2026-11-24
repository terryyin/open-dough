import { expect } from "vitest";
import { terminal } from "../sessions/session-terminal-page.ts";
import { tapTerminalControl } from "./terminal-input-controls.ts";
import { liveRowElements, terminalKey } from "./terminal-touch-input.ts";

function terminalScreen() {
  const screen = terminal.element().querySelector(".terminal-screen");
  if (!screen) throw new Error("The terminal has no screen.");
  return screen;
}

export function pausedOutput() {
  return terminal
    .element()
    .querySelector<HTMLPreElement>(".terminal-paused-text");
}

export function pausedText() {
  const text = pausedOutput();
  if (!text) throw new Error("The terminal output is live.");
  return text;
}

export function pausedLines() {
  return pausedText().textContent.split("\n");
}

export async function selectOutput() {
  await tapTerminalControl(terminalKey("Select"));
  await expect
    .element(terminalKey("Select"))
    .toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => pausedOutput()?.isConnected).toBe(true);
}

export async function returnToTerminal() {
  await tapTerminalControl(terminalKey("Select"));
  await expect
    .element(terminalKey("Select"))
    .toHaveAttribute("aria-pressed", "false");
  await expect.poll(pausedOutput).toBeNull();
  const screen = terminalScreen();
  const { left, top, width, height } = screen.getBoundingClientRect();
  expect(
    screen.contains(
      document.elementFromPoint(left + width / 2, top + height / 2),
    ),
  ).toBe(true);
}

export async function expectPausedOverScreen() {
  await expect
    .poll(() => {
      const text = pausedText();
      const screen = terminalScreen();
      const over = text.getBoundingClientRect();
      const under = screen.getBoundingClientRect();
      const covers = (["left", "top", "right", "bottom"] as const).every(
        (side) => Math.abs(over[side] - under[side]) <= 0.5,
      );
      const hits = [
        [0.5, 0.5],
        [0.02, 0.02],
        [0.98, 0.02],
        [0.02, 0.98],
        [0.98, 0.98],
      ].every(
        ([x = 0, y = 0]) =>
          document.elementFromPoint(
            under.left + under.width * x,
            under.top + under.height * y,
          ) === text,
      );
      const style = getComputedStyle(text);
      return {
        coversScreen: covers,
        receivesTouches: hits,
        opaqueBackground: /^rgb\(/.test(style.backgroundColor),
        matchesScreenBackground:
          style.backgroundColor === getComputedStyle(screen).backgroundColor,
        selection: style.userSelect,
        touchAction: style.touchAction,
        overscroll: style.overscrollBehaviorY,
        insideScreen: screen.contains(text),
      };
    })
    .toEqual({
      coversScreen: true,
      receivesTouches: true,
      opaqueBackground: true,
      matchesScreenBackground: true,
      selection: "text",
      touchAction: "auto",
      overscroll: "contain",
      insideScreen: false,
    });
}

export async function expectRowsInPlace() {
  await expect
    .poll(() => {
      const text = pausedText();
      const right = text.getBoundingClientRect().right - 1;
      const mismatch: string[] = [];
      const columnWidths: number[] = [];
      const rows = liveRowElements();
      if (!rows.length) return ["no rendered terminal rows"];
      for (const row of rows) {
        const live = row.getBoundingClientRect();
        const middle = live.top + live.height / 2;
        const start = document.caretPositionFromPoint(live.left + 1, middle);
        const end = document.caretPositionFromPoint(right, middle);
        if (
          !start ||
          !end ||
          !text.contains(start.offsetNode) ||
          !text.contains(end.offsetNode)
        ) {
          mismatch.push("paused row is missing");
          continue;
        }
        const range = document.createRange();
        range.setStart(start.offsetNode, start.offset);
        range.setEnd(end.offsetNode, end.offset);
        if (range.toString().trimEnd() !== row.textContent.trimEnd())
          mismatch.push(row.textContent);
        if (!range.toString().trimEnd()) continue;
        const found = range.getBoundingClientRect();
        if (
          Math.abs(found.top - live.top) > 1 ||
          Math.abs(found.left - live.left) > 1
        )
          mismatch.push("row has moved");
        columnWidths.push(found.width / range.toString().length);
      }
      if (Math.max(...columnWidths) - Math.min(...columnWidths) > 0.05)
        mismatch.push("column widths differ");
      return mismatch;
    })
    .toEqual([]);
}

export function selectPausedRange(from: string, to: string) {
  const text = pausedText();
  const content = text.textContent;
  const start = content.indexOf(from);
  const end = content.indexOf(to, start) + to.length;
  if (start < 0 || end < to.length)
    throw new Error("Paused output does not hold the range.");
  function place(offset: number, ending: boolean) {
    const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
    let remaining = offset;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const size = node.textContent?.length ?? 0;
      if (remaining < size || (ending && remaining === size))
        return [node, remaining] as const;
      remaining -= size;
    }
    throw new Error("Paused output is shorter than the range.");
  }
  const range = document.createRange();
  range.setStart(...place(start, false));
  range.setEnd(...place(end, true));
  const selection = window.getSelection();
  if (!selection) throw new Error("The browser has no selection.");
  selection.removeAllRanges();
  selection.addRange(range);
  const box = text.getBoundingClientRect();
  const drawn = [...range.getClientRects()].filter(({ width }) => width > 0);
  return {
    text: selection.toString(),
    rows: new Set(drawn.map(({ top }) => Math.round(top))).size,
    shown: drawn.every(
      ({ top, bottom }) => top >= box.top - 1 && bottom <= box.bottom + 1,
    ),
  };
}
