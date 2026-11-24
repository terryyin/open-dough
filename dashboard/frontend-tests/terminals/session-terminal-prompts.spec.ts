import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { useTouchScreen, portrait } from "../navigation/board-touch-page.ts";
import {
  terminal,
  terminalInput,
  terminalStatus,
} from "../sessions/session-terminal-page.ts";
import {
  choosePrompt,
  openAgain,
  tapTerminalControl,
  unfocusedPromptButtons,
} from "./terminal-input-controls.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";

async function openPromptTerminal(byTouch: boolean) {
  if (byTouch) await useTouchScreen();
  unfocusedPromptButtons();
  const press = byTouch
    ? tapTerminalControl
    : (control: Locator) => userEvent.click(control);
  const mounted = await mountTerminalInput(
    byTouch ? { viewport: portrait } : {},
  );
  return { ...mounted, press };
}

async function literalPrompt(phrase: string, prefix: string, byTouch: boolean) {
  const { sent, press } = await openPromptTerminal(byTouch);
  if (prefix) await userEvent.keyboard(prefix);
  await choosePrompt(phrase, press);
  await expect.poll(() => sent().join("")).toBe(prefix + phrase);
  expect(sent().filter((text) => text === phrase)).toEqual([phrase]);
  await expect.element(terminalInput).toHaveFocus();
  await expect
    .element(terminal.getByText(prefix + phrase, { exact: true }))
    .toBeVisible();
  const beforeEdit = sent().length;
  await userEvent.keyboard("{Backspace}!{Enter}");
  await expect.poll(() => sent().slice(beforeEdit).join("")).toBe("\u007f!\r");
}

async function endedPrompt(byTouch: boolean) {
  const { attachment, sent, press } = await openPromptTerminal(byTouch);
  attachment.end();
  await expect
    .element(terminalStatus.getByText("The terminal ended", { exact: false }))
    .toBeVisible();
  await choosePrompt("OK", press);
  await expect
    .element(
      terminalStatus.getByText("Choose Open again, then open Prompts again.", {
        exact: true,
      }),
    )
    .toBeVisible();
  expect(sent()).toEqual([]);
  await press(openAgain);
  await expect.element(openAgain).not.toBeInTheDocument();
  await expect
    .element(terminal.getByText("Claude Code", { exact: true }))
    .toBeVisible();
  expect(sent()).toEqual([]);
  await choosePrompt("as recommended", press);
  await expect.poll(sent).toEqual(["as recommended"]);
  await expect.element(terminalInput).toHaveFocus();
}

test("a desktop prompt inserts literal editable input and requires deliberate Enter", async () => {
  await literalPrompt("OK", "", false);
});

test("a phone prompt appends literal editable input and requires deliberate Enter", async () => {
  await literalPrompt("as recommended", "Review ", true);
});

test("a desktop ended attachment rejects a preset and recovery requires a new choice", async () => {
  await endedPrompt(false);
});

test("a phone ended attachment rejects a preset and recovery requires a new choice", async () => {
  await endedPrompt(true);
});
