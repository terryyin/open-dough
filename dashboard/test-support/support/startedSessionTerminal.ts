// The terminal of a session a journey started only as its setup. The journey
// does not depend on whether the start presented that terminal: when the page
// shows none once the startup has ended, the session's entry opens it with
// Open terminal, as a developer would. A journey whose promise is the
// presentation itself does not use this.
import { expect, type Locator, type Page } from "@playwright/test";
import { expectQuietAdHocActionsRow } from "../launchStoryCardPage.ts";
import { openTerminalFromEntry, terminalPanel } from "../terminalScreenPage.ts";
import { launchWaitMs } from "./launchWait.ts";

// `entry` is the started session's entry, which may not be listed yet, and
// the page shows no other session's terminal. A terminal covering a narrow
// page hides the Board, entry included, from every reader, so a presented
// terminal stands for the start as well as the listed entry does: the entry
// is asked for only to open a terminal the start did not present. The page
// ends a startup's progress and presents its terminal together, so with the
// progress gone the panel is there or will not come by itself.
export async function startedSessionTerminal(
  page: Page,
  entry: Locator,
): Promise<Locator> {
  const panel = terminalPanel(page);
  await expect(panel.or(entry)).not.toHaveCount(0, { timeout: launchWaitMs });
  await expectQuietAdHocActionsRow(page);
  if ((await panel.count()) === 0) await openTerminalFromEntry(entry);
  await expect(panel).toHaveCount(1);
  return panel;
}
