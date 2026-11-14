// Phone Select on other screens than a phone held upright, through an
// explicit terminal WebSocket substitute whose application prints once the
// test knows the terminal's width. A phone in landscape and a tablet pause
// rows as long as their wider terminal draws; a phone whose rows are not
// whole pixels tall pauses a full scrollback. On each, the end of the
// scrollback lies where the terminal shows it. The phone held upright, its
// swiped scrollback and what a selection copies are
// ./agent-terminal-touch-select-held.spec.ts.

import { expect, test } from "../tests/support/frontendApp.ts";
import {
  openFrontendTerminalByTouch,
  reportedSize,
} from "../tests/support/frontendTouchTerminal.ts";
import {
  heldOpening,
  heldOutput,
} from "../tests/support/terminalHeldOutput.ts";
import {
  conversationLine,
  directedApplication,
} from "../tests/support/terminalSubstituteApplication.ts";
import { selectedPlace } from "../tests/terminalPausedScrollPage.ts";
import { expectTerminalText } from "../tests/terminalScreenPage.ts";
import {
  expectLive,
  expectPaused,
  expectPausedOverScreen,
  expectPausedShowsDrawnRowsInPlace,
  pausedLines,
  selectPausedRange,
} from "../tests/terminalSelectPage.ts";
import {
  phoneLaunchTouchViewport,
  tabletLaunchTouchViewport,
} from "../tests/touchLaunchPage.ts";
import { focusByTouch, tapTerminalKey } from "../tests/touchTerminalPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ hasTouch: true });

// The scrollback a terminal keeps unless told otherwise.
const keptScrollback = 1000;
// The characters a 41-column phone held upright shows over three rows.
const wrapped = 100;

for (const { device, lines, rowsOfWrapped, ...screen } of [
  {
    device: "a phone in landscape",
    viewport: phoneLaunchTouchViewport.landscape,
    lines: 60,
    rowsOfWrapped: 2,
  },
  {
    device: "a tablet",
    viewport: tabletLaunchTouchViewport.portrait,
    lines: 60,
    rowsOfWrapped: 2,
  },
  {
    // Three device pixels to a CSS pixel keep rows whole; this ratio, common
    // among phones, does not.
    device: "a phone whose rows are not whole pixels tall, its scrollback full",
    viewport: phoneLaunchTouchViewport.portrait,
    deviceScaleFactor: 2.625,
    lines: keptScrollback + 100,
    rowsOfWrapped: 3,
  },
]) {
  test.describe(device, () => {
    test.use(screen);

    test(`on ${device}, Select pauses the latest lines where the terminal shows them, in rows as long as its terminal draws, and a range selects`, async ({
      page,
      frontendServices,
    }) => {
      const program = directedApplication(`${heldOpening}\r\n`);
      const { panel, sent, sizes } = await openFrontendTerminalByTouch(
        page,
        frontendServices,
        makeMe.aLaunchRecord
          .adHoc({ instruction: "select", title: `Select on ${device}` })
          .inClaudeSession({ sessionId: "select-screens-1", shortId: "held01" })
          .please(),
        { application: program.application },
      );
      await expectTerminalText(panel, heldOpening);
      await focusByTouch(panel);
      const size = reportedSize(sizes);
      expect(Math.ceil(wrapped / size.cols)).toBe(rowsOfWrapped);
      const held = heldOutput(size.cols, { lines, after: lines - 2, wrapped });
      program.print(held.printed);
      await expectTerminalText(panel, conversationLine(lines));

      await tapTerminalKey(panel, "Select");
      await expectPaused(panel);
      await expectPausedOverScreen(panel);
      // The terminal shows the end of its scrollback, the wrapped line and
      // the drawn token among its rows.
      await expectPausedShowsDrawnRowsInPlace(panel);
      // Everything the terminal holds: all of it, or the end it kept.
      const paused = await pausedLines(panel);
      expect(paused).toEqual(held.lines.slice(-paused.length));
      expect(paused.length).toBeGreaterThanOrEqual(
        Math.min(held.lines.length, keptScrollback),
      );
      expect(await selectPausedRange(panel, held.wrapped, held.wrapped)).toBe(
        held.wrapped,
      );
      expect(await selectedPlace(panel)).toEqual({
        rows: rowsOfWrapped,
        shown: true,
      });
      const [first, last] = [
        conversationLine(lines - 3),
        conversationLine(lines - 2),
      ];
      expect(await selectPausedRange(panel, first, last)).toBe(
        `${first}\n${last}`,
      );

      await tapTerminalKey(panel, "Select");
      await expectLive(panel);
      expect(sent).toEqual([]);
    });
  });
}
