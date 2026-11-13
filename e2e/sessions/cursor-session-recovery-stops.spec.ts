// Recover stops without a replacement agent: missing workspace, trust, an
// unreachable runner, and an unclassified resume exit leave the explanation
// and no held client.
import { rmSync } from "node:fs";
import path from "node:path";
import { cursorRunnerSentence } from "../../dashboard/src/cursorRunnerSessions.ts";
import { stopCursorRunner } from "../../dashboard/server/hosts/cursor/runnerClient.ts";
import { cursorRunnerAddressFile } from "../../dashboard/server/hosts/cursor/runnerPaths.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { occupyRunner } from "../../dashboard/tests/support/cursorRunnerJourney.ts";
import {
  expectReadingWithoutScreenLabel,
  openTakenCursorSession,
  projectedSessions,
  cursorRecord,
} from "../../dashboard/tests/support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  endHeldClient,
  keptRecords,
} from "../../dashboard/tests/support/cursorSessionRecovery.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";
import { unclassifiedCursorExit } from "../../dashboard/tests/support/fakeCursor.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { keepLaunchStore } from "../../dashboard/tests/support/launchStore.ts";

test("missing workspace, trust, unreachable runner, and unclassified exit explain and leave no agent", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await openTakenCursorSession(page, origin);
  await endHeldClient(page, cursor, dashboard.home);
  const [record] = keptRecords(dashboard.home);
  if (record === undefined || record.session.host !== "cursor") {
    throw new Error("Missing Cursor record.");
  }
  const missing = path.join(origin.machine, "missing-cursor-workspace");
  rmSync(missing, { recursive: true, force: true });
  keepLaunchStore(dashboard, {
    "open-dough": [
      {
        ...record,
        session: {
          ...record.session,
          continuation: {
            ...record.session.continuation,
            workspace: missing,
          },
        },
      },
    ],
  });
  await page.reload();
  let entry = parts(page).taken.locator(".session-entry");
  const attachesBeforeMissing = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expect(entry.locator(".launch-problem")).toContainText(
    "was not found on this machine",
  );
  expect(cursor.attaches()).toHaveLength(attachesBeforeMissing);

  keepLaunchStore(dashboard, { "open-dough": [record] });
  cursor.setAttachMode("trust");
  await page.reload();
  entry = parts(page).taken.locator(".session-entry");
  const beforeTrust = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expect(entry.locator(".launch-problem")).toContainText(
    "Workspace trust is required",
  );
  await expect
    .poll(() => cursor.attaches().length)
    .toBeGreaterThan(beforeTrust);
  await expect
    .poll(async () => {
      const answer = await projectedSessions(page);
      return cursorRecord(answer, cursor.sessionId)?.sessionState;
    })
    .toEqual({ kind: "unknown", label: agentNotRunningLabel });

  cursor.setAttachMode(undefined);
  await stopCursorRunner(dashboard.home);
  const release = await occupyRunner(dashboard.home);
  try {
    await reloadUntilRead(page);
    entry = parts(page).taken.locator(".session-entry");
    await expectReadingWithoutScreenLabel(
      entry,
      cursorRunnerSentence("unreachable"),
    );
    const beforeUnreachable = cursor.attaches().length;
    await entry.getByRole("button", { name: "Recover" }).click();
    await expect(entry.locator(".launch-problem")).toContainText(
      "could not be reached",
    );
    expect(cursor.attaches()).toHaveLength(beforeUnreachable);
  } finally {
    await release();
    rmSync(cursorRunnerAddressFile(dashboard.home), { force: true });
  }

  await reloadUntilRead(page);
  entry = parts(page).taken.locator(".session-entry");
  await expectReadingWithoutScreenLabel(
    entry,
    cursorRunnerSentence("not-running"),
  );
  cursor.setAttachMode("exit");
  const beforeExit = cursor.attaches().length;
  await entry.getByRole("button", { name: "Recover" }).click();
  await expect(entry.locator(".launch-problem")).toContainText(
    unclassifiedCursorExit,
  );
  await expect.poll(() => cursor.attaches().length).toBeGreaterThan(beforeExit);
  await expect
    .poll(async () => {
      const answer = await projectedSessions(page);
      return cursorRecord(answer, cursor.sessionId)?.sessionState;
    })
    .toEqual({ kind: "unknown", label: agentNotRunningLabel });
});
