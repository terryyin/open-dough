// Variants of phone Select, the paused terminal text, through an explicit
// terminal WebSocket substitute whose application prints, ends or disconnects
// when the test says so: output that arrives while paused, the remaining
// screen of an attachment that ended or disconnected, and a fine-pointer
// desktop, which has no Select. The representative select, copy, return and
// paste on the real terminal path is
// ../tests/terminals/agent-terminal-touch-select.spec.ts; fit and an
// application that scrolls itself are
// ./agent-terminal-touch-select-fit.spec.ts; scrollback and what a selection
// copies are ./agent-terminal-touch-select-held.spec.ts; other screens are
// ./agent-terminal-touch-select-screens.spec.ts.

import { expect, test } from "../tests/support/frontendApp.ts";
import {
  openFrontendTerminalByMouse,
  openFrontendTerminalByTouch,
} from "../tests/support/frontendTouchTerminal.ts";
import {
  conversationLine,
  directedApplication,
  echoingApplication,
} from "../tests/support/terminalSubstituteApplication.ts";
import { box, tapWhereShown } from "../tests/pageLayout.ts";
import { expectStillHolds } from "../tests/sidePanelWidthPage.ts";
import {
  expectLive,
  expectPaused,
  expectPausedShowsDrawnRowsInPlace,
  expectPausedOverScreen,
  pausedLines,
  pausedText,
  selectKey,
  selectPausedRange,
} from "../tests/terminalSelectPage.ts";
import { phoneLaunchTouchViewport } from "../tests/touchLaunchPage.ts";
import {
  focusByTouch,
  tapTerminalKey,
  terminalKeyToolbar,
} from "../tests/touchTerminalPage.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

const session = (title: string) =>
  makeMe.aLaunchRecord
    .adHoc({ instruction: "select", title })
    .launchedAt("2026-10-01T00:00:00.000Z")
    .inClaudeSession({ sessionId: "select-1", shortId: "select01" })
    .please();

test.describe("phone Select", () => {
  test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });

  test("output that arrives while paused leaves the paused text alone and shows on return, with nothing sent and the soft keyboard not raised", async ({
    page,
    frontendServices,
  }) => {
    const program = directedApplication(
      "attached select01\r\nfirst output\r\n",
    );
    const { panel, rows, input, sent, sizes } =
      await openFrontendTerminalByTouch(
        page,
        frontendServices,
        session("Phone select session"),
        { application: program.application },
      );
    await expect(rows).toContainText("first output");
    // One size per attachment and per resize the page asked for.
    const sized = sizes.length;
    // No soft keyboard is up: the terminal's input is not focused.
    await input.evaluate((element) => {
      element.blur();
    });

    await tapWhereShown(selectKey(panel));
    await expectPaused(panel);
    await expect(input).not.toBeFocused();
    await expectPausedShowsDrawnRowsInPlace(panel);
    const paused = await pausedLines(panel);
    expect(paused.slice(0, 2)).toEqual(["attached select01", "first output"]);

    program.print("printed while paused\r\n");
    await expect(rows).toContainText("printed while paused");
    expect(await pausedLines(panel)).toEqual(paused);
    await expectPausedOverScreen(panel);
    // The paused text announces nothing, and a touch on it neither leaves the
    // pause nor reaches the terminal beneath.
    await expect(panel.getByRole("status")).toBeEmpty();
    expect(
      await pausedText(panel).evaluate(
        (text) =>
          text.closest("[aria-live], [role=status], [role=alert]") !== null,
      ),
    ).toBe(false);
    await tapWhereShown(pausedText(panel));
    await expectPaused(panel);
    await expect(input).not.toBeFocused();

    await tapWhereShown(selectKey(panel));
    await expectLive(panel);
    await expect(rows).toContainText("printed while paused");
    await expect(input).not.toBeFocused();

    // Typing reaches the session as before, the first thing it is sent, on
    // the attachment the page opened and never resized.
    await focusByTouch(panel);
    await input.press("!");
    await expect.poll(() => sent).toEqual(["!"]);
    await expect(rows).toContainText("!");
    expect(sizes).toHaveLength(sized);
  });

  for (const ending of ["ended", "disconnected"] as const) {
    test(`the remaining screen of ${ending === "ended" ? "an ended" : "a disconnected"} attachment pauses as text a range can be selected in`, async ({
      page,
      frontendServices,
    }) => {
      const program = directedApplication(
        "attached select01\r\nlast words\r\nbefore it went\r\n",
      );
      const { panel, rows } = await openFrontendTerminalByTouch(
        page,
        frontendServices,
        session(`Phone select ${ending} session`),
        { application: program.application },
      );
      await expect(rows).toContainText("before it went");
      if (ending === "ended") program.end();
      else program.disconnect();
      const [says, action] =
        ending === "ended"
          ? ["The terminal ended", "Open again"]
          : ["Disconnected from the session", "Reconnect"];
      await expect(panel.getByRole("status")).toContainText(says);
      // Touching the screen waits for it to fit beneath the status line.
      await focusByTouch(panel);

      await tapTerminalKey(panel, "Select");
      await expectPaused(panel);
      await expectPausedOverScreen(panel);
      await expectPausedShowsDrawnRowsInPlace(panel);
      expect(await selectPausedRange(panel, "words", "before it")).toBe(
        "words\nbefore it",
      );

      await tapTerminalKey(panel, "Select");
      await expectLive(panel);
      await expect(rows).toContainText("before it went");
      await expect(
        panel.getByRole("button", { name: action, exact: true }),
      ).toBeVisible();
    });
  }
});

test.describe("fine-pointer desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 }, hasTouch: false });

  test("has no Select, and the mouse still selects and the wheel still scrolls the terminal", async ({
    page,
    frontendServices,
  }) => {
    const lines = 80;
    const { panel, rows, sent } = await openFrontendTerminalByMouse(
      page,
      frontendServices,
      session("Desktop select session"),
      {
        application: echoingApplication(
          Array.from(
            { length: lines },
            (...[, line]) => `${conversationLine(line + 1)}\r\n`,
          ).join(""),
        ),
      },
    );
    await expect(rows).toContainText(conversationLine(lines));

    await expect(terminalKeyToolbar(panel)).toBeHidden();
    await expect(selectKey(panel)).toBeHidden();
    await expect(pausedText(panel)).toHaveCount(0);

    // A drag along the last printed row selects in the terminal itself.
    const last = await box(
      rows.locator("> div").filter({ hasText: conversationLine(lines) }),
    );
    const selection = panel.locator(".xterm-selection > div");
    await expect(selection).toHaveCount(0);
    await page.mouse.move(last.x + 2, last.y + last.height / 2);
    await page.mouse.down();
    await page.mouse.move(last.x + 150, last.y + last.height / 2, {
      steps: 4,
    });
    await page.mouse.up();
    await expect(selection).not.toHaveCount(0);

    // The wheel moves the terminal's scrollback.
    await expect(rows).not.toContainText(conversationLine(1));
    await expectStillHolds(panel, conversationLine(1));
    expect(sent).toEqual([]);
  });
});
