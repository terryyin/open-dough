// The dashboard server's feedback maintenance check
// (../../dashboard/server/feedbackMaintenanceCheck.ts): with the standing authorization on
// and Open Dough's published watch list due, one unattached session starts in
// Open Dough's folder with the cycle's invocation and the reporting context,
// listed as "Feedback maintenance", and nothing is notified; restarts and
// later checks start nothing more for that due date. The cycle's own
// completion report settles it as any ad hoc session's does. An attention
// report, an ended or deleted session, and when nothing starts:
// ../../dashboard/backend-tests/launches/feedback-maintenance-due-admission.spec.ts. Real
// start, launch, installed reporting command, store and gh path; Claude,
// GitHub and the notification sender are fakes. Checks run every 100 ms;
// "nothing more" is asserted only after the server has asked GitHub, or
// listed the sessions, again, never after a sleep.

import { queuedReadyRepository } from "../../Distribution/tests/support/queued-repository.mjs";
import type { Page } from "@playwright/test";
import { openDoughFolder } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";

import { reportingThrough } from "../../dashboard/test-support/support/reportedLaunch.ts";
import { afterFurtherListings } from "../../dashboard/test-support/support/sessionAlerts.ts";
import { startOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { dayFromToday } from "../../dashboard/test-support/support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  invocation,
  launchedInput,
  maintenanceRecords,
  serveWatchListHistory,
  serverOn,
  turnOn,
  watchListDue,
  watchListReads,
} from "../../dashboard/test-support/support/feedbackMaintenanceServer.ts";

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
  const moving = await serveWatchListHistory(origin, github);
  const yesterday = dayFromToday(-1);
  const first = await moving.publish(watchListDue(yesterday));
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

    const admitted = await moving.descendantOf(first);
    expectServedHomesReach(github, defaultRepository, admitted);
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
    // Each observed revision's watch list is read once.
    expect(watchListReads(moving)).toEqual([first, admitted]);

    // The cycle advances its due date: read once at the new revision, not due.
    const advanced = await moving.publish(watchListDue(dayFromToday(1)));
    expectServedHomesReach(github, defaultRepository, advanced);
    await expect
      .poll(() => watchListReads(moving))
      .toEqual([first, admitted, advanced]);
    await afterFurtherChecks(moving);
    expect(watchListReads(moving)).toEqual([first, admitted, advanced]);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(await maintenanceRecords(server)).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
