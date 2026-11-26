// The row and settings explain why the automatic launch was held.
import { queuedReadyRepository } from "../../Distribution/tests/support/queued-repository.mjs";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { openDoughFolder } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";

import { dayFromToday } from "../../dashboard/test-support/support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  launchedInput,
  serveWatchListHistory,
  serverOn,
  turnOn,
  watchListDue,
} from "../../dashboard/test-support/support/feedbackMaintenanceServer.ts";

import { startOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  row,
  settingsLine,
  openDashboard,
  openSettings,
} from "../../dashboard/test-support/feedbackMaintenanceDuePage.ts";

test("a launch held because Open Dough's execution checkout has existing changes says so on the row and in settings, and starts once they are gone", async ({
  page,
  github,
}) => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const moving = await serveWatchListHistory(origin, github);
  const due = dayFromToday(-1);
  const revision = await moving.publish(watchListDue(due));
  const server = await serverOn(origin, github, "preview");
  const leftover = path.join(openDoughFolder(server), "notes.txt");
  try {
    server.claudeScenario("launched");
    writeFileSync(leftover, "unfinished\n");
    turnOn(origin);
    await afterFurtherChecks(moving);
    await afterFurtherChecks(moving);
    expect(server.claudeLaunchCalls()).toEqual([]);

    const reason = "execution checkout has existing changes (1 changed path)";
    await openDashboard(page, server, revision);
    await expect(row(page)).toHaveText(
      `Feedback maintenance due since ${due}; not started: ${reason}`,
    );
    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Due since ${due}. Last automatic launch: not started (due ${due}): ${reason}.`,
    );

    rmSync(leftover);
    await launchedInput(server);
    await openDashboard(page, server, await moving.descendantOf(revision));
    await expect(row(page)).toHaveText("Feedback maintenance is running");
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
