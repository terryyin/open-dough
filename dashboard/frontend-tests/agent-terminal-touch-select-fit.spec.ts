// The paused terminal text that phone Select shows, where the screen under it
// is not simply the latest output at full height: after an application that
// scrolls its own output was swiped to an earlier screen, and when the
// visible area shrinks under a soft keyboard or turns with the device. Runs
// through an explicit terminal WebSocket substitute; see
// ./agent-terminal-touch-select.spec.ts for the other variants.

import { expect, test } from "../tests/support/frontendApp.ts";
import {
  openFrontendTerminalByTouch,
  reportedSize,
  travelOverRows,
} from "../tests/support/frontendTouchTerminal.ts";
import {
  conversationLine,
  selfScrollingApplication,
} from "../tests/support/terminalSubstituteApplication.ts";
import { box } from "../tests/pageLayout.ts";
import { resizeUntilArranged } from "../tests/sidePanelWidthPage.ts";
import { pausedHidden } from "../tests/terminalPausedScrollPage.ts";
import {
  expectNoTerminalText,
  expectTerminalText,
} from "../tests/terminalScreenPage.ts";
import {
  expectLive,
  expectPaused,
  expectPausedOverScreen,
  pausedLines,
  pausedText,
  selectKey,
  selectPausedRange,
  selectedText,
} from "../tests/terminalSelectPage.ts";
import { phoneLaunchTouchViewport } from "../tests/touchLaunchPage.ts";
import {
  clearSoftKeyboardViewport,
  expectControlInVisualViewport,
  focusByTouch,
  scrollByTouch,
  simulateSoftKeyboardViewport,
  tapTerminalKey,
} from "../tests/touchTerminalPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

const { portrait, landscape } = phoneLaunchTouchViewport;
test.use({ viewport: portrait, hasTouch: true });

const session = (title: string) =>
  makeMe.aLaunchRecord
    .adHoc({ instruction: "select", title })
    .launchedAt("2026-10-01T00:00:00.000Z")
    .inClaudeSession({ sessionId: "select-fit-1", shortId: "selfit01" })
    .please();

test("after an application scrolled itself, Select pauses that earlier screen, and a finger on it reaches neither the application nor the terminal", async ({
  page,
  frontendServices,
}) => {
  const lines = 60;
  const shown = 10;
  const latest = lines - shown + 1;
  const { panel, screen, input, sent, sizes } =
    await openFrontendTerminalByTouch(
      page,
      frontendServices,
      session("Phone select scrolled session"),
      { application: selfScrollingApplication({ lines, shown }) },
    );
  await expectTerminalText(panel, conversationLine(lines));
  await focusByTouch(panel);
  // Five and a half rows of finger travel show a screen five lines earlier.
  const steps = 5;
  const travel = await travelOverRows(screen, reportedSize(sizes).rows, steps);
  await scrollByTouch(page, screen, travel);
  const earliest = latest - steps;
  await expectTerminalText(panel, conversationLine(earliest));
  await expectNoTerminalText(panel, conversationLine(lines));
  const swiped = sent.length;

  await tapTerminalKey(panel, "Select");
  await expectPaused(panel);
  await expectPausedOverScreen(panel);
  expect((await pausedLines(panel)).slice(0, shown + 1)).toEqual([
    ...Array.from({ length: shown }, (...[, row]) =>
      conversationLine(earliest + row),
    ),
    // The draft row, with the space the application printed after its mark.
    "> ",
  ]);
  // The application holds its conversation; the terminal holds this screen
  // and no scrollback, so the paused text is that screen and no more.
  expect(await pausedLines(panel)).toHaveLength(reportedSize(sizes).rows);
  // Ready to copy from: a range across two of its lines selects.
  const range = `${conversationLine(earliest + 1)}\n${conversationLine(earliest + 2)}`;
  expect(
    await selectPausedRange(
      panel,
      conversationLine(earliest + 1),
      conversationLine(earliest + 2),
    ),
  ).toBe(range);

  // The same stroke on the paused text is the browser's own: the application
  // is given no wheel, so its screen is where it was on return.
  await scrollByTouch(page, pausedText(panel), travel);
  await tapTerminalKey(panel, "Select");
  await expectLive(panel);
  await expectTerminalText(panel, conversationLine(earliest));
  await expectNoTerminalText(panel, conversationLine(earliest - 1));
  await input.press("!");
  await expect.poll(() => sent.slice(swiped)).toEqual(["!"]);
});

test("the paused text keeps to the visible area above a soft keyboard, where a finger scrolls it, and after rotation", async ({
  page,
  frontendServices,
}) => {
  const { panel, sent } = await openFrontendTerminalByTouch(
    page,
    frontendServices,
    session("Phone select fit session"),
  );
  await expectTerminalText(panel, "Claude Code");
  await focusByTouch(panel);
  await tapTerminalKey(panel, "Select");
  await expectPaused(panel);
  const text = pausedText(panel);
  const paused = await pausedLines(panel);
  expect(paused.slice(0, 2)).toEqual(["attached abcdef12", "Claude Code"]);
  const expectPausedFitsVisibleArea = async () => {
    await expectPausedOverScreen(panel);
    await expectControlInVisualViewport(text);
    await expectControlInVisualViewport(selectKey(panel));
    await expectPaused(panel);
    expect(await pausedLines(panel)).toEqual(paused);
  };

  await test.step("above a soft keyboard, the whole paused screen is reached by an ordinary finger stroke", async () => {
    await simulateSoftKeyboardViewport(page, 320);
    await expect
      .poll(async () => (await box(panel)).height)
      .toBeCloseTo(320, 0);
    await expectPausedFitsVisibleArea();
    expect((await pausedHidden(panel)).below).toBeGreaterThan(100);
    await scrollByTouch(page, text, -100, "vertical", undefined, text);
    await expect
      .poll(async () => (await pausedHidden(panel)).above)
      .toBeGreaterThan(50);
    // The device, not the dashboard, would select: the stroke selected nothing.
    expect(await selectedText(panel)).toBe("");
  });

  await test.step("after rotation", async () => {
    await clearSoftKeyboardViewport(page);
    await resizeUntilArranged(panel, landscape);
    await expectPausedFitsVisibleArea();
  });

  await tapTerminalKey(panel, "Select");
  await expectLive(panel);
  await expectTerminalText(panel, "Claude Code");
  expect(sent).toEqual([]);
});
