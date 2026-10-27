// The dashboard server's feedback maintenance check
// (../server/feedbackMaintenanceCheck.ts): with the standing authorization on
// and Open Dough's published watch list due, one unattached session starts in
// Open Dough's folder with the cycle's invocation and the reporting context,
// listed as "Feedback maintenance", and nothing is notified; restarts, later
// checks, an ended or deleted session, and an open one start nothing more for
// that due date. The cycle's own completion report settles it as any ad hoc
// session's does. Not due, off, no block, a failed read, or a developer's
// open session with the same invocation start nothing. Real start, launch,
// installed reporting command, store and gh path; Claude, GitHub and the
// notification sender are fakes. Checks run every 100 ms; "nothing more" is
// asserted only after the server has asked GitHub, or listed the sessions,
// again, never after a sleep.

import type { Page } from "@playwright/test";
import {
  attempts,
  deleteRecord,
  openDoughFolder,
} from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

import { reportingThrough } from "./support/reportedLaunch.ts";
import { afterFurtherListings, messages } from "./support/sessionAlerts.ts";
import { startOrigin } from "./support/startOrigin.ts";
import { dayFromToday } from "./support/feedbackMaintenanceDue.ts";
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
} from "./support/feedbackMaintenanceServer.ts";

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
  test.setTimeout(180_000);
  const origin = await startOrigin();
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

test("an attention report notifies once and keeps the session open with no second launch; ended and deleted without the date advancing, it is not launched again", async ({
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  pushWatchList(moving, watchListDue(dayFromToday(-1)));
  const server = await serverOn(origin, github);
  try {
    server.claudeScenario("launched");
    turnOn(origin);
    const input = await launchedInput(server);
    const [record] = await maintenanceRecords(server);
    const session = record?.session.sessionId ?? "";

    const report = reportingThrough(origin, input);
    await report({
      message: "Terry Talks has no findings record; one response needs you.",
    });
    await expect.poll(() => server.notifierCalls().length).toBe(1);
    await afterFurtherListings(server);
    expect(server.notifierCalls()).toHaveLength(1);
    expect((await maintenanceRecords(server))[0]?.doneAt).toBeUndefined();
    expect(server.claudeLaunchCalls()).toHaveLength(1);

    // The session ends without the date advancing and its record is deleted:
    // its launch attempt still serves the date, which is not launched again.
    server.claudeSessionBecomes(session, "forgotten");
    const deleted = await deleteRecord(server, {
      source: "open-dough",
      session,
    });
    expect(JSON.parse(deleted.body)).toEqual({ kind: "deleted" });
    expect(await maintenanceRecords(server)).toEqual([]);
    expect(
      (await attempts(server)).map(({ request }) => request),
    ).toContainEqual(
      expect.objectContaining({ maintenance: expect.anything() }),
    );
    await afterFurtherChecks(moving);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    // The ended session may alert as unavailable, as any session does; the
    // report is still notified once and no start is notified.
    expect(
      messages(server).filter((message) => message !== "Session unavailable"),
    ).toEqual(["Unread report: Completed with attention"]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

import "./feedbackMaintenanceLaunchEligibilityCases.ts";
