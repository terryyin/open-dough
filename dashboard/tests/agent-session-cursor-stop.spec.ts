// Stop on a held Cursor session, at the real page/server boundary with
// the fake Cursor runner: a confirmed stop ends the held client through
// the runner and reads stopped with the record un-done; an unconfirmed
// stop retains its explanation naming the remaining state, preserves
// reopen/recovery, and blocks a replacement session in the same
// workspace until an explicit override carrying the competing-writer
// risk.
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";
import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";
import type { Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { occupyRunner } from "./support/cursorRunnerJourney.ts";
import {
  expectNormalizedReading,
  openTakenCursorSession,
} from "./support/cursorSessionReading.ts";
import { keptRecord, workingCursorTest } from "./support/cursorStart.ts";
import { keptRecords } from "./support/cursorSessionRecovery.ts";
import { startSessionField } from "./launchCardPage.ts";
import { expect } from "./support/cursorStart.ts";

// The launch presents the session's terminal beside the entry; closing
// that panel leaves the kept client held and the entry clickable.
async function closeTerminal(page: Page): Promise<void> {
  const panel = page.getByRole("region", { name: "Terminal" });
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
}

workingCursorTest(
  "Stop on an active working Cursor session ends the held fake client, reads stopped, and keeps the record un-done with reopen offered",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    await closeTerminal(page);
    await expectNormalizedReading(entry, "Working", false);
    const client = cursor.attaches()[0];
    expect(client).toBeDefined();
    await expect(entry.getByRole("button", { name: "Stop" })).toHaveCount(1);
    // Mark as done stays a separate action; Stop is not it. An active
    // unreported session now also offers the local Mark as done (slice 3),
    // independently of Stop.
    await expect(
      entry.getByRole("button", { name: "Mark as done" }),
    ).toHaveCount(1);

    await entry.getByRole("button", { name: "Stop" }).click();

    await expect(entry).toContainText("Session stopped.");
    await expect
      .poll(() => cursor.signals(client?.pid ?? 0))
      .toContain("SIGHUP");
    const record = keptRecord(dashboard.home);
    expect(record.doneAt).toBeUndefined();
    expect(record.stopUnconfirmed).toBeUndefined();
    expect(record.session.sessionId).toBe(cursor.sessionId);
    // The entry now reads the agent not running, and reopen/recovery stay
    // offered for the saved conversation.
    await reloadUntilRead(page);
    const again = parts(page).taken.locator(".session-entry");
    await expect(again).toHaveCount(1);
    await expect(again).toContainText("The agent is not running.");
    await expect(
      again.getByRole("button", { name: "Open terminal" }),
    ).toHaveCount(1);
    await expect(again.getByRole("button", { name: "Recover" })).toHaveCount(1);
    expect(keptRecord(dashboard.home).doneAt).toBeUndefined();
  },
);

workingCursorTest(
  "an unconfirmed stop names the remaining state, is retained on the record, preserves recovery, blocks a replacement in the same workspace, and admits one only on explicit override",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    await closeTerminal(page);
    await expectNormalizedReading(entry, "Working", false);

    await stopCursorRunner(dashboard.home);
    const release = await occupyRunner(dashboard.home);
    try {
      await reloadUntilRead(page);
      const again = parts(page).taken.locator(".session-entry");
      await expect(again).toHaveCount(1);
      await expect(again).toContainText(cursorRunnerSentence("unreachable"));
      await expect(again.getByRole("button", { name: "Stop" })).toHaveCount(1);

      await again.getByRole("button", { name: "Stop" }).click();

      await expect(again).toContainText("Stop unconfirmed");
      await expect(again).toContainText(
        "the hangup could not be delivered to the Cursor runner",
      );
      await expect(again).toContainText("may still be held and working");
      const record = keptRecord(dashboard.home);
      expect(record.session.sessionId).toBe(cursor.sessionId);
      expect(record.doneAt).toBeUndefined();
      expect(record.stopUnconfirmed).toContain("Stop unconfirmed");
      expect(record.stopUnconfirmed).toContain("may still be held and working");
      // Reopen and recovery are preserved.
      await expect(
        again.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(1);
      await expect(again.getByRole("button", { name: "Recover" })).toHaveCount(
        1,
      );

      // Starting a replacement session in the same workspace is blocked,
      // with the competing-writer risk shown, and nothing starts.
      await page
        .getByRole("button", { name: "Start session in Open Dough" })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByRole("combobox", { name: "Host" })
        .selectOption("cursor");
      await startSessionField(dialog).fill("replacement writer session");
      await dialog.getByRole("button", { name: "Start", exact: true }).click();
      await expect(dialog).toContainText(
        "A session in this workspace may still be running",
      );
      await expect(dialog).toContainText("competing writer");
      await expect(dialog).toContainText("Stop unconfirmed");
      // Still one kept record: the blocked launch started nothing.
      expect(keptRecords(dashboard.home)).toHaveLength(1);

      // The explicit override admits the replacement.
      await dialog.getByRole("button", { name: "Start anyway" }).click();
      await expect(dialog).toBeHidden({ timeout: 30_000 });
    } finally {
      await release();
    }
  },
);

workingCursorTest(
  "a later confirmed stop clears a retained unconfirmed stop",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    await closeTerminal(page);
    await expectNormalizedReading(entry, "Working", false);
    await stopCursorRunner(dashboard.home);
    const release = await occupyRunner(dashboard.home);
    try {
      await reloadUntilRead(page);
      const again = parts(page).taken.locator(".session-entry");
      await again.getByRole("button", { name: "Stop" }).click();
      await expect(again).toContainText("Stop unconfirmed");
      expect(keptRecord(dashboard.home).stopUnconfirmed).toContain(
        "Stop unconfirmed",
      );
      // Recovery resumes the held client once the runner can be reached
      // again, and a stop the runner then confirms clears the retention.
      await release();
      await again.getByRole("button", { name: "Recover" }).click();
      await expect(again).toContainText("Working", { timeout: 30_000 });
      await again.getByRole("button", { name: "Stop" }).click();
      await expect(again).toContainText("Session stopped.");
      const record = keptRecord(dashboard.home);
      expect(record.session.sessionId).toBe(cursor.sessionId);
      expect(record.stopUnconfirmed).toBeUndefined();
      expect(record.doneAt).toBeUndefined();
    } finally {
      await release().catch(() => undefined);
    }
  },
);
