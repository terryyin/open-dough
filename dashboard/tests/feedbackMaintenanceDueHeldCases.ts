// Cases registered by ./feedback-maintenance-due-row.spec.ts.
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { openDoughFolder } from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";

import { publishMovingOrigin } from "./publishedOrigin.ts";

import { dayFromToday } from "./support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  launchedInput,
  pushWatchList,
  serverOn,
  turnOn,
  watchListDue,
} from "./support/feedbackMaintenanceServer.ts";

import { startOrigin } from "./support/startOrigin.ts";
import {
  row,
  settingsLine,
  openDashboard,
  openSettings,
} from "./feedbackMaintenanceDuePage.ts";

test("a launch held because Open Dough's default main has existing changes says so on the row and in settings, and starts once they are gone", async ({
  page,
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const due = dayFromToday(-1);
  pushWatchList(moving, watchListDue(due));
  const server = await serverOn(origin, github, "preview");
  const leftover = path.join(openDoughFolder(server), "notes.txt");
  try {
    server.claudeScenario("launched");
    writeFileSync(leftover, "unfinished\n");
    turnOn(origin);
    await afterFurtherChecks(moving);
    await afterFurtherChecks(moving);
    expect(server.claudeLaunchCalls()).toEqual([]);

    const reason = "default main has existing changes (1 changed path)";
    await openDashboard(page, server);
    await expect(row(page)).toHaveText(
      `Feedback maintenance due since ${due}; not started: ${reason}`,
    );
    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Due since ${due}. Last automatic launch: not started (due ${due}): ${reason}.`,
    );

    rmSync(leftover);
    await launchedInput(server);
    await openDashboard(page, server);
    await expect(row(page)).toHaveText("Feedback maintenance is running");
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
