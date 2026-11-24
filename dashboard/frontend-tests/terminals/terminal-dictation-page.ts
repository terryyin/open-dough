import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import type { audioInput } from "../launches/instruction-voice-page.ts";
import {
  terminal,
  terminalInput,
  terminalStatus,
} from "../sessions/session-terminal-page.ts";
import {
  actions,
  dictate,
  tapTerminalControl,
} from "./terminal-input-controls.ts";

export const stopRecording = terminal.getByRole("button", {
  name: "Stop recording",
  exact: true,
});

export function holdTerminalTranscript(text: string) {
  let deliver: () => void = () => {
    throw new Error("No held transcript.");
  };
  const answer = new Promise<{ text: string }>((resolve) => {
    deliver = () => {
      resolve({ text });
    };
  });
  return { answer, deliver };
}

export async function focusActionsByKeyboard() {
  await terminalInput.click();
  await userEvent.keyboard("{Alt>}{F10}{/Alt}");
  await expect.element(actions).toHaveFocus();
}

type DictationInput = "keyboard" | "touch" | "mouse";

async function pressDictationControl(
  control: Locator,
  using: DictationInput,
  key: "{Enter}" | " ",
) {
  if (using === "keyboard") {
    await focusActionsByKeyboard();
    await userEvent.keyboard("{Tab}");
    await expect.element(control).toHaveFocus();
    await userEvent.keyboard(key);
  } else if (using === "touch") {
    await tapTerminalControl(control);
  } else {
    await control.click();
  }
}

export async function beginDictation(using: DictationInput) {
  await pressDictationControl(dictate, using, "{Enter}");
  await expect
    .element(terminalStatus)
    .toHaveTextContent("Recording… Stop recording when you are finished.");
  await expect.element(stopRecording).toBeVisible();
}

export async function stopDictation(
  using: DictationInput,
  capture: ReturnType<typeof audioInput>,
) {
  await capture.recordedAudio();
  await pressDictationControl(stopRecording, using, " ");
  await expect
    .poll(() => capture.tracks().map((track) => track.readyState))
    .toEqual(["ended"]);
}

export async function editAndSubmitTerminal(text: string) {
  await userEvent.keyboard(`{Backspace}${text}{Enter}`);
}
