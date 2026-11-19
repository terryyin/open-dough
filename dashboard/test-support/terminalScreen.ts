// The Terminal screen a scenario already has open. Fluent Terminal
// (./terminalPages.ts) is the cue-sheet owner for the Side panel journeys;
// this binding reuses the procedural parts (./terminalScreenPage.ts) and does
// not run that sheet. Voice, touch, paste and native host protocols keep
// their own owners. The scenario supplies expected text, keys and phrases;
// sent bytes, records and protocol calls stay in the scenario.

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  chooseTerminalPrompt,
  closeTerminal,
  dismissTerminalPrompts,
  expectNoTerminalText,
  expectTerminalActionFocused,
  expectTerminalActionsFocused,
  expectTerminalIdentity,
  expectTerminalInputDescription,
  expectTerminalInputFocused,
  expectTerminalInputNotFocused,
  expectTerminalPromptChoices,
  expectTerminalPromptFocused,
  expectTerminalPromptsClosed,
  expectTerminalText,
  focusTerminalActions,
  focusTerminalDictation,
  focusTerminalInput,
  insertTerminalText,
  openTerminalAgain,
  openTerminalPrompts,
  pressTerminalKey,
  reconnectTerminal,
  replaceLastTerminalCharacter,
  returnToTerminalDictation,
  submitTerminalInput,
  terminalPanel,
  terminalScreenParts,
  terminalStatus,
  typeLine as typeTerminalLine,
  writeTerminalInput,
  type TerminalInteraction,
} from "./terminalScreenPage.ts";

class SessionTerminalScreen {
  readonly panel;
  readonly input;
  readonly #screen;
  readonly #status;

  constructor(page: Page) {
    this.panel = terminalPanel(page);
    const parts = terminalScreenParts(this.panel);
    this.input = parts.input;
    this.#screen = parts.screen;
    this.#status = terminalStatus(this.panel);
  }

  // The xterm surface, as when a key is aimed at the session.
  async clickScreen() {
    await this.#screen.click();
    return this;
  }

  async expectText(text: string | RegExp) {
    await expectTerminalText(this.panel, text);
    return this;
  }

  async expectNoText(text: string | RegExp) {
    await expectNoTerminalText(this.panel, text);
    return this;
  }

  async expectIdentity(title: string | RegExp) {
    await expectTerminalIdentity(this.panel, title);
    return this;
  }

  async expectInputFocused() {
    await expectTerminalInputFocused(this.panel);
    return this;
  }

  async expectInputNotFocused() {
    await expectTerminalInputNotFocused(this.panel);
    return this;
  }

  async expectShown() {
    await expect(this.panel).toBeVisible();
    return this;
  }

  async expectClosed() {
    await expect(this.panel).toHaveCount(0);
    return this;
  }

  containsKeyboard() {
    return this.panel.evaluate((element) =>
      element.contains(document.activeElement),
    );
  }

  async expectInputDescription(description: string | RegExp) {
    await expectTerminalInputDescription(this.panel, description);
    return this;
  }

  async focusInput() {
    await focusTerminalInput(this.panel);
    return this;
  }

  // Focuses the input, then inserts characters. Does not submit.
  async writeInput(text: string) {
    await writeTerminalInput(this.panel, text);
    return this;
  }

  // Inserts characters into the focused terminal. Does not submit.
  async insertText(text: string) {
    await insertTerminalText(this.panel.page(), text);
    return this;
  }

  async pressKey(key: string) {
    await pressTerminalKey(this.panel.page(), key);
    return this;
  }

  // Types the line, then Enter.
  async typeLine(line: string) {
    await typeTerminalLine(this.panel.page(), line);
    return this;
  }

  async replaceLastCharacter(replacement: string) {
    await replaceLastTerminalCharacter(this.panel, replacement);
    return this;
  }

  async submitInput() {
    await submitTerminalInput(this.panel);
    return this;
  }

  async close() {
    await closeTerminal(this.panel);
    return this;
  }

  async openAgain() {
    await openTerminalAgain(this.panel);
    return this;
  }

  async reconnect() {
    await reconnectTerminal(this.panel);
    return this;
  }

  async focusActions() {
    await focusTerminalActions(this.panel);
    return this;
  }

  async expectActionsFocused() {
    await expectTerminalActionsFocused(this.panel);
    return this;
  }

  async focusDictation() {
    await focusTerminalDictation(this.panel);
    return this;
  }

  async expectActionFocused(name: string) {
    await expectTerminalActionFocused(this.panel, name);
    return this;
  }

  async returnToDictation() {
    await returnToTerminalDictation(this.panel);
    return this;
  }

  async openPrompts({ using = "mouse" }: { using?: TerminalInteraction } = {}) {
    await openTerminalPrompts(this.panel, { using });
    return this;
  }

  async choosePrompt(
    phrase: string,
    { using = "mouse" }: { using?: TerminalInteraction } = {},
  ) {
    await chooseTerminalPrompt(this.panel, phrase, { using });
    return this;
  }

  async dismissPrompts() {
    await dismissTerminalPrompts(this.panel);
    return this;
  }

  async expectPromptFocused(name: string) {
    await expectTerminalPromptFocused(this.panel, name);
    return this;
  }

  async expectPromptChoices(phrases: readonly string[]) {
    await expectTerminalPromptChoices(this.panel, phrases);
    return this;
  }

  async expectPromptsClosed() {
    await expectTerminalPromptsClosed(this.panel);
    return this;
  }

  async expectStatus(text: string | RegExp) {
    await expect(this.#status).toContainText(text);
    return this;
  }

  async expectStatusEmpty() {
    await expect(this.#status).toBeEmpty();
    return this;
  }
}

// The Terminal screen on `page`, without opening or closing it.
export function terminalScreen(page: Page) {
  return new SessionTerminalScreen(page);
}
