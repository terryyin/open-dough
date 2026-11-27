import { expect, test } from "vitest";
import { scaleDevice } from "../../test-support/component-mount/deviceScale.ts";
import { landscape } from "../navigation/board-touch-page.ts";
import {
  conversationLine,
  heldOpening,
  heldOutput,
} from "./terminal-test-output.ts";
import {
  mountTouchTerminal,
  showsRow,
  socketSize,
} from "./terminal-touch-input.ts";
import {
  expectPausedOverScreen,
  expectRowsInPlace,
  pausedLines,
  returnToTerminal,
  selectOutput,
  selectPausedRange,
} from "./terminal-paused-output.ts";

async function pausesAtTheEnd({
  wide,
  lines,
  rowsOfWrapped,
}: {
  wide: boolean;
  lines: number;
  rowsOfWrapped: number;
}) {
  const { attachment, sent } = await mountTouchTerminal(
    "Select at end of scrollback",
    {
      ...(wide ? { viewport: landscape } : {}),
      openingLines: [heldOpening],
    },
  );
  const { cols } = socketSize(attachment.sizes);
  const wrapped = 100;
  expect(Math.ceil(wrapped / cols)).toBe(rowsOfWrapped);
  const held = heldOutput(cols, { lines, after: lines - 2, wrapped });
  attachment.print(held.printed);
  await showsRow(conversationLine(lines));

  await selectOutput();
  await expectPausedOverScreen();
  await expectRowsInPlace();
  const paused = pausedLines();
  expect(paused).toEqual(held.lines.slice(-paused.length));
  expect(paused.length).toBeGreaterThanOrEqual(
    Math.min(held.lines.length, 1000),
  );
  if (lines > 1000) expect(paused.length).toBeLessThan(held.lines.length);
  expect(selectPausedRange(held.wrapped, held.wrapped)).toEqual({
    text: held.wrapped,
    rows: rowsOfWrapped,
    shown: true,
  });
  const first = conversationLine(lines - 3);
  const last = conversationLine(lines - 2);
  expect(selectPausedRange(first, last).text).toBe(`${first}\n${last}`);

  await returnToTerminal();
  expect(sent()).toEqual([]);
}

test("landscape Select keeps wider wrapped rows where the terminal shows them", async () => {
  await pausesAtTheEnd({ wide: true, lines: 60, rowsOfWrapped: 2 });
});

test("Select places and copies the kept end of full scrollback at fractional device scale", async () => {
  await scaleDevice(2.625);
  await pausesAtTheEnd({ wide: false, lines: 1100, rowsOfWrapped: 3 });
});
