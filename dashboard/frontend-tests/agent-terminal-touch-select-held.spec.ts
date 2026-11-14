// Phone Select reaches everything the terminal holds, from the place it
// shows, through an explicit terminal WebSocket substitute whose application
// prints once the test knows the terminal's width: 200 numbered lines of
// scrollback, one line the terminal wraps over three rows and a token the
// application draws over two. The paused text is set row by row as the
// terminal draws it and copies as the terminal's own selection would. Other
// screens are ./agent-terminal-touch-select-screens.spec.ts; the other
// variants are ./agent-terminal-touch-select.spec.ts.

import { expect, test } from "../tests/support/frontendApp.ts";
import {
  openFrontendTerminalByTouch,
  reportedSize,
  travelOverRows,
} from "../tests/support/frontendTouchTerminal.ts";
import {
  heldOpening,
  heldOutput,
} from "../tests/support/terminalHeldOutput.ts";
import {
  conversationLine,
  directedApplication,
} from "../tests/support/terminalSubstituteApplication.ts";
import { tapWhereShown } from "../tests/pageLayout.ts";
import {
  scrollPausedByTouchTo,
  selectedPlace,
} from "../tests/terminalPausedScrollPage.ts";
import {
  expectTerminalInputNotFocused,
  expectTerminalText,
  pressTerminalKey,
} from "../tests/terminalScreenPage.ts";
import {
  expectLive,
  expectPaused,
  expectPausedOverScreen,
  expectPausedShowsDrawnRowsInPlace,
  pausedLines,
  pausedText,
  selectKey,
  selectPausedRange,
} from "../tests/terminalSelectPage.ts";
import { phoneLaunchTouchViewport } from "../tests/touchLaunchPage.ts";
import {
  focusByTouch,
  scrollByTouch,
  tapTerminalKey,
} from "../tests/touchTerminalPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({
  viewport: phoneLaunchTouchViewport.portrait,
  hasTouch: true,
  permissions: ["clipboard-read", "clipboard-write"],
});

const session = (title: string) =>
  makeMe.aLaunchRecord
    .adHoc({ instruction: "select", title })
    .launchedAt("2026-10-01T00:00:00.000Z")
    .inClaudeSession({ sessionId: "select-held-1", shortId: "held01" })
    .please();

test("Select opens the paused text where the terminal was swiped to, a finger scrolls it to the first and the last line the terminal holds, and selections copy as the terminal's own would", async ({
  page,
  frontendServices,
}) => {
  const program = directedApplication(`${heldOpening}\r\n`);
  const { panel, rows, screen, sent, sizes } =
    await openFrontendTerminalByTouch(
      page,
      frontendServices,
      session("Phone select scrollback session"),
      { application: program.application },
    );
  await expectTerminalText(panel, heldOpening);
  await focusByTouch(panel);
  const size = reportedSize(sizes);
  const sized = sizes.length;
  // A hundred characters at this phone's usual 41 columns: three rows.
  const held = heldOutput(size.cols, {
    lines: 200,
    after: 50,
    wrapped: 2 * size.cols + 18,
  });
  const rowOf = (text: string) => held.rows.indexOf(text);
  program.print(held.printed);
  const drawn = rows.locator("> div");
  let top = held.rows.length - size.rows;
  await expect(drawn.first()).toHaveText(held.rows[top] ?? "");

  await test.step("the developer swipes the terminal up to line 40", async () => {
    const target = rowOf(conversationLine(40));
    while (top > target) {
      // A stroke as long as the screen at most.
      const earlier = Math.min(top - target, size.rows);
      await scrollByTouch(
        page,
        screen,
        await travelOverRows(screen, size.rows, earlier),
      );
      top -= earlier;
      await expect(drawn.first()).toHaveText(held.rows[top] ?? "");
    }
  });
  const shown = await drawn.allTextContents();

  await test.step("Select pauses everything the terminal holds, open at line 40 where the terminal shows it", async () => {
    await tapTerminalKey(panel, "Select");
    await expectPaused(panel);
    await expectPausedOverScreen(panel);
    // The wrapped line is one line; the drawn token is two.
    expect(await pausedLines(panel)).toEqual(held.lines);
    // Line 40 heads the rows the terminal draws, the three rows of the
    // wrapped line and the two of the token among them.
    await expectPausedShowsDrawnRowsInPlace(panel);
    await selectPausedRange(panel, heldOpening, conversationLine(1));
    expect(await selectedPlace(panel)).toEqual({ rows: 2, shown: false });
  });

  await test.step("finger strokes scroll it to the first line and to the last", async () => {
    await scrollPausedByTouchTo(page, panel, "first");
    await selectPausedRange(panel, heldOpening, conversationLine(1));
    expect(await selectedPlace(panel)).toEqual({ rows: 2, shown: true });
    await scrollPausedByTouchTo(page, panel, "last");
    await selectPausedRange(
      panel,
      conversationLine(199),
      conversationLine(200),
    );
    expect(await selectedPlace(panel)).toEqual({ rows: 2, shown: true });
  });

  await test.step("selections copied by the platform are the terminal's lines", async () => {
    // A finger on the paused text takes focus from the terminal, so the
    // platform's copy is not a key the terminal takes.
    await tapWhereShown(pausedText(panel));
    await expectTerminalInputNotFocused(panel);
    await page.evaluate(() => navigator.clipboard.writeText("copied earlier"));
    const copies = async (from: string, to: string, over: number) => {
      const range = held.lines
        .slice(
          held.lines.findIndex((line) => line.startsWith(from)),
          held.lines.findIndex((line) => line.endsWith(to)) + 1,
        )
        .join("\n");
      expect(await selectPausedRange(panel, from, to)).toBe(range);
      expect((await selectedPlace(panel)).rows).toBe(over);
      await pressTerminalKey(page, "ControlOrMeta+c");
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(range);
      return range;
    };
    // One selection over more than a screen: line 35 to line 80, with the
    // wrapped line whole and the drawn token's break inside it.
    const [first, last] = [conversationLine(35), conversationLine(80)];
    const screens = rowOf(last) - rowOf(first) + 1;
    expect(screens).toBeGreaterThan(size.rows);
    const range = await copies(first, last, screens);
    expect(range.split("\n")).toHaveLength(49);
    // The line the terminal wrapped lies over three rows and is one line.
    expect(await copies(held.wrapped, held.wrapped, 3)).toBe(held.wrapped);
    // The token the application drew over two rows is two lines, the
    // second indented as drawn.
    const [head, tail] = held.drawnToken;
    expect(await copies(head, tail, 2)).toBe(`${head}\n${tail}`);
  });

  await test.step("Select again returns the terminal at line 40, where a swipe still moves its scrollback", async () => {
    await tapWhereShown(selectKey(panel));
    await expectLive(panel);
    expect(await drawn.allTextContents()).toEqual(shown);
    await scrollByTouch(
      page,
      screen,
      await travelOverRows(screen, size.rows, 5),
    );
    await expect(drawn.first()).toHaveText(conversationLine(35));
    // Pausing, scrolling, copying and returning sent the session nothing
    // and resized nothing.
    expect(sent).toEqual([]);
    expect(sizes).toHaveLength(sized);
  });
});
