// The dashboard server's feedback maintenance check
// (../../dashboard/server/feedbackMaintenanceCheck.ts): with the standing authorization on
// and Open Dough's published watch list due, one unattached session starts in
// Open Dough's folder with the cycle's invocation and the reporting context,
// listed as "Feedback maintenance", and nothing is notified; restarts and
// later checks start nothing more for that due date. The cycle's own
// completion report settles it as any ad hoc session's does. An attention
// report, an ended or deleted session, and when nothing starts:
// ../../dashboard/backend-tests/launches/feedback-maintenance-launch.spec.ts. Real
// start, launch, installed reporting command, store and gh path; Claude,
// GitHub and the notification sender are fakes. Checks run every 100 ms;
// "nothing more" is asserted only after the server has asked GitHub, or
// listed the sessions, again, never after a sleep.

import { queuedReadyRepository } from "../../tests/support/queued-repository.mjs";
import type { Page } from "@playwright/test";
import { openDoughFolder } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { publishMovingOrigin } from "../../dashboard/tests/publishedOrigin.ts";
import { sessionsSidebarParts } from "../../dashboard/tests/sessionsSidebarPage.ts";
import type { DashboardServer } from "../../dashboard/tests/support/dashboardServer.ts";

import { reportingThrough } from "../../dashboard/tests/support/reportedLaunch.ts";
import { afterFurtherListings } from "../../dashboard/tests/support/sessionAlerts.ts";
import { startOrigin } from "../../dashboard/tests/support/startOrigin.ts";
import { dayFromToday } from "../../dashboard/tests/support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  invocation,
  launchedInput,
  maintenanceRecords,
  pushWatchList,
  serverOn,
  turnOn,
  watchListDue,
  watchListReads,
} from "../../dashboard/tests/support/feedbackMaintenanceServer.ts";

async function sessionsSidebar(page: Page, server: DashboardServer) {
  await page.goto(server.baseURL);
  const { button, entry } = sessionsSidebarParts(page);
  await button.click();
  return entry;
}

test("a reached due date starts one Feedback maintenance session in Open Dough's folder, unnotified; restarts and later checks start none, and a quiet report marks it done until an advanced date ends the due state", async ({
  page,
  github,
}) => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const moving = await publishMovingOrigin(github);
  const yesterday = dayFromToday(-1);
  const first = pushWatchList(moving, watchListDue(yesterday));
  let server = await serverOn(origin, github, "preview");
  try {
    server.claudeScenario("launched");
    turnOn(origin);
    const input = await launchedInput(server);
    const [call] = server.claudeLaunchCalls();
    expect(call?.cwd).toBe(openDoughFolder(server));
    expect(input.split("\n\n")[0]).toBe(invocation);
    expect(input).toContain("Dashboard reporting context:");
    expect(input).toMatch(/^- reporting command: .+$/m);
    const [record] = await maintenanceRecords(server);
    expect(record?.request).toMatchObject({
      workflow: "ad-hoc",
      host: "claude",
      model: "opus",
      instruction: invocation,
      title: "Feedback maintenance",
      maintenance: { due: yesterday },
    });
    expect(record?.request.policy).toBeUndefined();
    expect(record?.doneAt).toBeUndefined();

    const entry = await sessionsSidebar(page, server);
    await expect(entry("Feedback maintenance")).toBeVisible();
    await expect(entry("Feedback maintenance")).toHaveAttribute(
      "title",
      /Open Dough/,
    );

    // Open: later checks and a restart ask GitHub nothing and start nothing.
    await afterFurtherListings(server);
    // Restarted on its port, as a replaced production dashboard is, so the
    // session's reporting command still reaches it.
    const port = Number(new URL(server.origin).port);
    await server.close();
    server = await serverOn(origin, github, "boundary", port);
    server.claudeScenario("launched");
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    // The fake's call log outlives the restart: still the one launch.
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);

    // The cycle reports quietly: done, unnotified, and its date served.
    await reportingThrough(origin, input)({ message: "" });
    await expect
      .poll(async () => (await maintenanceRecords(server))[0]?.doneAt)
      .toEqual(expect.any(String));
    await afterFurtherChecks(moving);
    await afterFurtherListings(server);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);
    // The served revision's watch list is read once, whatever the checks.
    expect(watchListReads(moving)).toEqual([first]);

    // The cycle advances its due date: read once at the new revision, not due.
    const advanced = pushWatchList(moving, watchListDue(dayFromToday(1)));
    await expect.poll(() => watchListReads(moving)).toEqual([first, advanced]);
    await afterFurtherChecks(moving);
    expect(watchListReads(moving)).toEqual([first, advanced]);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(await maintenanceRecords(server)).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
