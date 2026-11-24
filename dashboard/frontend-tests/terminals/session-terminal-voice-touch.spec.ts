import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { InstructionTranscriptionSource } from "../../src/instructionTranscriptionSource.ts";
import { audioInput } from "../launches/instruction-voice-page.ts";
import {
  terminal,
  terminalClose,
  terminalInput,
} from "../sessions/session-terminal-page.ts";
import {
  beginDictation,
  editAndSubmitTerminal,
  stopDictation,
} from "./terminal-dictation-page.ts";
import {
  dictate,
  prompts,
  tapTerminalControl,
} from "./terminal-input-controls.ts";
import {
  mountTouchTerminal,
  showsRow,
  tapLiveScreen,
} from "./terminal-touch-input.ts";

test("touch dictation restores input focus and leaves its transcript editable until Enter", async () => {
  const capture = audioInput();
  const text = "the session header";
  const transcribe = vi
    .fn<InstructionTranscriptionSource["transcribe"]>()
    .mockResolvedValue({ text });
  const { sent } = await mountTouchTerminal("Phone dictation", {
    transcription: { configured: () => Promise.resolve(true), transcribe },
  });
  await tapLiveScreen();
  await userEvent.keyboard("Review ");
  await beginDictation("touch");
  await stopDictation("touch", capture);
  await expect
    .poll(() => sent().filter((input) => input === text))
    .toEqual([text]);
  expect(transcribe.mock.lastCall?.[0].size).toBeGreaterThan(0);
  await showsRow(`Review ${text}`);
  await expect.element(terminalInput).toHaveFocus();
  expect(sent().some((input) => /[\r\n]/.test(input))).toBe(false);

  const beforeEdit = sent().length;
  await userEvent.keyboard("X");
  await editAndSubmitTerminal(" please");
  await expect
    .poll(() => sent().slice(beforeEdit).join(""))
    .toBe("X\u007f please\r");
});

async function phoneActionsFit(height: number) {
  await mountTouchTerminal("Phone terminal actions");
  await page.viewport(390, height);
  const markDone = terminal.getByRole("button", {
    name: "Mark as done",
    exact: true,
  });
  const buttons = [dictate, prompts, markDone, terminalClose];
  for (const button of buttons) await expect.element(button).toBeVisible();
  await expect
    .poll(() => {
      const [first, second, third, ...remaining] = buttons.map((button) =>
        button.element().getBoundingClientRect(),
      );
      if (!first || !second || !third) return false;
      return (
        first.x < second.x &&
        second.x < third.x &&
        [first, second, third, ...remaining].every(
          (rect) =>
            rect.left >= 0 &&
            rect.top >= 0 &&
            rect.right <= window.innerWidth &&
            rect.bottom <= window.innerHeight &&
            rect.width >= 44 &&
            rect.height >= 44,
        )
      );
    })
    .toBe(true);
  await tapTerminalControl(terminalClose);
  await expect.element(terminal).not.toBeInTheDocument();
}

test("phone terminal actions stay ordered and touch sized at height 844", async () => {
  await phoneActionsFit(844);
});

test("phone terminal actions stay ordered and touch sized at height 400", async () => {
  await phoneActionsFit(400);
});
