import { sessionAction } from "./support/sessionEntryDisclosure.ts";
// Stop on a held Cursor session, at the real page/server boundary with
// the fake Cursor runner: a confirmed stop ends the held client through
// the runner and reads stopped with the record un-done; an unconfirmed
// stop retains its explanation naming the remaining state, preserves
// reopen/recovery, and blocks a replacement session in the same
// workspace until an explicit override carrying the competing-writer
// risk. Stopping one of several held sessions lives in
// ./agent-session-cursor-stop-several.spec.ts.
import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";
import type { Page } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import {
  holdRunnerSessionsReads,
  rekeepKeptCursorSession,
} from "./support/cursorRunnerHeldReads.ts";
import { markLocallyDone } from "./support/cursorLocalDone.ts";
import {
  entryWithRunnerUnreachable,
  expectBlockThenAdmitReplacement,
  expectRetainedUnconfirmed,
} from "./support/cursorUnconfirmedStop.ts";
import {
  expectNormalizedReading,
  openTakenCursorSession,
} from "./support/cursorSessionReading.ts";
import { keptRecord, workingCursorTest } from "./support/cursorStart.ts";
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
    await expect(await sessionAction(entry, "Stop")).toHaveCount(1);
    // Mark as done stays a separate action; Stop is not it. An active
    // unreported session now also offers the local Mark as done (slice 3),
    // independently of Stop.
    await expect(await sessionAction(entry, "Mark as done")).toHaveCount(1);

    await (await sessionAction(entry, "Stop")).click();

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

    const { entry: again, release } = await entryWithRunnerUnreachable(
      page,
      dashboard.home,
      parts(page).taken,
    );
    try {
      await expect(again).toContainText(cursorRunnerSentence("unreachable"));
      await expect(await sessionAction(again, "Stop")).toHaveCount(1);

      await (await sessionAction(again, "Stop")).click();

      const record = await expectRetainedUnconfirmed(
        again,
        dashboard.home,
        cursor.sessionId,
        "the hangup could not be delivered to the Cursor runner",
        "may still be held and working",
      );
      expect(record.doneAt).toBeUndefined();
      // Reopen and recovery are preserved.
      await expect(
        again.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(1);
      await expect(again.getByRole("button", { name: "Recover" })).toHaveCount(
        1,
      );

      await expectBlockThenAdmitReplacement(page, dashboard.home);
    } finally {
      await release();
    }
  },
);

workingCursorTest(
  "an unconfirmed stop on a locally done Cursor session retains its explanation on the done record, blocks a replacement in the same workspace, and admits one only on explicit override",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    const entry = await openTakenCursorSession(page, origin);
    await closeTerminal(page);
    await expectNormalizedReading(entry, "Working", false);

    const recent = await markLocallyDone(page, entry);
    expect(keptRecord(dashboard.home).doneAt).toBeDefined();
    await expect(await sessionAction(recent, "Stop")).toHaveCount(1);

    const { entry: again, release } = await entryWithRunnerUnreachable(
      page,
      dashboard.home,
      parts(page).recentlyDone,
    );
    try {
      await expect(again).toContainText(cursorRunnerSentence("unreachable"));
      await expect(await sessionAction(again, "Stop")).toHaveCount(1);

      await (await sessionAction(again, "Stop")).click();

      const record = await expectRetainedUnconfirmed(
        again,
        dashboard.home,
        cursor.sessionId,
        "the hangup could not be delivered to the Cursor runner",
        "may still be held and working",
      );
      expect(record.doneAt).toBeDefined();

      await expectBlockThenAdmitReplacement(page, dashboard.home);
    } finally {
      await release();
    }
  },
);

workingCursorTest(
  "a stop the Cursor runner still holds past confirmation reads unconfirmed with the remaining state named and retains its explanation",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(120_000);
    // The runner stand-in is installed before the session opens, so the
    // stop's confirmation reads pass through it; holding them while the
    // runner keeps this session again has it held before the first read
    // is answered, and still held past the confirmation deadline.
    // (Freezing the held client with SIGSTOP cannot show this: the
    // runner ends its tracking on hangup whether or not the frozen
    // client has exited, so its next read already finds nothing held.)
    const gate = await holdRunnerSessionsReads(dashboard.home);
    try {
      const entry = await openTakenCursorSession(page, origin);
      await closeTerminal(page);
      await expectNormalizedReading(entry, "Working", false);
      const client = cursor.attaches()[0];
      expect(client).toBeDefined();

      gate.hold();
      try {
        await (await sessionAction(entry, "Stop")).click();
        // The held client's signal log proves the hangup reached it; the
        // runner keeping this same session again (its keep answer, as
        // recovery asks for) then lands before the held confirmation
        // read is forwarded, so that read already finds it held.
        await expect
          .poll(() => cursor.signals(client?.pid ?? 0), {
            timeout: 5_000,
            intervals: [25, 50, 100, 200],
          })
          .toContain("SIGHUP");
        const kept = await rekeepKeptCursorSession(dashboard.home);
        expect(kept.kind).toBe("kept");
        expect(cursor.attaches()).toHaveLength(2);
      } finally {
        gate.release();
      }
      const record = await expectRetainedUnconfirmed(
        entry,
        dashboard.home,
        cursor.sessionId,
        "still holds this session",
        "may still be working",
      );
      expect(record.doneAt).toBeUndefined();
    } finally {
      await gate.close();
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
    const { entry: again, release } = await entryWithRunnerUnreachable(
      page,
      dashboard.home,
      parts(page).taken,
    );
    try {
      await (await sessionAction(again, "Stop")).click();
      await expect(again).toContainText("Stop unconfirmed");
      expect(keptRecord(dashboard.home).stopUnconfirmed).toContain(
        "Stop unconfirmed",
      );
      // Recovery resumes the held client once the runner can be reached
      // again, and a stop the runner then confirms clears the retention.
      await release();
      await again.getByRole("button", { name: "Recover" }).click();
      await expect(again).toContainText("Working", { timeout: 30_000 });
      await (await sessionAction(again, "Stop")).click();
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
