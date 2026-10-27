// What a journey expects of an unconfirmed Cursor stop: its retained
// explanation on the entry and the kept record, and a replacement launch
// in the same workspace blocked until the explicit override.
import { expect, type Locator, type Page } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { startSessionField } from "../launchStoryCardPage.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import { keptRecord } from "./cursorStart.ts";
import { keptRecords } from "./cursorSessionRecovery.ts";
import { occupyRunner } from "./cursorRunnerJourney.ts";
import { launchWaitMs } from "./launchWait.ts";

// Stops the runner, occupies its address, and reloads until the entry in
// this section reads with the runner unreachable.
export async function entryWithRunnerUnreachable(
  page: Page,
  home: string,
  section: Locator,
): Promise<{ entry: Locator; release: () => Promise<void> }> {
  await stopCursorRunner(home);
  const release = await occupyRunner(home);
  await reloadUntilRead(page);
  const entry = section.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  return { entry, release };
}

// The entry reads Stop unconfirmed with each remaining-state phrase, and
// the kept record for this session retains that same explanation.
export async function expectRetainedUnconfirmed(
  entry: Locator,
  home: string,
  sessionId: string,
  ...phrases: readonly string[]
): Promise<LaunchRecord> {
  await expect(entry).toContainText("Stop unconfirmed");
  const record = keptRecord(home);
  expect(record.session.sessionId).toBe(sessionId);
  expect(record.stopUnconfirmed).toContain("Stop unconfirmed");
  for (const phrase of phrases) {
    await expect(entry).toContainText(phrase);
    expect(record.stopUnconfirmed).toContain(phrase);
  }
  return record;
}

// Starting a replacement session in the same workspace is blocked, with
// the competing-writer risk shown, and nothing starts; the explicit
// override then admits the replacement. Admission only closes the dialog:
// the launch itself goes on in the dashboard, so this waits until it has
// settled beside the Start session button. While the stand-in occupies
// the runner's address it can only settle as runner-unreachable, starting
// nothing. Returning earlier would let the caller's release of the
// stand-in land first, and the still-running launch would then find no
// runner accepting and start a real one after the test has moved on.
export async function expectBlockThenAdmitReplacement(
  page: Page,
  home: string,
): Promise<void> {
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill("replacement writer session");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toContainText(
    "A session in this workspace may still be running",
  );
  await expect(dialog).toContainText("competing writer");
  await expect(dialog).toContainText("Stop unconfirmed");
  // Still one kept record: the blocked launch started nothing.
  expect(keptRecords(home)).toHaveLength(1);
  await dialog.getByRole("button", { name: "Start anyway" }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });
  await expect(page.locator(".project-actions .launch-problem")).toHaveText(
    "Launch failed: The Cursor runner on this machine could not be reached. No agent was started.",
    { timeout: launchWaitMs },
  );
  // The admitted launch settled while the runner was unreachable, so it
  // too started nothing.
  expect(keptRecords(home)).toHaveLength(1);
}
