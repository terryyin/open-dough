// An ad hoc session started with typed text only as a journey's setup, on the
// synthetic `claude`: attached, with its terminal closed again.
import type { Locator, Page } from "@playwright/test";
import { parts } from "../dashboardPage.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { closeTerminal, expectTerminalText } from "../terminalScreenPage.ts";
import { startedSessionTerminal } from "./startedSessionTerminal.ts";

// The Taken entry of the ad hoc session started with `text`.
export const takenAdHocSession = (page: Page, text: string): Locator =>
  parts(page).taken.getByRole("article", {
    name: `Ad hoc session for ${text}`,
  });

// Starts an ad hoc session on the selected project, and closes its terminal
// once the session is attached there.
export async function startAdHocAndClose(
  page: Page,
  project: string,
  text: string,
): Promise<void> {
  const dialog = startSessionDialog(page, project);
  await startSession(page, project).click();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const entry = takenAdHocSession(page, text);
  const panel = await startedSessionTerminal(page, entry);
  await expectTerminalText(panel, "attached");
  await closeTerminal(panel);
}
