// One session's Terminal screen and identity as ordinary observations.
// Fluent Terminal (./terminalPages.ts) and support owners reuse these parts;
// modality-specific protocols keep their own owners. Opening and closing
// compose the existing session-entry Open terminal control
// (./support/startedSessionTerminal.ts) and Side panel Close (./pageLayout.ts).

import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { closeSidePanel } from "./pageLayout.ts";

export function terminalPanel(page: Page) {
  return page.getByRole("region", { name: "Terminal", exact: true });
}

export function terminalScreenParts(panel: Locator) {
  return {
    rows: panel.locator(".xterm-rows"),
    screen: panel.locator(".xterm-screen"),
    input: panel.locator("textarea.xterm-helper-textarea"),
    heading: panel.getByRole("heading", { level: 2 }),
  };
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

export function openTerminalControl(entry: Locator) {
  return entry.getByRole("button", { name: "Open terminal", exact: true });
}

// Keyboard focus first reveals a Board column the Side panel pages out.
export async function openTerminalFromEntry(entry: Locator) {
  const open = openTerminalControl(entry);
  await open.focus();
  await open.click();
}

export async function closeTerminal(panel: Locator) {
  await closeSidePanel(panel);
}
