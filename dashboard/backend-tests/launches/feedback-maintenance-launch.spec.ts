// The dashboard server's feedback maintenance check
// (../../server/feedbackMaintenanceCheck.ts) after its session starts: an
// attention report notifies once and keeps the session open with no second
// launch, and an ended or deleted session is not launched again for that due
// date. Not due, off, no block, a failed read, or a developer's open session
// with the same invocation start nothing
// (./feedbackMaintenanceLaunchEligibilityCases.ts). The started session on
// the page: ../../../e2e/launches/feedback-maintenance-launch.spec.ts. Real
// start, launch, installed reporting command, store and gh path; Claude,
// GitHub and the notification sender are fakes. Checks run every 100 ms;
// "nothing more" is asserted only after the server has asked GitHub, or
// listed the sessions, again, never after a sleep.

import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { attempts, deleteRecord } from "../../tests/agentLaunchBoundary.ts";
import { expect, test } from "../../tests/dashboardTest.ts";
import { publishMovingOrigin } from "../../tests/publishedOrigin.ts";
import { reportingThrough } from "../../tests/support/reportedLaunch.ts";
import {
  afterFurtherListings,
  messages,
} from "../../tests/support/sessionAlerts.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";
import { dayFromToday } from "../../tests/support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  launchedInput,
  maintenanceRecords,
  pushWatchList,
  serverOn,
  turnOn,
  watchListDue,
} from "../../tests/support/feedbackMaintenanceServer.ts";

test("an attention report notifies once and keeps the session open with no second launch; ended and deleted without the date advancing, it is not launched again", async ({
  github,
}) => {
  const origin = await startOrigin(queuedReadyRepository().please());
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
