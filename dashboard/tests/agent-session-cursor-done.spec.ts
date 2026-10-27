// Mark as done on a Cursor session is a local dashboard acknowledgement
// only (slice 3): at the real page/server boundary with the fake Cursor
// runner, marking an active unreported working session moves it to
// Recently done with local-only wording, sets only the local done mark,
// and does not hang the held client up. A locally done session later
// observed still held/working shows that native state as it is and
// still offers Stop, which then works. The report-backed path is
// covered by ./agent-completion-cursor.spec.ts.
import type { Page } from "@playwright/test";
import {
  expectNormalizedReading,
  openTakenCursorSession,
} from "./support/cursorSessionReading.ts";
import {
  expect,
  keptRecord,
  workingCursorTest,
} from "./support/cursorStart.ts";
import { markAsDone } from "./support/markDone.ts";
import {
  markLocallyDone,
  markLocallyDoneFromPanel,
} from "./support/cursorLocalDone.ts";

const localDoneWording =
  "Done is a dashboard-local name only; marking it done did not stop the native session.";

async function closeTerminal(page: Page): Promise<void> {
  const panel = page.getByRole("region", { name: "Terminal" });
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
}

workingCursorTest(
  "Mark as done on an active unreported working Cursor session moves it to Recently done with local-only wording, sets only the local mark, and does not stop the session",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    await closeTerminal(page);
    await expectNormalizedReading(entry, "Working", false);
    const client = cursor.attaches()[0];
    expect(client).toBeDefined();
    await expect(entry.getByRole("button", { name: "Stop" })).toHaveCount(1);
    await expect(markAsDone(entry)).toHaveCount(1);
    const signalsBefore = cursor.signals(client?.pid ?? 0);
    const callsBefore = cursor.calls().length;

    const recent = await markLocallyDone(page, entry);

    await expect(recent).toContainText(localDoneWording);
    await expect(recent).not.toContainText("Named done-");
    await expect(recent).not.toContainText("Intended name");
    await expect(recent).not.toContainText("could not be stopped");
    const record = keptRecord(dashboard.home);
    expect(record.session.sessionId).toBe(cursor.sessionId);
    expect(record.doneAt).toBeDefined();
    expect(record.doneProblem).toBeUndefined();
    expect(record.stopUnconfirmed).toBeUndefined();
    // No hangup reached the held fake client and no new native call ran:
    // the session was not stopped by the mark.
    expect(cursor.signals(client?.pid ?? 0)).toBe(signalsBefore);
    expect(cursor.signals(client?.pid ?? 0)).not.toContain("SIGHUP");
    expect(cursor.calls()).toHaveLength(callsBefore);
  },
);

workingCursorTest(
  "Mark as done from the open terminal moves an active Cursor session to Recently done with local-only wording, sets only the local mark, and does not stop the session",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    const panel = page.getByRole("region", { name: "Terminal" });
    await expect(panel.locator(".xterm-rows")).toContainText(/\S/u);
    await expectNormalizedReading(entry, "Working", false);
    const client = cursor.attaches()[0];
    expect(client).toBeDefined();
    await expect(
      panel.locator("header").getByRole("button", { name: "Mark as done" }),
    ).toHaveCount(1);
    const signalsBefore = cursor.signals(client?.pid ?? 0);
    const callsBefore = cursor.calls().length;

    const recent = await markLocallyDoneFromPanel(page, panel);

    await expect(panel).toHaveCount(0);
    await expect(recent).toContainText(localDoneWording);
    const record = keptRecord(dashboard.home);
    expect(record.session.sessionId).toBe(cursor.sessionId);
    expect(record.doneAt).toBeDefined();
    expect(record.doneProblem).toBeUndefined();
    expect(record.stopUnconfirmed).toBeUndefined();
    expect(cursor.signals(client?.pid ?? 0)).toBe(signalsBefore);
    expect(cursor.signals(client?.pid ?? 0)).not.toContain("SIGHUP");
    expect(cursor.calls()).toHaveLength(callsBefore);
  },
);

workingCursorTest(
  "a locally done Cursor session later observed still held/working shows Working and offers Stop, and Stop then works",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    await closeTerminal(page);
    await expectNormalizedReading(entry, "Working", false);
    const client = cursor.attaches()[0];
    expect(client).toBeDefined();

    const recent = await markLocallyDone(page, entry);
    expect(keptRecord(dashboard.home).doneAt).toBeDefined();

    // Still held and working: the done entry shows that native state as
    // it is, not a termination claim, and Stop stays available.
    await expectNormalizedReading(recent, "Working", false);
    await expect(recent).toContainText(localDoneWording);
    await expect(recent.getByRole("button", { name: "Stop" })).toHaveCount(1);

    await recent.getByRole("button", { name: "Stop" }).click();

    await expect(recent).toContainText("Session stopped.");
    await expect
      .poll(() => cursor.signals(client?.pid ?? 0))
      .toContain("SIGHUP");
    const record = keptRecord(dashboard.home);
    expect(record.session.sessionId).toBe(cursor.sessionId);
    // Stop remains independent: it does not clear the local done mark.
    expect(record.doneAt).toBeDefined();
    expect(record.stopUnconfirmed).toBeUndefined();
  },
);
