import { expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { tapWhereShown } from "../navigation/board-touch-page.ts";
import { terminalInput } from "../sessions/session-terminal-page.ts";
import {
  conversationLine,
  heldOpening,
  heldOutput,
} from "./terminal-test-output.ts";
import {
  drawnRows,
  liveScreen,
  mountTouchTerminal,
  socketSize,
  swipeTerminal,
} from "./terminal-touch-input.ts";
import {
  expectPausedOverScreen,
  expectRowsInPlace,
  pausedLines,
  pausedText,
  returnToTerminal,
  selectOutput,
  selectPausedRange,
} from "./terminal-paused-output.ts";

async function scrollPausedTo(edge: "first" | "last") {
  const text = pausedText();
  const distance = () =>
    edge === "first"
      ? text.scrollTop
      : text.scrollHeight - text.clientHeight - text.scrollTop;
  for (let stroke = 0; stroke < 16 && distance() >= 2; stroke += 1) {
    const position = text.scrollTop;
    const travel = Math.min(distance() + 60, text.clientHeight - 14);
    await swipeTerminal(text, edge === "first" ? travel : -travel);
    await expect
      .poll(() => distance() < 2 || text.scrollTop !== position)
      .toBe(true);
  }
  expect(distance()).toBeLessThan(2);
}

test("paused scrollback opens at the swiped position and selects wrapped and drawn lines", async () => {
  const { attachment, sent } = await mountTouchTerminal("Phone scrollback", {
    openingLines: [heldOpening],
  });
  const { cols, rows } = socketSize(attachment.sizes);
  const sized = attachment.sizes.length;
  const held = heldOutput(cols, {
    lines: 100,
    after: 50,
    wrapped: 2 * cols + 18,
  });
  attachment.print(held.printed);

  let top = held.rows.length - rows;
  await expect.poll(() => drawnRows()[0]).toBe(held.rows[top]);
  const screen = liveScreen();
  const cell = screen.getBoundingClientRect().height / rows;
  const target = held.rows.indexOf(conversationLine(40));
  while (top > target) {
    const count = Math.min(top - target, rows - 2);
    await swipeTerminal(screen, cell * (count + 0.4));
    top -= count;
    await expect.poll(() => drawnRows()[0]).toBe(held.rows[top]);
  }
  const shown = drawnRows();

  await selectOutput();
  await expectPausedOverScreen();
  expect(pausedLines()).toEqual(held.lines);
  await expectRowsInPlace();
  expect(selectPausedRange(heldOpening, conversationLine(1))).toEqual({
    text: `${heldOpening}\n${conversationLine(1)}`,
    rows: 2,
    shown: false,
  });
  await scrollPausedTo("first");
  expect(selectPausedRange(heldOpening, conversationLine(1)).shown).toBe(true);
  await scrollPausedTo("last");
  expect(
    selectPausedRange(conversationLine(99), conversationLine(100)).shown,
  ).toBe(true);

  await tapWhereShown(pausedText());
  await expect.element(terminalInput).not.toHaveFocus();
  // These keys drive Chromium's Copy on the selected page range.
  // The native E2E path additionally reads the resulting system clipboard.
  const copied: string[] = [];
  const observeCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    copied.push(window.getSelection()?.toString() ?? "");
  };
  document.addEventListener("copy", observeCopy);
  onTestFinished(() => {
    document.removeEventListener("copy", observeCopy);
  });
  const copy = navigator.platform.includes("Mac")
    ? "{Meta>}c{/Meta}"
    : "{Control>}c{/Control}";
  const first = conversationLine(35);
  const last = conversationLine(80);
  const selected = selectPausedRange(first, last);
  const expected = held.lines
    .slice(held.lines.indexOf(first), held.lines.indexOf(last) + 1)
    .join("\n");
  expect(selected.text).toBe(expected);
  expect(selected.rows).toBeGreaterThan(rows);
  expect(selected.text.split("\n")).toHaveLength(49);
  await userEvent.keyboard(copy);
  expect(selectPausedRange(held.wrapped, held.wrapped)).toMatchObject({
    text: held.wrapped,
    rows: 3,
  });
  await userEvent.keyboard(copy);
  const [head, tail] = held.drawnToken;
  expect(selectPausedRange(head, tail)).toMatchObject({
    text: `${head}\n${tail}`,
    rows: 2,
  });
  await userEvent.keyboard(copy);
  expect(copied).toEqual([expected, held.wrapped, `${head}\n${tail}`]);

  await returnToTerminal();
  expect(drawnRows()).toEqual(shown);
  await swipeTerminal(screen, cell * 5.4);
  await expect.poll(() => drawnRows()[0]).toBe(conversationLine(35));
  expect(sent()).toEqual([]);
  expect(attachment.sizes).toHaveLength(sized);
});
