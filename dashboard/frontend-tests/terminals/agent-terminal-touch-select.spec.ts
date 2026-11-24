import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { tapWhereShown } from "../navigation/board-touch-page.ts";
import {
  terminalInput,
  terminalStatus,
} from "../sessions/session-terminal-page.ts";
import { openAgain, reconnect } from "./terminal-input-controls.ts";
import {
  expectPausedOverScreen,
  expectRowsInPlace,
  pausedLines,
  pausedText,
  returnToTerminal,
  selectOutput,
  selectPausedRange,
} from "./terminal-paused-output.ts";
import {
  mountTouchTerminal,
  showsRow,
  tapLiveScreen,
} from "./terminal-touch-input.ts";

test("Select keeps paused output unchanged while the attached terminal reads on", async () => {
  const { attachment, sent } = await mountTouchTerminal(
    "Phone select session",
    {
      openingLines: ["attached select01", "first output"],
    },
  );
  const sized = attachment.sizes.length;
  const input = terminalInput.element();
  if (input instanceof HTMLElement) input.blur();

  await selectOutput();
  await expect.element(terminalInput).not.toHaveFocus();
  await expectPausedOverScreen();
  await expectRowsInPlace();
  const paused = pausedLines();
  expect(paused.slice(0, 2)).toEqual(["attached select01", "first output"]);

  attachment.print("printed while paused\r\n");
  await showsRow("printed while paused");
  expect(pausedLines()).toEqual(paused);
  await expect.element(terminalStatus).toBeEmptyDOMElement();
  expect(
    pausedText().closest("[aria-live], [role=status], [role=alert]"),
  ).toBeNull();
  await tapWhereShown(pausedText());
  expect(pausedLines()).toEqual(paused);
  await expect.element(terminalInput).not.toHaveFocus();

  await returnToTerminal();
  await showsRow("printed while paused");
  await expect.element(terminalInput).not.toHaveFocus();
  await tapLiveScreen();
  await userEvent.keyboard("!");
  await expect.poll(sent).toEqual(["!"]);
  await showsRow("!");
  expect(attachment.sizes).toHaveLength(sized);
});

async function keepsTheRemainingScreen(ending: "end" | "disconnect") {
  const { attachment } = await mountTouchTerminal(
    "Phone select after attachment",
    {
      openingLines: ["attached select01", "last words", "before it went"],
    },
  );
  attachment[ending]();
  const [cue, action] =
    ending === "end"
      ? (["The terminal ended", openAgain] as const)
      : (["Disconnected from the session", reconnect] as const);
  await expect
    .element(terminalStatus.getByText(cue, { exact: false }))
    .toBeVisible();
  await tapLiveScreen();

  await selectOutput();
  await expectPausedOverScreen();
  await expectRowsInPlace();
  expect(selectPausedRange("words", "before it").text).toBe("words\nbefore it");

  await returnToTerminal();
  await showsRow("before it went");
  await expect.element(action).toBeVisible();
}

test("an ended attachment keeps its remaining screen selectable and offers Open again", async () => {
  await keepsTheRemainingScreen("end");
});

test("a disconnected attachment keeps its remaining screen selectable and offers Reconnect", async () => {
  await keepsTheRemainingScreen("disconnect");
});
