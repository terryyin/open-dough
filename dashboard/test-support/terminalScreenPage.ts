// One session's Terminal screen, identity, keyboard input and recovery as
// ordinary observations. Fluent Terminal (./terminalPages.ts) and support
// owners reuse these parts; modality-specific protocols keep their own owners.
// Opening and closing compose the existing session-entry Open terminal control
// (./support/startedSessionTerminal.ts) and Side panel Close (./pageLayout.ts).
// typeLine types then Enter; insertTerminalText never submits.

import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { closeSidePanelToBoard, tapWhereShown } from "./pageLayout.ts";
import { openTerminalControl } from "./sessionEntryAccess.ts";
import { sidePanelNamesOf } from "./sidePanelFrame.ts";
export { openTerminalControl } from "./sessionEntryAccess.ts";

export function terminalPanel(page: Page) {
  return page.getByRole("region", { name: "Terminal", exact: true });
}

export function terminalScreenParts(panel: Locator) {
  return {
    rows: panel.locator(".xterm-rows"),
    screen: panel.locator(".xterm-screen"),
    input: panel.locator("textarea.xterm-helper-textarea"),
    heading: panel.getByRole("heading", { level: 2 }),
    // The session's name beside the heading, and where an id would show.
    ...sidePanelNamesOf(panel),
  };
}

export function terminalStatus(panel: Locator) {
  return panel.getByRole("status");
}

export async function expectTerminalText(
  panel: Locator,
  text: string | RegExp,
) {
  await expect(terminalScreenParts(panel).rows).toContainText(text);
}

export async function expectNoTerminalText(
  panel: Locator,
  text: string | RegExp,
) {
  await expect(terminalScreenParts(panel).rows).not.toContainText(text);
}

export async function expectTerminalIdentity(
  panel: Locator,
  title: string | RegExp,
) {
  await expect(terminalScreenParts(panel).heading).toHaveText(title);
}

export async function focusTerminalInput(panel: Locator) {
  await terminalScreenParts(panel).input.focus();
}

export async function expectTerminalInputFocused(panel: Locator) {
  await expect(terminalScreenParts(panel).input).toBeFocused();
}

export async function expectTerminalInputNotFocused(panel: Locator) {
  await expect(terminalScreenParts(panel).input).not.toBeFocused();
}

// Inserts characters without submitting. Never presses Enter.
export async function insertTerminalText(page: Page, text: string) {
  await page.keyboard.type(text);
}

export async function pressTerminalKey(page: Page, key: string) {
  await page.keyboard.press(key);
}

// Types the line, then Enter. Distinct from insertTerminalText.
export async function typeLine(page: Page, line: string) {
  await insertTerminalText(page, line);
  await pressTerminalKey(page, "Enter");
}

// Keyboard focus first reveals a Board column the Side panel pages out.
export async function openTerminalFromEntry(entry: Locator) {
  const open = openTerminalControl(entry);
  await open.focus();
  await open.click();
}

export async function closeTerminal(panel: Locator) {
  await closeSidePanelToBoard(panel);
}

export function openAgainControl(panel: Locator) {
  return panel.getByRole("button", { name: "Open again", exact: true });
}

export function reconnectControl(panel: Locator) {
  return panel.getByRole("button", { name: "Reconnect", exact: true });
}

export async function openTerminalAgain(panel: Locator) {
  await openAgainControl(panel).click();
}

export async function reconnectTerminal(panel: Locator) {
  await reconnectControl(panel).click();
}

export function terminalPromptsControl(panel: Locator) {
  return panel.getByRole("button", { name: "Prompts", exact: true });
}

export function terminalPromptsMenu(panel: Locator) {
  return panel.getByRole("menu", { name: "Prompts", exact: true });
}

export type TerminalInteraction = "mouse" | "touch" | "keyboard";

export async function activateTerminalControl(
  control: Locator,
  using: TerminalInteraction,
) {
  if (using === "touch") await tapWhereShown(control);
  else if (using === "keyboard") await control.press("Enter");
  else await control.click();
}

export async function writeTerminalInput(panel: Locator, text: string) {
  await focusTerminalInput(panel);
  await insertTerminalText(panel.page(), text);
}

export async function replaceLastTerminalCharacter(
  panel: Locator,
  replacement: string,
) {
  await pressTerminalKey(panel.page(), "Backspace");
  await insertTerminalText(panel.page(), replacement);
}

export async function submitTerminalInput(panel: Locator) {
  await pressTerminalKey(panel.page(), "Enter");
}

export async function focusTerminalActions(panel: Locator) {
  await pressTerminalKey(panel.page(), "Alt+F10");
}

export async function focusTerminalDictation(panel: Locator) {
  await focusTerminalActions(panel);
  await pressTerminalKey(panel.page(), "Tab");
}

export async function returnToTerminalDictation(panel: Locator) {
  await pressTerminalKey(panel.page(), "Shift+Tab");
}

export async function openTerminalPrompts(
  panel: Locator,
  { using = "mouse" }: { using?: TerminalInteraction } = {},
) {
  if (using === "keyboard") {
    await focusTerminalDictation(panel);
    await pressTerminalKey(panel.page(), "Tab");
  }
  await activateTerminalControl(terminalPromptsControl(panel), using);
  return terminalPromptsMenu(panel);
}

export async function chooseTerminalPrompt(
  panel: Locator,
  phrase: string,
  { using = "mouse" }: { using?: TerminalInteraction } = {},
) {
  const menu = await openTerminalPrompts(panel, { using });
  const choice = menu.getByRole("menuitem", { name: phrase, exact: true });
  await activateTerminalControl(choice, using);
  await expect(menu).toHaveCount(0);
}

export async function dismissTerminalPrompts(panel: Locator) {
  await pressTerminalKey(panel.page(), "Escape");
}

export async function expectTerminalActionFocused(
  panel: Locator,
  name: string,
) {
  await expect(panel.getByRole("button", { name, exact: true })).toBeFocused();
}

export async function expectTerminalActionsFocused(panel: Locator) {
  await expect(
    panel.getByRole("group", { name: "Session actions", exact: true }),
  ).toBeFocused();
}

export async function expectTerminalPromptFocused(
  panel: Locator,
  name: string,
) {
  await expect(
    terminalPromptsMenu(panel).getByRole("menuitem", { name, exact: true }),
  ).toBeFocused();
}

export async function expectTerminalPromptChoices(
  panel: Locator,
  phrases: readonly string[],
) {
  await expect(terminalPromptsMenu(panel).getByRole("menuitem")).toHaveText([
    ...phrases,
  ]);
}

export async function expectTerminalPromptsClosed(panel: Locator) {
  await expect(terminalPromptsMenu(panel)).toHaveCount(0);
}

export async function expectTerminalInputDescription(
  panel: Locator,
  description: string | RegExp,
) {
  await expect(terminalScreenParts(panel).input).toHaveAccessibleDescription(
    description,
  );
}
