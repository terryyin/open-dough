import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { terminal, terminalInput } from "../sessions/session-terminal-page.ts";
import {
  actions,
  dictate,
  promptItem,
  promptMenu,
  prompts,
} from "./terminal-input-controls.ts";
import { mountTerminalInput } from "./terminal-input-mount.ts";

test("terminal Tab remains input", async () => {
  const { attachment, sent } = await mountTerminalInput();
  attachment.print("terminal is ready\r\n");
  await expect
    .element(terminal.getByText("terminal is ready", { exact: true }))
    .toBeVisible();
  await userEvent.keyboard("Review {Tab}");
  await expect.poll(() => sent().join("")).toBe("Review \t");
  await expect.element(terminalInput).toHaveFocus();
});

test("terminal input describes the keyboard shortcut to dictation", async () => {
  await mountTerminalInput();
  await expect
    .element(terminalInput)
    .toHaveAccessibleDescription(/Alt\+F10.*Tab to Dictate into terminal/);
});

test("keyboard action access reaches dictation and quick replies, and Escape restores the menu trigger", async () => {
  await mountTerminalInput();
  await userEvent.keyboard("{Alt>}{F10}{/Alt}");
  await expect.element(actions).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(dictate).toHaveFocus();
  await userEvent.keyboard("{Tab}{Enter}");
  await expect.element(promptItem("OK")).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(promptMenu).not.toBeInTheDocument();
  await expect.element(prompts).toHaveFocus();
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  await expect.element(dictate).toHaveFocus();
});

test("quick replies contain only the fixed phrases", async () => {
  await mountTerminalInput();
  await userEvent.click(prompts);
  await expect.element(promptItem("OK")).toHaveFocus();
  expect(
    promptMenu
      .getByRole("menuitem")
      .elements()
      .map((item) => item.textContent),
  ).toEqual(["OK", "as recommended", "Try again", "Resume", "Please explain"]);
});
